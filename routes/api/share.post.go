package api

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/satufile/satufile/share"
)

// SharePost handles POST /api/share
func SharePost(deps *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Path     string `json:"path"`
			Type     string `json:"type"`               // "file" or "folder"
			Expires  string `json:"expires,omitempty"`  // Duration as string (e.g., "24")
			Unit     string `json:"unit,omitempty"`     // "hours", "days", "weeks"
			Password string `json:"password,omitempty"` // Optional password
		}

		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}

		// Parse expires duration
		expiresHours := 24 // Default 24 hours
		if req.Expires != "" && req.Unit != "" {
			// Convert string to hours based on unit
			var hours int
			if _, err := fmt.Sscanf(req.Expires, "%d", &hours); err == nil {
				switch req.Unit {
				case "hours":
					expiresHours = hours
				case "days":
					expiresHours = hours * 24
				case "weeks":
					expiresHours = hours * 24 * 7
				}
			}
		} else if req.Expires != "" {
			// Parse the expires value as number of hours
			var hours int
			if _, err := fmt.Sscanf(req.Expires, "%d", &hours); err == nil {
				expiresHours = hours
			}
		}

		// Create share link
		link, err := share.NewLink(req.Path, req.Type, expiresHours)
		if err != nil {
			http.Error(w, "Failed to create share link", http.StatusInternalServerError)
			return
		}

		// Save share link
		if err := deps.Share.CreateLink(link); err != nil {
			http.Error(w, "Failed to save share link", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(link)
	}
}
