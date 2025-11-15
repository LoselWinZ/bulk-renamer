package main

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

type Item struct {
	Name     string    `json:"name"`
	NewName  string    `json:"newName"`
	Path     string    `json:"path"`
	IsDir    bool      `json:"isDir"`
	Size     float64   `json:"size"`
	Modified time.Time `json:"modified"`
	Items    []Item    `json:"items"`
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

func (a *App) WorkingDirectory() *string {
	conf, err := os.UserConfigDir()
	if err != nil {
		return nil
	}

	return &conf
}

func (a *App) ListDirectory(directory string) []Item {
	dir, err := os.Open(directory)
	if err != nil {
		return nil
	}

	defer dir.Close()

	files, err := dir.Readdir(-1)
	if err != nil {
		fmt.Println(err)
	}
	sort.Slice(files, func(i, j int) bool {
		aString := strings.ToLower(files[i].Name())
		bString := strings.ToLower(files[j].Name())
		return aString < bString
	})

	var items []Item
	for _, f := range files {
		path := filepath.Join(directory, f.Name())
		if f.IsDir() {
			path += string(os.PathSeparator)
		}
		size := float64(f.Size())
		if f.IsDir() {
			size = 0
		}
		items = append(items, Item{
			Name:     f.Name(),
			NewName:  f.Name(),
			Path:     path,
			IsDir:    f.IsDir(),
			Size:     size,
			Modified: f.ModTime(),
			Items:    nil,
		})
	}

	return items
}
