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
	ctx   context.Context
	state *State
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
	directory := a.WorkingDirectory()
	a.state = &State{
		Path:     directory,
		Segments: strings.Split(directory, string(filepath.Separator)),
	}
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

type State struct {
	Path     string
	Segments []string
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

func (a *App) WorkingDirectory() string {
	conf, err := os.UserHomeDir()
	if err != nil {
		return ""
	}

	runtime.EventsEmit(a.ctx, "working_directory", WorkingDirectoryEvent{
		Segments: strings.Split(conf, string(filepath.Separator)),
		Path:     conf,
	})
	return conf
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
		if pathBackStack.Size() < 1 {
			return
		}
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
	if event.EventType != "BACK" && pathBackStack.Peek() != a.state.Path {
		pathBackStack.Push(a.state.Path)
	}
	a.state.Segments = pathSegments
	a.state.Path = pathWithPrefix
	runtime.EventsEmit(a.ctx, "working_directory", WorkingDirectoryEvent{
		Segments: pathSegments,
		Path:     pathWithPrefix,
	})
}

func (a *App) ListDirectory(directory string, listFiles bool, includeChildren bool) []Item {
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
		if !listFiles && !f.IsDir() {
			continue
		}
		path := filepath.Join(directory, f.Name())
		size := float64(f.Size())
		children := make([]Item, 0)
		if f.IsDir() || !f.Mode().IsRegular() {
			size = 0
		}
		if f.IsDir() && includeChildren {
			children = a.ListDirectory(path, listFiles, false)
		}
		items = append(items, Item{
			Name:     f.Name(),
			NewName:  f.Name(),
			Path:     path,
			IsDir:    f.IsDir(),
			Size:     size,
			Modified: f.ModTime(),
			Items:    children,
		})
	}

	return items
}

func (a *App) LoadRoot() []Item {
	var items []Item
	for _, root := range a.getRoots() {
		items = append(items, Item{
			Name:  root,
			Path:  root,
			IsDir: true,
			Size:  0,
			Items: a.ListDirectory(root, false, false),
		})
	}
	return items
}

func (a *App) getRoots() []string {
	platform := runtime.Environment(a.ctx).Platform
	if platform == "windows" {
		var roots []string
		for letter := 'A'; letter <= 'Z'; letter++ {
			path := string(letter) + ":\\"
			_, err := os.Stat(path)
			if err == nil {
				roots = append(roots, path)
			}
		}
		return roots
	}

	// Unix-like systems: always "/"
	return []string{"/"}
}

func (a *App) GetBackStack() []string {
	return pathBackStack.List()
}
