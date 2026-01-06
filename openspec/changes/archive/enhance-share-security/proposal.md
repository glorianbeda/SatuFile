# Proposal: Enhance Share Security and Analytics

## Problem
Current share functionality is basic - links are public with only expiration control. Users need:
1. **Security**: Password protection for sensitive shares
2. **Insights**: Analytics to see who accessed shared content
3. **Convenience**: QR codes for easy mobile sharing
4. **Proactive Management**: Notifications before links expire

## Solution
Enhance the share feature with:

### 1. Password-Protected Shares
- Optional password for share links
- Password verification before content access
- Stored securely (hashed in database)

### 2. Share Analytics
- Track views, downloads, and unique visitors
- Display in Settings > Shares section
- Log access time, IP address (anonymized), user agent

### 3. QR Code Generation
- Generate QR code for each share link
- Display in share dialog
- Downloadable as PNG image

### 4. Expiry Notifications
- Optional email notification before link expires
- Configurable: 1 day, 3 days, 1 week before expiry
- Requires email configuration (SMTP)

## Scope
- **Database**: Add password, view_count, download_count to Link struct
- **Backend**: Password verification, analytics tracking, QR generation endpoint
- **Frontend**: Password input, analytics display, QR code view
- **Email**: Notification system (optional, requires SMTP setup)

## Benefits
- Enhanced security for sensitive shares
- Visibility into share usage
- Better mobile UX with QR codes
- Proactive link management

## Implementation Notes
- Use bcrypt for password hashing
- QR generation: `github.com/skip2/go-qrcode`
- Analytics: Simple counters + access log table
- Email: Optional feature with graceful degradation
