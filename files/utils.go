package files

// GetFileInfo gets file info for a given path
func GetFileInfo(storage interface{}, path string) (*FileInfo, error) {
	// In a real implementation, this would use the storage backend
	// For now, we'll use the existing NewFileInfo function
	return NewFileInfo("", path)
}
