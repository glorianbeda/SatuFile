# Tasks: Enhance Share Security and Analytics

## Database Schema
- [ ] Add `password_hash` field to `links` table (nullable string)
- [ ] Add `view_count` field to `links` table (default 0)
- [ ] Add `download_count` field to `links` table (default 0)
- [ ] Add `unique_visitors` field to `links` table (default 0)
- [ ] Add `notify_before_expiry` field to `links` table (boolean)
- [ ] Add `notify_days_before` field to `links` table (int)
- [ ] Create `share_access_logs` table (id, link_id, action, ip_hash, user_agent, timestamp)
- [ ] Create migration for schema changes

## Backend - Password Protection
- [ ] Update `POST /api/share` to accept optional password
- [ ] Hash password with bcrypt before storing
- [ ] Add `POST /api/share/verify` - verify password for share access
- [ ] Update `GET /api/share/public` to check password requirement
- [ ] Add password update endpoint
- [ ] Add password removal endpoint

## Backend - Analytics
- [ ] Implement access logging middleware for share routes
- [ ] Track view count on share access
- [ ] Track download count on file download
- [ ] Anonymize IP addresses (hash with salt)
- [ ] Add `GET /api/shares/{id}/analytics` - fetch analytics data
- [ ] Add `GET /api/shares/{id}/logs` - fetch access logs
- [ ] Add analytics cleanup job (keep logs for 90 days)

## Backend - QR Code
- [ ] Install `github.com/skip2/go-qrcode`
- [ ] Implement `GET /api/shares/{id}/qr` - generate QR code PNG
- [ ] Add QR code size parameter (default 256x256)
- [ ] Cache generated QR codes

## Backend - Notifications
- [ ] Add SMTP configuration to settings
- [ ] Create email template for expiry warnings
- [ ] Implement notification scheduling job (runs daily)
- [ ] Add `SendExpiryNotification` function
- [ ] Add extend-expiry endpoint with token authentication
- [ ] Handle missing SMTP config gracefully

## Frontend - Password Protection
- [ ] Add password field to `ShareDialog`
- [ ] Create `PasswordPrompt` component for share access
- [ ] Update `PublicSharePage` to show password prompt
- [ ] Handle password verification flow
- [ ] Show password strength indicator
- [ ] Add "Show/Hide Password" toggle

## Frontend - Analytics
- [ ] Add analytics tab to Settings > Shares
- [ ] Create `ShareAnalytics` component
- [ ] Display view/download counts in share list
- [ ] Create `AccessLogModal` component
- [ ] Add charts/graphs for analytics (optional)
- [ ] Add date range filter for logs

## Frontend - QR Code
- [ ] Add QR code display to `ShareDialog`
- [ ] Add "Download QR" button
- [ ] Show QR code in share details view
- [ ] Handle QR code loading state

## Frontend - Notifications  
- [ ] Add expiry notification toggle to `ShareDialog`
- [ ] Add notification timing selector (1d, 3d, 1w)
- [ ] Show notification status in share list
- [ ] Display warning if SMTP not configured

## Testing
- [ ] Test password-protected share creation
- [ ] Test password verification (correct/incorrect)
- [ ] Test analytics tracking (views/downloads)
- [ ] Test QR code generation and scanning
- [ ] Test notification sending (with mock SMTP)
- [ ] Test graceful degradation without SMTP
- [ ] Performance test with many access logs

## Documentation
- [ ] Update API docs with new endpoints
- [ ] Add user guide for password-protected shares
- [ ] Document analytics features
- [ ] Document QR code usage
- [ ] Document email notification setup
