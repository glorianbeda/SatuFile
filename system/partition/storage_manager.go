package partition

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

const (
	// DefaultBasePath is the base path for user storage partitions (fallback)
	DefaultBasePath = "satufile-storage"
	// DirPermissions is the default permissions for storage directories
	DirPermissions = 0750
)

// DefaultFolders are the default folders to create in each user's partition
var DefaultFolders = []string{
	"Documents",
	"Pictures",
	"Videos",
	"Audio",
	"Downloads",
}

// READMEContent is the content of the README file created in storage root
const READMEContent = `# SatuFile Cloud Storage

This directory contains your cloud storage files.

## Storage Information

This is your personal storage space. The files you store here are
accessible through the SatuFile web interface.

## Default Folders

The following default folders have been created for you:
- Documents: Store your documents and text files
- Pictures: Store your images and photos
- Videos: Store your video files
- Audio: Store your music and audio files
- Downloads: Files downloaded from the web

## Storage Limits

Your storage allocation is managed by the system. You can view your
current usage in the Settings page of the SatuFile web interface.

## Need Help?

If you need assistance, please contact your system administrator.
`

// StorageManager defines the contract for storage management
type StorageManager interface {
	InitializeStorage(username string, sizeGb int) (string, error)
	GetStoragePath(username string) string
}

// Manager handles storage creation and management
type Manager struct {
	basePath string
}

// Ensure Manager implements StorageManager
var _ StorageManager = (*Manager)(nil)

// NewManager creates a new storage manager
func NewManager(basePath string) *Manager {
	if basePath == "" {
		basePath = DefaultBasePath
	}
	return &Manager{
		basePath: basePath,
	}
}

// InitializeStorage initializes storage for a user (creates directory structure)
func (m *Manager) InitializeStorage(username string, sizeGb int) (string, error) {
	// Sanitize username to prevent path traversal
	safeUsername := sanitizeUsername(username)

	var fullPath string
	// If basePath is absolute, use it directly
	if filepath.IsAbs(m.basePath) {
		fullPath = filepath.Join(m.basePath, safeUsername)
	} else {
		// Otherwise treat as relative (shouldn't happen with correct config, but fallback)
		cwd, _ := os.Getwd()
		fullPath = filepath.Join(cwd, m.basePath, safeUsername)
	}

	// Create the directory with proper permissions
	err := os.MkdirAll(fullPath, DirPermissions)
	if err != nil {
		return "", fmt.Errorf("failed to create directory: %w", err)
	}

	// Create default folders
	for _, folder := range DefaultFolders {
		folderPath := filepath.Join(fullPath, folder)
		if err := os.MkdirAll(folderPath, DirPermissions); err != nil {
			return "", fmt.Errorf("failed to create folder %s: %w", folder, err)
		}
	}

	// Create README file
	readmePath := filepath.Join(fullPath, "README.txt")
	if err := os.WriteFile(readmePath, []byte(READMEContent), 0644); err != nil {
		return "", fmt.Errorf("failed to create README: %w", err)
	}

	return fullPath, nil
}

// GetStoragePath returns the path to a user's storage
func (m *Manager) GetStoragePath(username string) string {
	safeUsername := sanitizeUsername(username)
	if filepath.IsAbs(m.basePath) {
		return filepath.Join(m.basePath, safeUsername)
	}
	cwd, _ := os.Getwd()
	return filepath.Join(cwd, m.basePath, safeUsername)
}

// sanitizeUsername cleans a username to prevent path traversal attacks
func sanitizeUsername(username string) string {
	// Remove any path separators
	username = strings.ReplaceAll(username, "/", "")
	username = strings.ReplaceAll(username, "\\", "")

	// Remove any dot sequences that could be used for traversal
	username = strings.ReplaceAll(username, "..", "")

	// Remove any special characters that could cause issues
	// Keep only alphanumeric, underscore, hyphen, and dot
	var result strings.Builder
	for _, r := range username {
		if (r >= 'a' && r <= 'z') ||
			(r >= 'A' && r <= 'Z') ||
			(r >= '0' && r <= '9') ||
			r == '_' || r == '-' || r == '.' {
			result.WriteRune(r)
		}
	}

	cleaned := result.String()

	// Ensure we don't have an empty username
	if cleaned == "" {
		return "user"
	}

	// Limit length
	if len(cleaned) > 50 {
		cleaned = cleaned[:50]
	}

	return cleaned
}

// ValidateQuota validates that a requested quota size is valid
func ValidateQuota(requestedGb int) error {
	if requestedGb < 1 {
		return fmt.Errorf("storage size must be at least 1 GB")
	}
	return nil
}

// CalculateStorageUsage calculates the storage usage for a partition
func CalculateStorageUsage(storagePath string) (usedGb float64, err error) {
	var totalSize int64

	err = filepath.Walk(storagePath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if !info.IsDir() {
			totalSize += info.Size()
		}
		return nil
	})

	if err != nil {
		return 0, err
	}

	// Convert bytes to GB
	return float64(totalSize) / (1024 * 1024 * 1024), nil
}

// CheckQuota verifies if adding bytesToAdd to the storagePath will exceed maxGb
func CheckQuota(storagePath string, maxGb int, bytesToAdd int64) error {
	usedGb, err := CalculateStorageUsage(storagePath)
	if err != nil {
		return fmt.Errorf("failed to calculate storage usage: %w", err)
	}

	newUsedGb := usedGb + (float64(bytesToAdd) / (1024 * 1024 * 1024))
	if newUsedGb > float64(maxGb) {
		return fmt.Errorf("storage quota exceeded: allocated %d GB, requested operation would result in %.2f GB", maxGb, newUsedGb)
	}

	return nil
}
