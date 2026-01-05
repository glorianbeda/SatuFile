package storage

import (
	"github.com/satufile/satufile/share"
)

// Storage provides an abstraction layer for data persistence
type Storage struct {
	// Will be expanded with actual storage implementation
	// Following filebrowser pattern: Users, Settings, Shares, etc.
	Share share.StorageBackend
}

// New creates a new Storage instance
func New() (*Storage, error) {
	return &Storage{
		Share: share.NewDBStorage(GetDB()),
	}, nil
}
