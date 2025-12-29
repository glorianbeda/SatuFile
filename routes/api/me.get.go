package api

import (
	"encoding/json"
	"net/http"

	"github.com/satufile/satufile/auth"
)

// MeGet handles GET /api/me
func MeGet(deps *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user := auth.GetUserFromContext(r.Context())
		if user == nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(user.ToInfo())
	}
}
