package users

// SupportedLocales contains all supported language codes
var SupportedLocales = []string{"en", "id"}

// DefaultLocale is the default language for new users
const DefaultLocale = "id"

// IsValidLocale checks if a locale code is supported
func IsValidLocale(locale string) bool {
	for _, supported := range SupportedLocales {
		if locale == supported {
			return true
		}
	}
	return false
}
