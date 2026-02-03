package api

import (
	"encoding/json"
	"net/http"

	"github.com/satufile/satufile/auth"
)

// SetupCompletePost handles POST /api/setup/complete
func SetupCompletePost(deps *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user := auth.GetUserFromContext(r.Context())
		if user == nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		// Mark setup as complete
		user.ForceSetup = false
		user.SetupStep = "complete"

		if err := deps.UserRepo.Update(user); err != nil {
			http.Error(w, "Failed to update user", http.StatusInternalServerError)
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
