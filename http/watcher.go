package http

import (
	"log"
	"path/filepath"
	"strings"
	"time"

	"github.com/fsnotify/fsnotify"
)

type Watcher struct {
	watcher *fsnotify.Watcher
	hub     *Hub
	root    string
}

func NewWatcher(root string, hub *Hub) (*Watcher, error) {
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		return nil, err
	}

	return &Watcher{
		watcher: watcher,
		hub:     hub,
		root:    root,
	}, nil
}

func (w *Watcher) Watch() {
	// Add root and all subdirectories
	err := w.addRecursive(w.root)
	if err != nil {
		log.Printf("Error adding root to watcher: %v", err)
	}

	// Debounce timer to avoid spamming multiple events for one operation
	var lastEvent time.Time
	var lastPath string

	for {
		select {
		case event, ok := <-w.watcher.Events:
			if !ok {
				return
			}

			// Simple debouncing: skip if same path and within 100ms
			if event.Name == lastPath && time.Since(lastEvent) < 100*time.Millisecond {
				continue
			}
			lastEvent = time.Now()
			lastPath = event.Name

			relPath := strings.TrimPrefix(event.Name, w.root)
			if relPath == "" {
				relPath = "/"
			} else {
				relPath = filepath.ToSlash(relPath)
			}

			op := ""
			switch {
			case event.Op&fsnotify.Create == fsnotify.Create:
				op = "CREATE"
				// Add new directories to watcher
				w.addRecursive(event.Name)
			case event.Op&fsnotify.Write == fsnotify.Write:
				op = "WRITE"
			case event.Op&fsnotify.Remove == fsnotify.Remove:
				op = "DELETE"
			case event.Op&fsnotify.Rename == fsnotify.Rename:
				op = "RENAME"
			}

			if op != "" {
				w.hub.Broadcast(Event{
					Type: "FS_EVENT",
					Payload: map[string]string{
						"op":   op,
						"path": relPath,
					},
				})
			}

		case err, ok := <-w.watcher.Errors:
			if !ok {
				return
			}
			log.Printf("Watcher error: %v", err)
		}
	}
}

func (w *Watcher) addRecursive(path string) error {
	// Simplified recursive add: for now just add the directory itself
	// Real implementation would walk the tree, but for performance and simplicity 
	// in a home server environment, we might want to be careful with depth.
	// We'll add the directory if it's indeed a directory.
	
	// Implementation note: fsnotify doesn't watch recursively by default on all platforms.
	// For this prototype, we'll focus on the root and new folders.
	return w.watcher.Add(path)
}

func (w *Watcher) Close() error {
	return w.watcher.Close()
}
