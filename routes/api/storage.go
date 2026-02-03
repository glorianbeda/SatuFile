package api

import (
	"encoding/json"
	"net/http"
	"os"
	"path/filepath"
	"syscall"

	"github.com/satufile/satufile/auth"
)

// StorageStats represents storage usage information
type StorageStats struct {
	Used    int64            `json:"used"`
	Total   int64            `json:"total"`
	Free    int64            `json:"free"`
	Folders map[string]int64 `json:"folders"`
}

// StorageGet handles GET /api/storage - get storage usage stats
func StorageGet(deps *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user := auth.GetUserFromContext(r.Context())
		if user == nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		// Use user's storage path if set, otherwise reject
		effectiveRoot := user.StoragePath
		if effectiveRoot == "" {
			http.Error(w, "Storage not initialized", http.StatusForbidden)
			return
		}

		stats := StorageStats{
			Folders: make(map[string]int64),
		}

		// Get disk space info using syscall
		var stat syscall.Statfs_t
		if err := syscall.Statfs(effectiveRoot, &stat); err == nil {
			// Total space = blocks * block size
			stats.Total = int64(stat.Blocks) * int64(stat.Bsize)
			// Free space = available blocks * block size
			stats.Free = int64(stat.Bavail) * int64(stat.Bsize)
			// Used space = total - free
			stats.Used = stats.Total - stats.Free
		}

		// Calculate per-folder sizes
		entries, err := os.ReadDir(effectiveRoot)
		if err == nil {
			for _, entry := range entries {
				if entry.IsDir() {
					folderPath := filepath.Join(effectiveRoot, entry.Name())
					size := getDirSize(folderPath)
					stats.Folders[entry.Name()] = size
				}
			}
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(stats)
	}
}

// getDirSize calculates the total size of a directory recursively
func getDirSize(path string) int64 {
	var size int64

	filepath.Walk(path, func(_ string, info os.FileInfo, err error) error {
		if err != nil {
			return nil
		}
		if !info.IsDir() {
			size += info.Size()
		}
		return nil
	})

	return size
}
