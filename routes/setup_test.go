package routes

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"testing"
	"time"

	"github.com/gorilla/mux"
	"github.com/satufile/satufile/auth"
	"github.com/satufile/satufile/routes/api"
	"github.com/satufile/satufile/system/detection"
	"github.com/satufile/satufile/users"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// MockDetector implements detection.Detector
type MockDetector struct {
	Drives []detection.DriveInfo
	Err    error
}

func (m *MockDetector) GetDrives() ([]detection.DriveInfo, error) {
	return m.Drives, m.Err
}

func (m *MockDetector) GetPathUsage(path string) (detection.DriveInfo, error) {
	if len(m.Drives) > 0 {
		return m.Drives[0], m.Err
	}
	return detection.DriveInfo{}, m.Err
}

// MockPartitionManager implements partition.StorageManager
type MockPartitionManager struct {
	CreatedPath string
	Err         error
}

func (m *MockPartitionManager) InitializeStorage(username string, sizeGb int) (string, error) {
	if m.Err != nil {
		return "", m.Err
	}
	// Mimic the real behavior but in a safe path if needed, or just return a string
	m.CreatedPath = filepath.Join("/tmp", "data", "cloud-storage", username)
	return m.CreatedPath, nil
}

func (m *MockPartitionManager) GetStoragePath(username string) string {
	return filepath.Join("/tmp", "data", "cloud-storage", username)
}

type TestEnv struct {
	DB            *gorm.DB
	UserRepo      *users.Repository
	Router        *mux.Router
	MockDetector  *MockDetector
	MockPartition *MockPartitionManager
	Token         string
	User          *users.User
}

func setupTestEnv(t *testing.T) *TestEnv {
	// Setup DB
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect database: %v", err)
	}

	userRepo := users.NewRepository(db)
	userRepo.Migrate()

	// Setup mocks
	mockDetector := &MockDetector{
		Drives: []detection.DriveInfo{
			{
				Device:       "/dev/sda1",
				Mount:        "/",
				SizeGb:       100,
				AvailableGb:  50,
				ReadOnly:     false,
				Filesystem:   "ext4",
			},
		},
	}
	mockPartition := &MockPartitionManager{}

	apiDeps := &api.Deps{
		UserRepo:       userRepo,
		DataDir:        "/tmp",
		Detector:       mockDetector,
		StorageManager: mockPartition,
	}

	r := mux.NewRouter()
	auth.SetSecretKey("test-secret-key")
	RegisterAPIRoutes(r, apiDeps)

	return &TestEnv{
		DB:            db,
		UserRepo:      userRepo,
		Router:        r,
		MockDetector:  mockDetector,
		MockPartition: mockPartition,
	}
}

func (env *TestEnv) createUser(t *testing.T, username string, step string) {
	hashedPwd, _ := users.HashPassword("DefaultPassword1!")
	user := &users.User{
		Username:           username,
		Password:           hashedPwd,
		ForceSetup:         true,
		SetupStep:          step,
		IsDefaultPassword:  true,
		MustChangePassword: true,
	}
	if err := env.UserRepo.Create(user); err != nil {
		t.Fatalf("Failed to create user: %v", err)
	}
	env.User = user

	token, err := auth.GenerateToken(user, time.Hour)
	if err != nil {
		t.Fatalf("Failed to generate token: %v", err)
	}
	env.Token = token
}

func (env *TestEnv) makeRequest(method, path string, body interface{}) *httptest.ResponseRecorder {
	return env.makeRequestWithBadHeader(method, path, body, "Bearer "+env.Token)
}

func (env *TestEnv) makeRequestWithBadHeader(method, path string, body interface{}, headerValue string) *httptest.ResponseRecorder {
	var reqBody []byte
	if body != nil {
		reqBody, _ = json.Marshal(body)
	}
	req := httptest.NewRequest(method, path, bytes.NewReader(reqBody))
	req.Header.Set("Authorization", headerValue)
	w := httptest.NewRecorder()
	env.Router.ServeHTTP(w, req)
	return w
}

