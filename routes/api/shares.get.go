package api

import (
	"encoding/json"
	"net/http"
)

// SharesGet handles GET /api/shares
// Returns all active share links for the admin user
func SharesGet(deps *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Get all shares from storage
		links, err := deps.Share.ListLinks()
		if err != nil {
			http.Error(w, "Failed to get shares", http.StatusInternalServerError)
			return
		}

		// Return as JSON
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(links)
	}
}
