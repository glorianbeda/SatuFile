package detection

import (
	"bufio"
	"fmt"
	"os/exec"
	"strconv"
	"strings"
	"syscall"
)

// DriveInfo represents information about a system drive
type DriveInfo struct {
	Device       string  `json:"device"`
	Mount        string  `json:"mount"`
	Filesystem   string  `json:"filesystem"`
	SizeGb       float64 `json:"size_gb"`
	UsedGb       float64 `json:"used_gb"`
	AvailableGb  float64 `json:"available_gb"`
	UsagePercent float64 `json:"usage_percent"`
	ReadOnly     bool    `json:"read_only"`
}

// ReadonlyFilesystems contains filesystem types that are read-only
var ReadonlyFilesystems = map[string]bool{
	"proc":     true,
	"sysfs":    true,
	"tmpfs":    true,
	"devtmpfs": true,
	"devpts":   true,
	"cgroup":   true,
	"pstore":   true,
	"configfs": true,
	"debugfs":  true,
	"securityfs": true,
	"selinuxfs":  true,
	"binder":   true,
	"pipefs":   true,
	"rpc_pipefs": true,
	"autofs":   true,
}

// Detector interface defines the contract for drive detection
type Detector interface {
	GetDrives() ([]DriveInfo, error)
	GetPathUsage(path string) (DriveInfo, error)
}

// SystemDetector implements Detector using system commands
type SystemDetector struct{}

// NewDetector creates a new SystemDetector
func NewDetector() *SystemDetector {
	return &SystemDetector{}
}

// GetPathUsage returns disk usage information for a specific path
func (d *SystemDetector) GetPathUsage(path string) (DriveInfo, error) {
	var stat syscall.Statfs_t
	if err := syscall.Statfs(path, &stat); err != nil {
		return DriveInfo{}, fmt.Errorf("failed to get disk usage for %s: %w", path, err)
	}

	// Calculate size in bytes
	totalBytes := stat.Blocks * uint64(stat.Bsize)
	freeBytes := stat.Bfree * uint64(stat.Bsize)
	availBytes := stat.Bavail * uint64(stat.Bsize) // Available to unprivileged users
	usedBytes := totalBytes - freeBytes

	// Convert to GB
	toGB := func(bytes uint64) float64 {
		return float64(bytes) / (1024 * 1024 * 1024)
	}

	totalGb := toGB(totalBytes)
	usedGb := toGB(usedBytes)
	availableGb := toGB(availBytes)

	usagePercent := 0.0
	if totalGb > 0 {
		usagePercent = (usedGb / totalGb) * 100
	}

	return DriveInfo{
		Device:       "System Storage", // Generic name as we abstracted away the physical device
		Mount:        path,
		Filesystem:   "unknown", // Not strictly needed for logic
		SizeGb:       totalGb,
		UsedGb:       usedGb,
		AvailableGb:  availableGb,
		UsagePercent: usagePercent,
		ReadOnly:     false, // Assumed writable if we are here
	}, nil
}

// GetDrives returns information about available system drives
func (d *SystemDetector) GetDrives() ([]DriveInfo, error) {
	// Get mounts from /proc/mounts
	mounts, err := parseMounts()
	if err != nil {
		return nil, fmt.Errorf("failed to parse mounts: %w", err)
	}

	// Get disk usage from df command
	diskUsage, err := getDiskUsage()
	if err != nil {
		return nil, fmt.Errorf("failed to get disk usage: %w", err)
	}

	// Combine mount info with disk usage
	drives := make([]DriveInfo, 0)
	for _, mount := range mounts {
		// Skip special filesystems
		if ReadonlyFilesystems[mount.Filesystem] {
			continue
		}

		// Get usage info for this mount
		usage, ok := diskUsage[mount.Mount]
		if !ok {
			// No usage info available, still include but with zero values
			usage = UsageInfo{}
		}

		drive := DriveInfo{
			Device:       mount.Device,
			Mount:        mount.Mount,
			Filesystem:   mount.Filesystem,
			SizeGb:       usage.TotalGb,
			UsedGb:       usage.UsedGb,
			AvailableGb:  usage.AvailableGb,
			UsagePercent: usage.UsagePercent,
			ReadOnly:     mount.Options.ReadOnly,
		}

		// Only include writable drives with actual storage
		if !drive.ReadOnly && drive.SizeGb > 0 {
			drives = append(drives, drive)
		}
	}

	return drives, nil
}

