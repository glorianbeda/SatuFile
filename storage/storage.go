package storage

// Storage provides an abstraction layer for data persistence
type Storage struct {
	// Will be expanded with actual storage implementation
	// Following filebrowser pattern: Users, Settings, Shares, etc.
}

// New creates a new Storage instance
func New() (*Storage, error) {
	return &Storage{}, nil
}
