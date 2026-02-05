package api

import (
	"encoding/json"
	"net/http"
	"os"
	"path/filepath"
	"sync"
	"time"

	"github.com/satufile/satufile/auth"
	"github.com/satufile/satufile/users"
)

// StorageStats represents detailed storage breakdown
type StorageStats struct {
	Used    int64            `json:"used"`
	Total   int64            `json:"total"`
	Free    int64            `json:"free"`
	Folders map[string]int64 `json:"folders"`
}

// StorageUsage represents simple usage stats
type StorageUsage struct {
	Used  int64 `json:"used"`
	Total int64 `json:"total"`
	Free  int64 `json:"free"`
}

type cachedStats struct {
	Stats     StorageStats
	ExpiresAt time.Time
}

var (
	statsCache = make(map[uint]cachedStats)
	statsMutex sync.RWMutex
)

// StorageStatsGet handles GET /api/storage/stats
func StorageStatsGet(deps *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user := auth.GetUserFromContext(r.Context())
		if user == nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		statsMutex.RLock()
		cache, ok := statsCache[user.ID]
		statsMutex.RUnlock()

		if ok && time.Now().Before(cache.ExpiresAt) {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(cache.Stats)
			return
		}

		stats, err := calculateStats(user)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(stats)
	}
}

// StorageUsageGet handles GET /api/storage/usage
func StorageUsageGet(deps *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user := auth.GetUserFromContext(r.Context())
		if user == nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		statsMutex.RLock()
		cache, ok := statsCache[user.ID]
		statsMutex.RUnlock()

		if ok && time.Now().Before(cache.ExpiresAt) {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(StorageUsage{
				Used:  cache.Stats.Used,
				Total: cache.Stats.Total,
				Free:  cache.Stats.Free,
			})
			return
		}

		stats, err := calculateStats(user)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(StorageUsage{
			Used:  stats.Used,
			Total: stats.Total,
			Free:  stats.Free,
		})
	}
}

func calculateStats(user *users.User) (StorageStats, error) {
	effectiveRoot := user.StoragePath
	stats := StorageStats{
		Folders: make(map[string]int64),
	}

	stats.Used = getDirSize(effectiveRoot)

	if user.StorageAllocationGb > 0 {
		stats.Total = int64(user.StorageAllocationGb) * 1024 * 1024 * 1024
	} else {
		stats.Total = 100 * 1024 * 1024 * 1024
	}

	stats.Free = stats.Total - stats.Used
	if stats.Free < 0 {
		stats.Free = 0
	}

	entries, err := os.ReadDir(effectiveRoot)
	if err == nil {
		for _, entry := range entries {
			if entry.IsDir() && entry.Name() != ".trash" {
				folderPath := filepath.Join(effectiveRoot, entry.Name())
				size := getDirSize(folderPath)
				stats.Folders[entry.Name()] = size
			}
		}
	}

	statsMutex.Lock()
	statsCache[user.ID] = cachedStats{
		Stats:     stats,
		ExpiresAt: time.Now().Add(5 * time.Minute),
	}
	statsMutex.Unlock()

	return stats, nil
}

// getDirSize calculates the total size of a directory recursively
func getDirSize(path string) int64 {
	var size int64

	filepath.Walk(path, func(_ string, info os.FileInfo, err error) error {
		if err != nil {
			return nil
		}
		// Skip .trash folder from calculation if it's encountered during walk?
		// If we are walking root, we WILL encounter .trash.
		// We should skip it to avoid counting trash in "Used" space?
		// The design says "Total Used: 45.2 GB". Trash usually COUNTS towards quota.
		// So we should NOT skip .trash in getDirSize.
		
		if !info.IsDir() {
			size += info.Size()
		}
		return nil
	})

	return size
}
