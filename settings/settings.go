package settings

// Config holds the application configuration
type Config struct {
	Address string
	Port    int
	Root    string
	BaseURL string
}

// Server holds server-specific settings
type Server struct {
	BaseURL          string
	Root             string
	EnableThumbnails bool
}

// Clean sanitizes server settings
func (s *Server) Clean() {
	if s.BaseURL != "" && s.BaseURL[0] != '/' {
		s.BaseURL = "/" + s.BaseURL
	}
}
