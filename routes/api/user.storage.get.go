package api

import (
	"encoding/json"
	"net/http"

	"github.com/satufile/satufile/auth"
	"github.com/satufile/satufile/system/partition"
)

// StorageInfoResponse represents the storage information for a user
type StorageInfoResponse struct {
	StoragePath          string  `json:"storage_path"`
	StorageAllocationGb  int     `json:"storage_allocation_gb"`
	StorageUsedGb        float64 `json:"storage_used_gb"`
	StorageAvailableGb   float64 `json:"storage_available_gb"`
	StorageUsagePercent  float64 `json:"storage_usage_percent"`
	IsNearlyFull         bool    `json:"is_nearly_full"`
	IsFull               bool    `json:"is_full"`
}

// UserStorageGet handles GET /api/user/storage
func UserStorageGet(deps *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user := auth.GetUserFromContext(r.Context())
		if user == nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		// Check if user has storage allocated
		if user.StoragePath == "" || user.StorageAllocationGb == 0 {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]interface{}{
				"storage_allocated": false,
			})
			return
		}

		// Calculate actual storage usage
		usedGb, err := partition.CalculateStorageUsage(user.StoragePath)
		if err != nil {
			// If we can't calculate usage, return allocated info without usage
			usedGb = 0
		}

		availableGb := float64(user.StorageAllocationGb) - usedGb
		if availableGb < 0 {
			availableGb = 0
		}

		usagePercent := (usedGb / float64(user.StorageAllocationGb)) * 100
		if usagePercent > 100 {
			usagePercent = 100
		}

		response := StorageInfoResponse{
			StoragePath:         user.StoragePath,
			StorageAllocationGb: user.StorageAllocationGb,
			StorageUsedGb:       usedGb,
			StorageAvailableGb:  availableGb,
			StorageUsagePercent: usagePercent,
			IsNearlyFull:        usagePercent >= 90,
			IsFull:              usagePercent >= 100,
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	}
}
