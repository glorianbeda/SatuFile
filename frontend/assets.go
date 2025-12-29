//go:build ignore
// +build ignore

package main

// This file is a placeholder for the embed directive.
// In production, use go:embed to include frontend/dist in the binary.

/*
To embed frontend assets in the Go binary, add this to a file:

package assets

import "embed"

//go:embed dist/*
var Frontend embed.FS

Then pass the FS to http.NewHandlerWithAssets()
*/
