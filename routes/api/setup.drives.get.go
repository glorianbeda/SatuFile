package api

import (
	"encoding/json"
	"net/http"

	"github.com/satufile/satufile/auth"
)

// SetupDrivesGet handles GET /api/setup/drives
func SetupDrivesGet(deps *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user := auth.GetUserFromContext(r.Context())
		if user == nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		// Get storage info for the configured data directory
		// We wrap it in a list to maintain API compatibility with the frontend
		drive, err := deps.Detector.GetPathUsage(deps.DataDir)
		if err != nil {
			http.Error(w, "Failed to detect storage: "+err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode([]interface{}{drive})
	}
}
