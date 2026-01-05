package api

import (
	"encoding/json"
	"net/http"
)

// Language represents a supported language
type Language struct {
	Code string `json:"code"`
	Name string `json:"name"`
}

// InfoResponse is the response for /api/info
type InfoResponse struct {
	Name              string     `json:"name"`
	Version           string     `json:"version"`
	SupportedLanguages []Language `json:"supportedLanguages"`
}

// InfoGet handles GET /api/info
func InfoGet(deps *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Build supported languages list
		languages := []Language{
			{Code: "en", Name: "English"},
			{Code: "id", Name: "Bahasa Indonesia"},
		}

		response := InfoResponse{
			Name:              "SatuFile",
			Version:           "0.1.0",
			SupportedLanguages: languages,
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	}
}
