package api

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/satufile/satufile/auth"
	"github.com/satufile/satufile/users"
)

// Deps holds dependencies for API handlers
type Deps struct {
	UserRepo *users.Repository
}

// LoginRequest is the login request body
type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// AuthResponse is the auth response with token
type AuthResponse struct {
	Token string          `json:"token"`
	User  *users.UserInfo `json:"user"`
}

// LoginPost handles POST /api/login
func LoginPost(deps *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req LoginRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		if req.Username == "" || req.Password == "" {
			http.Error(w, "Username and password required", http.StatusBadRequest)
			return
		}

		user, err := deps.UserRepo.GetByUsername(req.Username)
		if err != nil {
			if errors.Is(err, users.ErrUserNotFound) {
				http.Error(w, "Invalid credentials", http.StatusUnauthorized)
				return
			}
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}

		if err := users.CheckPassword(req.Password, user.Password); err != nil {
			http.Error(w, "Invalid credentials", http.StatusUnauthorized)
			return
		}

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