func TestSetupFlow(t *testing.T) {
	env := setupTestEnv(t)
	env.createUser(t, "testuser", "password")

	// 0. Test with extra space in header (should work now)
	w := env.makeRequestWithBadHeader("GET", "/api/setup/status", nil, "Bearer  "+env.Token)
	if w.Code != http.StatusOK {
		t.Errorf("Extra space in Bearer failed: %d Body: %s", w.Code, w.Body.String())
	}

	// 1. Check Setup Status

	// 2. Set Password
	pwdPayload := map[string]string{
		"currentPassword": "DefaultPassword1!",
		"newPassword":     "NewSecurePassword123!",
		"confirmPassword": "NewSecurePassword123!",
	}
	w = env.makeRequest("POST", "/api/setup/password", pwdPayload)
	if w.Code != http.StatusOK {
		t.Errorf("POST /setup/password failed: %d Body: %s", w.Code, w.Body.String())
	}
	
	updatedUser, _ := env.UserRepo.GetByUsername("testuser")
	if updatedUser.SetupStep != "drive" {
		t.Errorf("Expected step 'drive', got %s", updatedUser.SetupStep)
	}

	// 3. Get Drives
	w = env.makeRequest("GET", "/api/setup/drives", nil)
	if w.Code != http.StatusOK {
		t.Errorf("GET /setup/drives failed: %d", w.Code)
	}

	// 4. Create Partition
	partPayload := map[string]interface{}{
		"drive":   "/",
		"size_gb": 10,
	}
	w = env.makeRequest("POST", "/api/setup/partition", partPayload)
	if w.Code != http.StatusOK {
		t.Errorf("POST /setup/partition failed: %d Body: %s", w.Code, w.Body.String())
	}

	updatedUser, _ = env.UserRepo.GetByUsername("testuser")
	if updatedUser.SetupStep != "complete" {
		t.Errorf("Expected step 'complete', got %s", updatedUser.SetupStep)
	}

	// 5. Complete Setup
	w = env.makeRequest("POST", "/api/setup/complete", nil)
	if w.Code != http.StatusOK {
		t.Errorf("POST /setup/complete failed: %d", w.Code)
	}

	updatedUser, _ = env.UserRepo.GetByUsername("testuser")
	if updatedUser.ForceSetup {
		t.Errorf("Expected ForceSetup false, got true")
	}

	// 6. Verify Settings (Storage Info)
	w = env.makeRequest("GET", "/api/me", nil)
	if w.Code != http.StatusOK {
		t.Errorf("GET /api/me failed: %d", w.Code)
	}
}

func TestSetupRedirect(t *testing.T) {
	env := setupTestEnv(t)
	env.createUser(t, "redirectuser", "password")

	// Accessing /api/me (protected, NOT whitelisted) should return 403 (with my fix)
	// Wait, my fix returns 403 for /api/ routes.
	w := env.makeRequest("GET", "/api/me", nil)
	if w.Code != http.StatusForbidden {
		t.Errorf("Expected 403 Forbidden for non-whitelisted route during setup, got %d", w.Code)
	}

	var resp map[string]string
	json.NewDecoder(w.Body).Decode(&resp)
	if resp["error"] != "setup_required" {
		t.Errorf("Expected error 'setup_required', got %s", resp["error"])
	}
}

func TestSetupResume(t *testing.T) {
	env := setupTestEnv(t)
	// Create user already at "drive" step
	env.createUser(t, "resumeuser", "drive")

	w := env.makeRequest("GET", "/api/setup/status", nil)
	var status map[string]interface{}
	json.NewDecoder(w.Body).Decode(&status)
	if status["step"] != "drive" {
		t.Errorf("Expected step 'drive', got %v", status["step"])
	}

	// Should be able to call partition directly
	partPayload := map[string]interface{}{
		"drive":   "/",
		"size_gb": 10,
	}
	w = env.makeRequest("POST", "/api/setup/partition", partPayload)
	if w.Code != http.StatusOK {
		t.Errorf("POST /setup/partition failed: %d", w.Code)
	}
}

func TestSetupValidation(t *testing.T) {
	env := setupTestEnv(t)
	env.createUser(t, "valuser", "password")

	// 1. Weak Password
	pwdPayload := map[string]string{
		"currentPassword": "DefaultPassword1!",
		"newPassword":     "weak",
		"confirmPassword": "weak",
	}
	w := env.makeRequest("POST", "/api/setup/password", pwdPayload)
	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected 400 for weak password, got %d", w.Code)
	}

	// Advance to drive step manually for next test
	env.User.SetupStep = "drive"
	env.UserRepo.Update(env.User)

		// 2. Invalid Partition Size (Too small)

		partPayload := map[string]interface{}{

			"size_gb": 0,

		}

		w = env.makeRequest("POST", "/api/setup/partition", partPayload)

		if w.Code != http.StatusBadRequest {

			t.Errorf("Expected 400 for too small partition, got %d", w.Code)

		}

	}

	

	

	func TestSetupOptionalCurrentPassword(t *testing.T) {

		env := setupTestEnv(t)

		env.createUser(t, "optpassuser", "password")

	

		// Set password WITHOUT currentPassword

		pwdPayload := map[string]string{

			"newPassword":     "NewSecurePassword123!",

			"confirmPassword": "NewSecurePassword123!",

		}

		w := env.makeRequest("POST", "/api/setup/password", pwdPayload)

		if w.Code != http.StatusOK {

			t.Errorf("POST /setup/password failed with optional current password: %d Body: %s", w.Code, w.Body.String())

		}

	

		updatedUser, _ := env.UserRepo.GetByUsername("optpassuser")

		if updatedUser.SetupStep != "drive" {

			t.Errorf("Expected step 'drive', got %s", updatedUser.SetupStep)

		}

	}

	