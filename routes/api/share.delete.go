package api

import (
	"net/http"
)

// ShareDelete handles DELETE /api/share/:id
func ShareDelete(deps *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		token := r.URL.Query().Get("token")
		if token == "" {
			http.Error(w, "Missing token", http.StatusBadRequest)
			return
		}

		if err := deps.Share.DeleteLink(token); err != nil {
			http.Error(w, "Failed to delete share link", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Share link deleted successfully"))
	}
}
