package api

import (
	"encoding/json"
	"net/http"

	"github.com/satufile/satufile/auth"
	"github.com/satufile/satufile/users"
)

// SetupPasswordRequest is the request body for password change during setup
type SetupPasswordRequest struct {
	CurrentPassword string `json:"currentPassword"`
	NewPassword     string `json:"newPassword"`
}

// SetupPasswordPost handles POST /api/setup/password
func SetupPasswordPost(deps *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user := auth.GetUserFromContext(r.Context())
		if user == nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		var req SetupPasswordRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		// Validate input
		if req.NewPassword == "" {
			http.Error(w, "New password is required", http.StatusBadRequest)
			return
		}

		// Only require current password if not in forced setup mode
		if !user.ForceSetup && req.CurrentPassword == "" {
			http.Error(w, "Current password is required", http.StatusBadRequest)
			return
		}

		// Check password length
		if len(req.NewPassword) < 8 {
			http.Error(w, "New password must be at least 8 characters", http.StatusBadRequest)
			return
		}

		// Verify current password if provided or if not in forced setup
		if req.CurrentPassword != "" || !user.ForceSetup {
			if err := users.CheckPassword(req.CurrentPassword, user.Password); err != nil {
				http.Error(w, "Current password is incorrect", http.StatusUnauthorized)
				return
			}
		}

		// Hash new password
		hashedPassword, err := users.HashPassword(req.NewPassword)
		if err != nil {
			http.Error(w, "Failed to hash password", http.StatusInternalServerError)
			return
		}

		// Update password and clear flags
		user.Password = hashedPassword
		user.IsDefaultPassword = false
		user.MustChangePassword = false
		user.SetupStep = "drive"

		if err := deps.UserRepo.Update(user); err != nil {
			http.Error(w, "Failed to update password", http.StatusInternalServerError)
			return
		}

		// Generate new token
		token, err := auth.GenerateToken(user, auth.DefaultTokenExpiration)
		if err != nil {
			http.Error(w, "Failed to generate token", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
			"token":   token,
			"user":    user.ToInfo(),
		})
	}
}
