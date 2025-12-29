package api

import (
	"encoding/json"
	"net/http"

	"github.com/satufile/satufile/auth"
	"github.com/satufile/satufile/users"
)

// ChangePasswordRequest is the request body for changing password
type ChangePasswordRequest struct {
	CurrentPassword string `json:"currentPassword,omitempty"` // Not required for first-login
	NewPassword     string `json:"newPassword"`
	NewUsername     string `json:"newUsername,omitempty"` // Optional
}

// ChangePasswordPost handles POST /api/change-password
func ChangePasswordPost(deps *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user := auth.GetUserFromContext(r.Context())
		if user == nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		var req ChangePasswordRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		// For first-login (mustChangePassword), skip current password validation
		// For normal password change, require current password
		if !user.MustChangePassword {
			if req.CurrentPassword == "" {
				http.Error(w, "Current password is required", http.StatusBadRequest)
				return
			}
			if err := users.CheckPassword(req.CurrentPassword, user.Password); err != nil {
				http.Error(w, "Current password is incorrect", http.StatusUnauthorized)
				return
			}
		}

		// Validate new password strength
		if err := users.ValidatePasswordStrength(req.NewPassword); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// Hash new password
		hashedPassword, err := users.HashPassword(req.NewPassword)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// Update user
		user.Password = hashedPassword
		user.MustChangePassword = false

		// Update username if provided
		if req.NewUsername != "" && req.NewUsername != user.Username {
			// Check if username is taken
			existing, _ := deps.UserRepo.GetByUsername(req.NewUsername)
			if existing != nil {
				http.Error(w, "Username already taken", http.StatusConflict)
				return
			}
			user.Username = req.NewUsername
		}

		if err := deps.UserRepo.Update(user); err != nil {
			http.Error(w, "Failed to update user", http.StatusInternalServerError)
			return
		}

		// Generate new token with updated info
		token, err := auth.GenerateToken(user, auth.DefaultTokenExpiration)
		if err != nil {
			http.Error(w, "Failed to generate token", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(AuthResponse{
			Token: token,
			User:  user.ToInfo(),
		})
	}
}
