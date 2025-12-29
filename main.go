package main

import (
	"os"

	"github.com/satufile/satufile/cmd"
)

func main() {
	if err := cmd.Execute(); err != nil {
		os.Exit(1)
	}
}
