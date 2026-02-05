package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"

	"github.com/satufile/satufile/auth"
	"github.com/satufile/satufile/share"
)

// SharePost handles POST /api/share
func SharePost(deps *Deps) http.HandlerFunc {
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

		// Validate type
		if req.Type != "file" && req.Type != "folder" {
			http.Error(w, "Invalid type, must be 'file' or 'folder'", http.StatusBadRequest)
			return
		}

		// Validate path exists
		fullPath := filepath.Join(effectiveRoot, req.Path)
		if _, err := os.Stat(fullPath); os.IsNotExist(err) {
			http.Error(w, "File or folder not found", http.StatusNotFound)
			return
		}

		// If folder, validate it's actually a directory
		if req.Type == "folder" {
			info, err := os.Stat(fullPath)
			if err != nil {
				http.Error(w, "Failed to access folder", http.StatusInternalServerError)
				return
			}
			if !info.IsDir() {
				http.Error(w, "Path is not a folder", http.StatusBadRequest)
				return
			}
		}

		// Parse expires duration
		expiresHours := 24 // Default 24 hours
		if req.Expires != "" && req.Unit != "" {
			// Convert string to hours based on unit
			var hours int
			if _, err := fmt.Sscanf(req.Expires, "%d", &hours); err == nil {
				switch req.Unit {
				case "hours", "hour":
					expiresHours = hours
				case "days", "day":
					expiresHours = hours * 24
				case "weeks", "week":
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
