package utils

import "fmt"

const (
	_  = iota //ignore first value by assigning to blank identifier
	KB = 1 << (10 * iota)
	MB
	GB
	TB
	PB
	EB
	ZB
	YB
)

func ConvertBytes(bytes float64) string {
	var size string
	switch {
	case bytes < KB:
		size = fmt.Sprintf("%.2f B", bytes)
	case bytes < MB:
		size = fmt.Sprintf("%.2f KiB", bytes/KB)
	case bytes < GB:
		size = fmt.Sprintf("%.2f MiB", bytes/MB)
	case bytes < TB:
		size = fmt.Sprintf("%.2f GiB", bytes/GB)
	case bytes < PB:
		size = fmt.Sprintf("%.2f TiB", bytes/TB)
	case bytes < EB:
		fmt.Printf("%.2f EiB", bytes/PB)
	}

	return size
}
