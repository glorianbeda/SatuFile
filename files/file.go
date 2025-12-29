package files

import (
	"io/fs"
	"mime"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// FileInfo describes a file or directory
type FileInfo struct {
	Path      string      `json:"path"`
	Name      string      `json:"name"`
	Size      int64       `json:"size"`
	Extension string      `json:"extension"`
	ModTime   time.Time   `json:"modified"`
	Mode      fs.FileMode `json:"mode"`
	IsDir     bool        `json:"isDir"`
	Type      string      `json:"type"`
}

// Listing contains directory contents
type Listing struct {
	Items    []*FileInfo `json:"items"`
	NumDirs  int         `json:"numDirs"`
	NumFiles int         `json:"numFiles"`
}

// Sorting describes how to sort files
type Sorting struct {
	By  string `json:"by"`  // name, size, modified
	Asc bool   `json:"asc"` // ascending
}

// NewFileInfo creates a FileInfo from a path
func NewFileInfo(root, path string) (*FileInfo, error) {
	fullPath := filepath.Join(root, path)
	info, err := os.Stat(fullPath)
	if err != nil {
		return nil, err
	}

	file := &FileInfo{
		Path:      path,
		Name:      info.Name(),
		Size:      info.Size(),
		ModTime:   info.ModTime(),
		Mode:      info.Mode(),
		IsDir:     info.IsDir(),
		Extension: filepath.Ext(info.Name()),
	}

	if !file.IsDir {
		file.Type = detectType(file.Extension)
	}

	return file, nil
}

// ReadDir reads directory contents
func ReadDir(root, path string, hideDotfiles bool) (*Listing, error) {
	fullPath := filepath.Join(root, path)
	entries, err := os.ReadDir(fullPath)
	if err != nil {
		return nil, err
	}

	listing := &Listing{
		Items:    []*FileInfo{},
		NumDirs:  0,
		NumFiles: 0,
	}

	for _, entry := range entries {
		name := entry.Name()

		// Skip dotfiles if configured
		if hideDotfiles && strings.HasPrefix(name, ".") {
			continue
		}

		info, err := entry.Info()
		if err != nil {
			continue
		}

		itemPath := filepath.Join(path, name)
		if path == "/" || path == "" {
			itemPath = "/" + name
		}

		file := &FileInfo{
			Path:      itemPath,
			Name:      name,
			Size:      info.Size(),
			ModTime:   info.ModTime(),
			Mode:      info.Mode(),
			IsDir:     info.IsDir(),
			Extension: filepath.Ext(name),
		}

		if file.IsDir {
			listing.NumDirs++
		} else {
			listing.NumFiles++
			file.Type = detectType(file.Extension)
		}

		listing.Items = append(listing.Items, file)
	}

	return listing, nil
}

// detectType detects file type from extension
func detectType(ext string) string {
	if ext == "" {
		return "blob"
	}

	mimeType := mime.TypeByExtension(ext)
	switch {
	case strings.HasPrefix(mimeType, "image"):
		return "image"
	case strings.HasPrefix(mimeType, "video"):
		return "video"
	case strings.HasPrefix(mimeType, "audio"):
		return "audio"
	case strings.HasPrefix(mimeType, "text"), ext == ".md", ext == ".json", ext == ".xml":
		return "text"
	case strings.Contains(mimeType, "pdf"):
		return "pdf"
	default:
		return "blob"
	}
}
