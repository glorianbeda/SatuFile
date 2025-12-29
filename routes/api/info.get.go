package api

import (
	"encoding/json"
	"net/http"
)

// InfoGet handles GET /api/info
func InfoGet(deps *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"name":    "SatuFile",
			"version": "0.1.0",
		})
	}
}