// GetDrives returns information about available system drives (helper for backward compatibility)
func GetDrives() ([]DriveInfo, error) {
	return NewDetector().GetDrives()
}

// MountInfo represents a single mount entry
type MountInfo struct {
	Device     string
	Mount      string
	Filesystem string
	Options    MountOptions
}

// MountOptions represents mount options
type MountOptions struct {
	ReadOnly bool
	Options  []string
}

// parseMounts reads and parses /proc/mounts
func parseMounts() ([]MountInfo, error) {
	cmd := exec.Command("cat", "/proc/mounts")
	output, err := cmd.Output()
	if err != nil {
		return nil, err
	}

	var mounts []MountInfo
	scanner := bufio.NewScanner(strings.NewReader(string(output)))
	for scanner.Scan() {
		line := scanner.Text()
		fields := strings.Fields(line)
		if len(fields) < 3 {
			continue
		}

		device := fields[0]
		mount := fields[1]
		filesystem := fields[2]

		// Parse options (field 3)
		options := parseOptions(fields[3])

		mounts = append(mounts, MountInfo{
			Device:     device,
			Mount:      mount,
			Filesystem: filesystem,
			Options:    options,
		})
	}

	return mounts, nil
}

// parseOptions parses mount options string
func parseOptions(optionsStr string) MountOptions {
	opts := strings.Split(optionsStr, ",")
	readOnly := false
	for _, opt := range opts {
		if opt == "ro" {
			readOnly = true
			break
		}
	}
	return MountOptions{
		ReadOnly: readOnly,
		Options:  opts,
	}
}

// UsageInfo represents disk usage information
type UsageInfo struct {
	TotalGb      float64
	UsedGb       float64
	AvailableGb  float64
	UsagePercent float64
}

// getDiskUsage executes df command to get disk usage
func getDiskUsage() (map[string]UsageInfo, error) {
	// Use df -h to get human-readable sizes
	cmd := exec.Command("df", "-h")
	output, err := cmd.Output()
	if err != nil {
		return nil, err
	}

	usage := make(map[string]UsageInfo)
	lines := strings.Split(string(output), "\n")

	// Skip header line
	for i, line := range lines {
		if i == 0 {
			continue
		}

		fields := strings.Fields(line)
		if len(fields) < 6 {
			continue
		}

		// df output format:
		// Filesystem      Size  Used Avail Use% Mounted on
		// /dev/sda1       500G  120G  380G  24%  /
		totalStr := fields[1]
		usedStr := fields[2]
		availStr := fields[3]
		percentStr := fields[4]
		mount := fields[5]

		totalGb, _ := parseSizeToGB(totalStr)
		usedGb, _ := parseSizeToGB(usedStr)
		availGb, _ := parseSizeToGB(availStr)
		usagePercent, _ := parsePercent(percentStr)

		// Use mount point as key (exclude bind mounts with same device)
		usage[mount] = UsageInfo{
			TotalGb:      totalGb,
			UsedGb:       usedGb,
			AvailableGb:  availGb,
			UsagePercent: usagePercent,
		}
	}

	return usage, nil
}

// parseSizeToGB converts df human-readable size to GB
func parseSizeToGB(sizeStr string) (float64, error) {
	sizeStr = strings.TrimSpace(sizeStr)
	if sizeStr == "" || sizeStr == "0" {
		return 0, nil
	}

	// Remove % if present
	sizeStr = strings.TrimSuffix(sizeStr, "%")

	// Get the suffix (last character)
	suffix := sizeStr[len(sizeStr)-1:]
	numStr := sizeStr[:len(sizeStr)-1]

	value, err := strconv.ParseFloat(numStr, 64)
	if err != nil {
		return 0, err
	}

	switch suffix {
	case "K", "k":
		return value / 1024 / 1024, nil
	case "M", "m":
		return value / 1024, nil
	case "G", "g":
		return value, nil
	case "T", "t":
		return value * 1024, nil
	case "P", "p":
		return value * 1024 * 1024, nil
	default:
		// Assume bytes
		return value / 1024 / 1024 / 1024, nil
	}
}

// parsePercent parses percentage string (e.g., "24%")
func parsePercent(percentStr string) (float64, error) {
	percentStr = strings.TrimSpace(percentStr)
	percentStr = strings.TrimSuffix(percentStr, "%")
	return strconv.ParseFloat(percentStr, 64)
}
