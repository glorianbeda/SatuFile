package api

import (
	"io"
	"os"
	"path/filepath"
)

// saveUploadedFile saves an uploaded file to disk
func saveUploadedFile(fullPath string, file io.Reader) error {
	// Create parent directories if needed
	dir := filepath.Dir(fullPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return err
	}

	// Create file
	dst, err := os.Create(fullPath)
	if err != nil {
		return err
	}
	defer dst.Close()

	// Copy contents
	_, err = io.Copy(dst, file)
	return err
}
