# Proposal: Simplify v1.0 Auth & Add Share Management & i18n

## Change Summary
This change simplifies SatuFile v1.0 for single-user deployment (server owner) and adds essential management features for file sharing and internationalization support.

**Change ID:** `simplify-v1-auth`

## Motivation
SatuFile v1.0 is designed for personal server deployments where one person owns the server. Current multi-user authentication is unnecessary overhead. Additionally, users need:
- Ability to manage and view active share links
- Multi-language support for international users

## Goals
1. ✅ Remove multi-user complexity - single admin user only
2. ✅ Eliminate registration/signup flow
3. ✅ Provide dedicated UI for managing file shares
4. ✅ Add multi-language support configurable via settings

## Non-Goals
- Removing login entirely (password protection still needed)
- Changing file sharing backend (already implemented)
- Implementing role-based permissions
- Adding user quotas or limits

## Scope
### In Scope
- Remove signup API endpoint and UI
- Simplify user model to single admin account
- Create shares management page with table view
- Add shared files access page (public link landing)
- Implement i18n infrastructure with react-i18next
- Add language selector in settings
- Provide initial translations (English, Indonesian)

### Out of Scope
- User role management
- Multi-tenant deployment
- Advanced share analytics
- Translation contribution workflow

## Risks & Mitigations
| Risk | Impact | Mitigation |
|-------|---------|-------------|
| Breaking change for existing users expecting signup | Medium | Update documentation clearly about single-user nature |
| i18n adds complexity to codebase | Low | Start with core translations, extensible design |
| Share management UI complexity | Low | Use established table library (MUI DataGrid) |

## Success Criteria
- [ ] Signup page/route removed from frontend
- [ ] Signup API endpoint removed from backend
- [ ] Admin account auto-created if not exists
- [ ] Shares management page accessible from settings
- [ ] Table displays all active share links
- [ ] Share links can be revoked from management page
- [ ] Shared files public landing page works
- [ ] Language selector available in settings
- [ ] UI language switches immediately on selection
- [ ] Indonesian translations complete for all UI text

## Dependencies
- Existing file sharing implementation (already complete)
- Settings page infrastructure (already exists)
- MUI DataGrid for table component

## Timeline
- Backend changes (remove signup): 0.5 days
- Frontend changes (remove signup): 0.5 days
- Share management UI: 2 days
- Public share landing page: 1 day
- i18n infrastructure setup: 1 day
- Core translations (EN/ID): 1 day
- Testing: 1 day
- **Total: ~7 days**

## Related Changes
- Depends on: existing `share-feature` implementation
- Blocks: future multi-user enhancements (if needed later)

## Open Questions
1. **Initial admin credentials:** Should we generate random password or keep default `admin/Admin123!`? → *Decision: Keep default for now, add setup wizard later*
2. **Share management location:** Should it be in settings or separate page? → *Decision: Add as submenu under settings*
3. **Default language:** Should be English or Indonesian? → *Decision: English as default, Indonesian first addition*