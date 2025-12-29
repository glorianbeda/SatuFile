# Satucommit Rules

This project uses **satucommit** to ensure semantic and consistent git commit messages. 
AI Agents behaving as developers on this project **MUST** follow these rules when generating commit messages.

## Format

The commit message format is:

```
<emoji> <type>(<scope>): <subject>

<body>

<footer>
```

- **<emoji>**: The gitmoji corresponding to the type.
- **<type>**: The type of change (see below).
- **<scope>**: (Optional) The scope of the change (e.g., auth, api, ui).
- **<subject>**: Brief description of the change (imperative mood, no period at end).
- **<body>**: (Optional) Detailed description.
- **<footer>**: (Optional) Breaking changes or issue references (e.g., "Closes #123").

## Commit Types and Emojis

Use the following table to select the correct type and emoji:

| Type | Emoji | Description |
|------|-------|-------------|
| `feat` | ✨ | A new feature |
| `fix` | 🐛 | A bug fix |
| `docs` | 📝 | Documentation only changes |
| `style` | 💄 | Changes that do not affect the meaning of the code |
| `refactor` | ♻️ | A code change that neither fixes a bug nor adds a feature |
| `perf` | ⚡ | A code change that improves performance |
| `test` | ✅ | Adding missing tests or correcting existing tests |
| `build` | 📦 | Changes that affect the build system or external dependencies |
| `ci` | 👷 | Changes to CI configuration files and scripts |
| `chore` | 🧹 | Other changes that don't modify src or test files |
| `revert` | ⏪ | Reverts a previous commit |
| `init` | 🎉 | Initial commit |
| `wip` | 🚧 | Work in progress |
| `security` | 🔒 | Security fixes |
| `config` | 🔧 | Configuration changes |
| `deps` | ➕ | Adding dependencies |
| `remove` | ➖ | Removing dependencies |
| `update` | ⬆️ | Updating dependencies |
| `downgrade` | ⬇️ | Downgrading dependencies |
| `branch` | 🌿 | Branch operations |
| `merge` | 🔀 | Merge operations |
| `tag` | 🏷️ | Tag operations |
| `release` | 🚀 | Release operations |
| `deploy` | 🎯 | Deployment operations |
| `locale` | 🌐 | Localization changes |
| `accessibility` | ♿ | Accessibility improvements |
| `design` | 🎨 | Design changes |
| `content` | ✍️ | Content changes |
| `translation` | 🌍 | Translation changes |
| `email` | 📧 | Email changes |
| `analytics` | 📊 | Analytics changes |
| `seo` | 🔍 | SEO changes |
| `performance` | ⚡ | Performance improvements |
| `hotfix` | 🚑 | Hotfix |
| `breaking` | 💥 | Breaking changes |
| `license` | ⚖️ | License changes |
| `ignore` | 🙈 | Ignore changes |
| `workflow` | 📋 | Workflow changes |
| `infrastructure` | 🏗️ | Infrastructure changes |
| `database` | 🗄️ | Database changes |
| `api` | 🔌 | API changes |
| `ui` | 🖼️ | UI changes |
| `ux` | 🎯 | UX changes |
| `mobile` | 📱 | Mobile changes |
| `desktop` | 💻 | Desktop changes |
| `server` | 🖥️ | Server changes |
| `cloud` | ☁️ | Cloud changes |
| `monitoring` | 📈 | Monitoring changes |
| `logging` | 📋 | Logging changes |
| `caching` | 💾 | Caching changes |
| `validation` | ✅ | Validation changes |
| `formatting` | 💄 | Formatting changes |
| `linting` | 🔍 | Linting changes |
| `types` | 📝 | Type changes |
| `comments` | 💬 | Comment changes |
| `documentation` | 📚 | Documentation changes |
| `examples` | 📖 | Example changes |
| `templates` | 📄 | Template changes |
| `scaffolding` | 🏗️ | Scaffolding changes |
| `migration` | 🔄 | Migration changes |
| `backup` | 💾 | Backup changes |
| `restore` | 📦 | Restore changes |
| `export` | 📤 | Export changes |
| `import` | 📥 | Import changes |
| `download` | ⬇️ | Download changes |
| `upload` | ⬆️ | Upload changes |
| `install` | 📥 | Installation changes |
| `uninstall` | 📤 | Uninstallation changes |
| `upgrade` | ⬆️ | Upgrade changes |
| `patch` | 🩹 | Patch changes |
| `experimental` | 🧪 | Experimental changes |
| `deprecated` | ⚠️ | Deprecation changes |
| `removed` | 🗑️ | Removal changes |
| `added` | ➕ | Added changes |
| `changed` | 🔄 | Changed changes |
| `fixed` | 🐛 | Fixed changes |
| `improved` | ⚡ | Improved changes |
| `optimized` | ⚡ | Optimized changes |
| `simplified` | 🧹 | Simplified changes |
| `refactored` | ♻️ | Refactored changes |
| `reorganized` | 📦 | Reorganized changes |
| `renamed` | 🏷️ | Renamed changes |
| `moved` | 📦 | Moved changes |
| `copied` | 📋 | Copied changes |
| `deleted` | 🗑️ | Deleted changes |
| `created` | ✨ | Created changes |
| `updated` | ⬆️ | Updated changes |
| `modified` | 🔄 | Modified changes |
| `replaced` | 🔄 | Replaced changes |
| `merged` | 🔀 | Merged changes |
| `split` | ✂️ | Split changes |
| `extracted` | 📦 | Extracted changes |
| `inlined` | 📦 | Inlined changes |
| `extracted_to_file` | 📦 | Extracted to file changes |
| `inlined_from_file` | 📦 | Inlined from file changes |
| `extracted_to_module` | 📦 | Extracted to module changes |
| `inlined_from_module` | 📦 | Inlined from module changes |
| `extracted_to_function` | 📦 | Extracted to function changes |
| `inlined_from_function` | 📦 | Inlined from function changes |

## Common Scopes

Common scopes used in this project (infer others if needed):

- `core`
- `ui`
- `api`
- `auth`
- `db`
- `config`
- `utils`
- `components`
- `hooks`
- `services`
- `store`
- `router`
- `middleware`
- `tests`
- `docs`
- `build`
- `deploy`
- `ci`
- `types`
- `styles`
- `assets`
- `i18n`
- `analytics`
- `monitoring`
- `logging`
- `caching`
- `validation`
- `security`
- `performance`
- `accessibility`
- `seo`
- `email`
- `notifications`
- `payments`
- `integrations`
- `webhooks`
- `scheduler`
- `queue`
- `storage`
- `backup`
- `migration`
- `database`
- `server`
- `client`
- `mobile`
- `desktop`
- `cli`
- `admin`
- `dashboard`
- `settings`
- `profile`
- `search`
- `filters`
- `pagination`
- `sorting`
- `forms`
- `modals`
- `dialogs`
- `toasts`
- `notifications`
- `loading`
- `error`
- `success`
- `warning`
- `info`

## Examples

**Feature:**
`✨ feat(auth): implement google login`

**Bug Fix:**
`🐛 fix(api): resolve null pointer exception in user handler`

**Documentation:**
`📝 docs: update readme with installation steps`

**Refactor:**
`♻️ refactor(core): simplify data validation logic`
