package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

// SharePut handles PUT /api/share
// Updates the expiration time of a share link
func SharePut(deps *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Token   string `json:"token"`
			Expires string `json:"expires,omitempty"` // Duration as string (e.g., "24")
			Unit    string `json:"unit,omitempty"`    // "hours", "days", "weeks"
		}

		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}

		if req.Token == "" {
			http.Error(w, "Missing token", http.StatusBadRequest)
			return
		}

		// Parse expires duration
		expiresHours := 24 // Default 24 hours
		if req.Expires != "" && req.Unit != "" {
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
			var hours int
			if _, err := fmt.Sscanf(req.Expires, "%d", &hours); err == nil {
				expiresHours = hours
			}
		}

		// Calculate new expiration time
		expiresAt := time.Now().Add(time.Duration(expiresHours) * time.Hour)

		// Update share link
		if err := deps.Share.UpdateLink(req.Token, expiresAt); err != nil {
			http.Error(w, "Failed to update share link: "+err.Error(), http.StatusInternalServerError)
			return
		}

		// Get updated link to return
		link, err := deps.Share.GetLink(req.Token)
		if err != nil {
			http.Error(w, "Share updated but failed to retrieve", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(link)
	}
}
