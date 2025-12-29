package api

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/satufile/satufile/users"
)

// SignupRequest is the signup request body
type SignupRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Email    string `json:"email,omitempty"`
}

// SignupPost handles POST /api/signup
func SignupPost(deps *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req SignupRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		if req.Username == "" || req.Password == "" {
			http.Error(w, "Username and password required", http.StatusBadRequest)
			return
		}

		if err := users.ValidatePassword(req.Password, users.DefaultMinPasswordLength); err != nil {
			http.Error(w, "Password must be at least 8 characters", http.StatusBadRequest)
			return
		}

		hashedPassword, err := users.HashPassword(req.Password)
		if err != nil {
			http.Error(w, "Failed to process password", http.StatusInternalServerError)
			return
		}

		user := &users.User{
			Username: req.Username,
			Password: hashedPassword,
			Email:    req.Email,
			Scope:    "/",
			Perm: users.Permissions{
				Create:   true,
				Rename:   true,
				Modify:   true,
				Delete:   true,
				Share:    true,
				Download: true,
			},
		}

		if err := deps.UserRepo.Create(user); err != nil {
			if errors.Is(err, users.ErrUserExists) {
				http.Error(w, "Username already exists", http.StatusConflict)
				return
			}
			http.Error(w, "Failed to create user", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"message": "User created successfully"})
	}
}
