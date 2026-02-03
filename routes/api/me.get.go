package api

import (
	"encoding/json"
	"net/http"

	"github.com/satufile/satufile/auth"
	"github.com/satufile/satufile/system/partition"
	"github.com/satufile/satufile/users"
)

// MeResponse extends UserInfo with additional runtime information
type MeResponse struct {
	*users.UserInfo
	StorageUsedGb       float64 `json:"storage_used_gb,omitempty"`
	StorageAvailableGb  float64 `json:"storage_available_gb,omitempty"`
	StorageUsagePercent float64 `json:"storage_usage_percent,omitempty"`
	IsNearlyFull        bool    `json:"is_nearly_full,omitempty"`
	IsFull              bool    `json:"is_full,omitempty"`
}

// MeGet handles GET /api/me
func MeGet(deps *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user := auth.GetUserFromContext(r.Context())
		if user == nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		response := MeResponse{
			UserInfo: user.ToInfo(),
		}

		// Add storage usage information if storage is allocated
		if user.StoragePath != "" && user.StorageAllocationGb > 0 {
			usedGb, err := partition.CalculateStorageUsage(user.StoragePath)
			if err != nil {
				// If calculation fails, set to 0
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

			response.StorageUsedGb = usedGb
			response.StorageAvailableGb = availableGb
			response.StorageUsagePercent = usagePercent
			response.IsNearlyFull = usagePercent >= 90
			response.IsFull = usagePercent >= 100
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	}
}
