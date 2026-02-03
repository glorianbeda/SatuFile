package api

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/satufile/satufile/auth"
)

// RenewPost handles POST /api/renew
func RenewPost(deps *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user := auth.GetUserFromContext(r.Context())
		claims := auth.GetClaimsFromContext(r.Context())
		
		if user == nil || claims == nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		// Enforce maximum session length of 24 hours from original login
		if claims.OriginalIssuedAt != 0 {
			oia := time.Unix(claims.OriginalIssuedAt, 0)
			if time.Since(oia) > 24*time.Hour {
				http.Error(w, "Session expired (max length reached). Please login again.", http.StatusUnauthorized)
				return
			}
		}

		// Generate new token with same OIA to track session age
		token, err := auth.GenerateTokenWithOIA(user, auth.DefaultTokenExpiration, claims.OriginalIssuedAt)
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
