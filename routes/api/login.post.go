package api

import (
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"github.com/satufile/satufile/auth"

	"github.com/satufile/satufile/users"
)

// LoginRequest is the login request body
type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// AuthResponse is the auth response with token
type AuthResponse struct {
	Token          string          `json:"token"`
	User           *users.UserInfo `json:"user"`
	SetupRequired  bool            `json:"setupRequired"`
	SetupStep      string          `json:"setupStep,omitempty"`
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

		// Get IP for recording
		ip := r.RemoteAddr
		if cfIP := r.Header.Get("CF-Connecting-IP"); cfIP != "" {
			ip = cfIP
		}

		user, err := deps.UserRepo.GetByUsername(req.Username)
		if err != nil {
			if errors.Is(err, users.ErrUserNotFound) {
				deps.UserRepo.RecordLoginAttempt(req.Username, ip, false)
				http.Error(w, "Invalid credentials", http.StatusUnauthorized)
				return
			}
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}

		// Check lockout
		if user.LockedUntil != nil && user.LockedUntil.After(time.Now()) {
			deps.UserRepo.RecordLoginAttempt(req.Username, ip, false)
			http.Error(w, "Account is temporarily locked. Please try again later.", http.StatusLocked)
			return
		}

		if err := users.CheckPassword(req.Password, user.Password); err != nil {
			deps.UserRepo.RecordLoginAttempt(req.Username, ip, false)
			http.Error(w, "Invalid credentials", http.StatusUnauthorized)
			return
		}

		// Success
		deps.UserRepo.RecordLoginAttempt(req.Username, ip, true)

		token, err := auth.GenerateToken(user, auth.DefaultTokenExpiration)
		if err != nil {
			http.Error(w, "Failed to generate token", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(AuthResponse{
			Token:         token,
			User:          user.ToInfo(),
			SetupRequired: user.ForceSetup || user.IsDefaultPassword,
			SetupStep:     user.SetupStep,
		})
	}
}
