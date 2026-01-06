package storage

import (
	"github.com/satufile/satufile/share"
	"github.com/satufile/satufile/uploads"
)

// Storage provides an abstraction layer for data persistence
type Storage struct {
	// Will be expanded with actual storage implementation
	// Following filebrowser pattern: Users, Settings, Shares, etc.
	Share   share.StorageBackend
	Uploads uploads.StorageBackend
}

// New creates a new Storage instance
func New() (*Storage, error) {
	uploadsStorage, err := uploads.NewStorage(GetDB())
	if err != nil {
		return nil, err
	}

	return &Storage{
		Share:   share.NewDBStorage(GetDB()),
		Uploads: uploadsStorage,
	}, nil
}
