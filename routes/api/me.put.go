package api

import (
	"encoding/json"
	"net/http"

	"github.com/satufile/satufile/auth"
)

// UpdateProfileRequest is the request body for updating user profile
type UpdateProfileRequest struct {
	Locale       *string `json:"locale,omitempty"`
	ViewMode     *string `json:"viewMode,omitempty"`
	HideDotfiles *bool   `json:"hideDotfiles,omitempty"`
	SingleClick  *bool   `json:"singleClick,omitempty"`
}

// UpdateProfilePut handles PUT /api/me - Update user profile preferences
func UpdateProfilePut(deps *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user := auth.GetUserFromContext(r.Context())
		if user == nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		var req UpdateProfileRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		// Update fields if provided
		if req.Locale != nil {
			user.Locale = *req.Locale
		}
		if req.ViewMode != nil {
			if *req.ViewMode != "list" && *req.ViewMode != "grid" {
				http.Error(w, "viewMode must be 'list' or 'grid'", http.StatusBadRequest)
				return
			}
			user.ViewMode = *req.ViewMode
		}
		if req.HideDotfiles != nil {
			user.HideDotfiles = *req.HideDotfiles
		}
		if req.SingleClick != nil {
			user.SingleClick = *req.SingleClick
		}

		if err := deps.UserRepo.Update(user); err != nil {
			http.Error(w, "Failed to update profile", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(user.ToInfo())
	}
}
