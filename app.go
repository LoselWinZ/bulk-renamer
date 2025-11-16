package main

import (
	"bulk-renamer/internal/utils"
	"context"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

var pathBackStack *utils.Stack

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	pathBackStack = utils.NewStack()
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

type WorkingDirectoryEvent struct {
	Segments  []string `json:"segments"`
	Path      string   `json:"path"`
	EventType string   `json:"eventType"`
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

func (a *App) WorkingDirectory() *string {
	conf, err := os.UserHomeDir()
	if err != nil {
		return nil
	}

	runtime.EventsEmit(a.ctx, "working_directory", WorkingDirectoryEvent{
		Segments: strings.Split(conf, string(filepath.Separator)),
		Path:     conf,
	})
	return &conf
}

func (a *App) UpdateWorkingDirectory(event WorkingDirectoryEvent) {
	pathWithPrefix := ""
	var pathSegments []string
	switch event.EventType {
	case "UP":
		pathSegments = event.Segments[:len(event.Segments)-1]
		if len(pathSegments) < 1 {
			return
		}
		fullPath := filepath.Join(pathSegments...)
		pathWithPrefix = filepath.Join(string(os.PathSeparator), fullPath)
	case "BACK":
		if pathBackStack.Size() < 2 {
			return
		}
		_ = pathBackStack.Pop()
		newPath := pathBackStack.Pop()
		pathWithPrefix = filepath.Join(string(os.PathSeparator), newPath)
		pathSegments = strings.Split(pathWithPrefix, string(filepath.Separator))
	case "RELOAD":
		pathSegments = event.Segments
		pathWithPrefix = event.Path
	default:
		if len(event.Segments) == 0 {
			pathSegments = strings.Split(event.Path, string(filepath.Separator))
			pathWithPrefix = event.Path
		} else {
			pathSegments = event.Segments
			fullPath := filepath.Join(pathSegments...)
			pathWithPrefix = filepath.Join(string(os.PathSeparator), fullPath)
		}
	}
	if pathBackStack.Peek() != pathWithPrefix {
		pathBackStack.Push(pathWithPrefix)
	}
	runtime.EventsEmit(a.ctx, "working_directory", WorkingDirectoryEvent{
		Segments: pathSegments,
		Path:     pathWithPrefix,
	})
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
		size := float64(f.Size())
		if f.IsDir() || !f.Mode().IsRegular() {
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

func (a *App) GetBackStack() []string {
	return pathBackStack.List()
}
