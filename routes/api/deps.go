package api

import (
	"github.com/satufile/satufile/share"
	"github.com/satufile/satufile/uploads"
	"github.com/satufile/satufile/users"
)

// Deps contains dependencies for API handlers
type Deps struct {
	UserRepo *users.Repository
	Share    share.StorageBackend
	Uploads  uploads.StorageBackend
	DataDir  string
}
