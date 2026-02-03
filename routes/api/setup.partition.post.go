package api

import (
	"encoding/json"
	"net/http"

	"github.com/satufile/satufile/auth"
	"github.com/satufile/satufile/system/partition"
)

// SetupPartitionRequest is the request body for partition creation
type SetupPartitionRequest struct {
	Drive  string `json:"drive"`  // Mount point (e.g., "/")
	SizeGb int    `json:"size_gb"`
}

// SetupPartitionPost handles POST /api/setup/partition
func SetupPartitionPost(deps *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user := auth.GetUserFromContext(r.Context())
		if user == nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		var req SetupPartitionRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		// Validate input
		if req.SizeGb < 1 {
			http.Error(w, "Size must be at least 1 GB", http.StatusBadRequest)
			return
		}

		// Validate partition size
		if err := partition.ValidateQuota(req.SizeGb); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// Create partition (now logical storage)
		storagePath, err := deps.StorageManager.InitializeStorage(user.Username, req.SizeGb)
		if err != nil {
			http.Error(w, "Failed to create storage: "+err.Error(), http.StatusInternalServerError)
			return
		}

		// Update user record
		user.StoragePath = storagePath
		user.StorageAllocationGb = req.SizeGb
		user.SetupStep = "complete"

		if err := deps.UserRepo.Update(user); err != nil {
			http.Error(w, "Failed to update user", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success":       true,
			"storage_path":  storagePath,
			"allocated_gb":  req.SizeGb,
		})
	}
}
