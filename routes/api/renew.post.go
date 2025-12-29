package api

import (
	"encoding/json"
	"net/http"

	"github.com/satufile/satufile/auth"
)

// RenewPost handles POST /api/renew
func RenewPost(deps *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user := auth.GetUserFromContext(r.Context())
		if user == nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
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
