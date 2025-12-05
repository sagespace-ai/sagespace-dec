# Development Bypass

For faster development iteration, SageSpace includes a development bypass that skips authentication.

## Quick Access

Visit `/dev-bypass` in your browser to access the bypass control panel.

## How It Works

1. Visit `http://localhost:3000/dev-bypass`
2. Click "Enable Dev Bypass"
3. You'll be automatically logged in on every page load
4. Access all platform features without authentication

## Keyboard Shortcut

For even faster access, you can enable bypass from the browser console:

\`\`\`javascript
localStorage.setItem("DEV_BYPASS", "true")
window.location.reload()
\`\`\`

To disable:

\`\`\`javascript
localStorage.removeItem("DEV_BYPASS")
localStorage.removeItem("sagespace_user")
window.location.reload()
\`\`\`

## Security Note

This feature is for **development only**. Never enable this in production or commit code that automatically enables it.

## Typical Development Flow

1. Enable dev bypass at start of work session
2. Make changes and test features rapidly
3. When testing auth flows specifically, disable bypass
4. Re-enable when done with auth testing

This saves significant time during development while still allowing full auth flow testing when needed.
