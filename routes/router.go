package routes

import (
	"path/filepath"

	"github.com/gorilla/mux"

	"github.com/satufile/satufile/auth"
	"github.com/satufile/satufile/middleware"
	"github.com/satufile/satufile/routes/api"
	"github.com/satufile/satufile/share"
	"github.com/satufile/satufile/system/detection"
	"github.com/satufile/satufile/system/partition"
	"github.com/satufile/satufile/uploads"
	"github.com/satufile/satufile/users"
)

// RegisterRoutes registers all file-based routes
func RegisterRoutes(r *mux.Router, userRepo *users.Repository, root string, shareStorage share.StorageBackend, uploadsStorage uploads.StorageBackend) {
	// Ensure we use a writable path for user partitions
	absRoot, err := filepath.Abs(root)
	if err != nil {
		absRoot = root // Fallback
	}
	storagePath := filepath.Join(absRoot, "data", "cloud-storage")

	// API dependencies
	apiDeps := &api.Deps{
		UserRepo:       userRepo,
		Share:          shareStorage,
		Uploads:        uploadsStorage,
		DataDir:        root,
		Detector:       detection.NewDetector(),
		StorageManager: partition.NewManager(storagePath),
	}

	RegisterAPIRoutes(r, apiDeps)
}

// RegisterAPIRoutes registers routes using the provided dependencies
func RegisterAPIRoutes(r *mux.Router, apiDeps *api.Deps) {
	// ===== Public Routes =====
	r.HandleFunc("/health", HealthGet()).Methods("GET")

	// API subrouter
	apiRouter := r.PathPrefix("/api").Subrouter()

	// Public API routes
	apiRouter.HandleFunc("/info", api.InfoGet(apiDeps)).Methods("GET")

	// Apply LoginRateLimit to login
	apiRouter.Handle("/login", middleware.LoginRateLimit(api.LoginPost(apiDeps))).Methods("POST")

	apiRouter.HandleFunc("/share/public", api.SharePublicGet(apiDeps, apiDeps.DataDir)).Methods("GET") // Public share access

	// ===== Protected Routes =====
	protectedAPI := apiRouter.NewRoute().Subrouter()
	protectedAPI.Use(auth.RequireAuth(apiDeps.UserRepo))
	protectedAPI.HandleFunc("/renew", api.RenewPost(apiDeps)).Methods("POST")
	protectedAPI.HandleFunc("/me", api.MeGet(apiDeps)).Methods("GET")
	protectedAPI.HandleFunc("/me", api.UpdateProfilePut(apiDeps)).Methods("PUT")
	protectedAPI.HandleFunc("/change-password", api.ChangePasswordPost(apiDeps)).Methods("POST")

	// Setup API routes (bypass setup check via whitelist in middleware)
	protectedAPI.HandleFunc("/setup/status", api.SetupStatusGet(apiDeps)).Methods("GET")
	protectedAPI.HandleFunc("/setup/drives", api.SetupDrivesGet(apiDeps)).Methods("GET")
	protectedAPI.HandleFunc("/setup/password", api.SetupPasswordPost(apiDeps)).Methods("POST")
	protectedAPI.HandleFunc("/setup/partition", api.SetupPartitionPost(apiDeps)).Methods("POST")
	protectedAPI.HandleFunc("/setup/complete", api.SetupCompletePost(apiDeps)).Methods("POST")

	// User storage API
	protectedAPI.HandleFunc("/user/storage", api.UserStorageGet(apiDeps)).Methods("GET")

	// ===== Add new routes below =====
	// Resource routes (file operations)
	protectedAPI.HandleFunc("/resources", api.ResourceGet(apiDeps)).Methods("GET")
	protectedAPI.HandleFunc("/resources/{path:.*}", api.ResourceGet(apiDeps)).Methods("GET")
	protectedAPI.HandleFunc("/resources/{path:.*}", api.ResourcePost(apiDeps)).Methods("POST")
	protectedAPI.HandleFunc("/resources/{path:.*}", api.ResourceDelete(apiDeps)).Methods("DELETE")
	protectedAPI.HandleFunc("/resources/{path:.*}", api.ResourcePatch(apiDeps)).Methods("PATCH")

	// Raw file download
	protectedAPI.HandleFunc("/raw/{path:.*}", api.RawGet(apiDeps)).Methods("GET")

	// Storage usage
	protectedAPI.HandleFunc("/storage", api.StorageStatsGet(apiDeps)).Methods("GET")
	protectedAPI.HandleFunc("/storage/stats", api.StorageStatsGet(apiDeps)).Methods("GET")
	protectedAPI.HandleFunc("/storage/usage", api.StorageUsageGet(apiDeps)).Methods("GET")

	// Search
	protectedAPI.HandleFunc("/search", api.SearchGet(apiDeps)).Methods("GET")

	// Trash endpoints
	protectedAPI.HandleFunc("/trash", api.TrashGet(apiDeps)).Methods("GET")
	protectedAPI.HandleFunc("/trash", api.TrashEmpty(apiDeps)).Methods("DELETE")
	protectedAPI.HandleFunc("/trash/{id}/restore", api.TrashRestore(apiDeps)).Methods("POST")
	protectedAPI.HandleFunc("/trash/{id}", api.TrashDelete(apiDeps)).Methods("DELETE")

	// Share endpoints
	protectedAPI.HandleFunc("/share", api.SharePost(apiDeps)).Methods("POST")
	protectedAPI.HandleFunc("/share", api.SharePut(apiDeps)).Methods("PUT")
	protectedAPI.HandleFunc("/share", api.ShareDelete(apiDeps)).Methods("DELETE")
	protectedAPI.HandleFunc("/shares", api.SharesGet(apiDeps)).Methods("GET")

	// Upload endpoints (resumable uploads)
	protectedAPI.HandleFunc("/uploads", api.UploadCreate(apiDeps)).Methods("POST")
	protectedAPI.HandleFunc("/uploads/{id}", api.UploadChunk(apiDeps)).Methods("PATCH")
	protectedAPI.HandleFunc("/uploads/{id}", api.UploadProgress(apiDeps)).Methods("GET")
	protectedAPI.HandleFunc("/uploads/{id}", api.UploadCancel(apiDeps)).Methods("DELETE")
}
