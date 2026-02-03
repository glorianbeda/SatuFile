package api

import (
	"encoding/json"
	"net/http"

	"github.com/satufile/satufile/auth"
)

// SetupStatusResponse is the response for setup status check
type SetupStatusResponse struct {
	Required bool   `json:"required"`
	Step     string `json:"step,omitempty"`
}

// SetupStatusGet handles GET /api/setup/status
func SetupStatusGet(deps *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user := auth.GetUserFromContext(r.Context())
		if user == nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		setupRequired := user.ForceSetup || user.IsDefaultPassword
		response := SetupStatusResponse{
			Required: setupRequired,
		}

		if setupRequired {
			response.Step = user.SetupStep
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	}
}
