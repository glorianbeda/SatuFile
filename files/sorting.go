package files

import (
	"sort"
	"strings"
)

// ApplySort sorts the listing items
func (l *Listing) ApplySort(s Sorting) {
	if s.By == "" {
		s.By = "name"
	}

	sort.Slice(l.Items, func(i, j int) bool {
		// Directories always come first
		if l.Items[i].IsDir != l.Items[j].IsDir {
			return l.Items[i].IsDir
		}

		var less bool
		switch s.By {
		case "name":
			less = strings.ToLower(l.Items[i].Name) < strings.ToLower(l.Items[j].Name)
		case "size":
			less = l.Items[i].Size < l.Items[j].Size
		case "modified":
			less = l.Items[i].ModTime.Before(l.Items[j].ModTime)
		default:
			less = strings.ToLower(l.Items[i].Name) < strings.ToLower(l.Items[j].Name)
		}

		if s.Asc {
			return less
		}
		return !less
	})
}
