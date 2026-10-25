# Daily Baits

One seeded water a day, ten casts, shared by every player. The whole game is
`public/dailybaits.html`, a single self-contained canvas page (no build step).

## Working with Lovable

This repo is connected to Lovable through GitHub (`edvardseppala-tech/Daily-Baits`, branch `main`).
Commits pushed to `main` sync into the Lovable editor and deploy, so keep `main` working and never
force-push or rewrite pushed history.

The site is a minimal Vite + React shell: `src/GameFrame.tsx` shows the game full screen in an iframe,
installs the bridge below, and shows a retry screen if the game fails to start.

- **Lovable owns** the React shell, routes, styling, accounts, database schema and deploys.
- **Claude Code owns** `public/dailybaits.html`: generation, fishing mechanics, rendering and fish models.
- Do not edit the same file from both sides at once. Pull before working; push only working changes.
- The shell shows the game in a full-height iframe at `/dailybaits.html`. Everything native to the
  shell reaches the game through `window.parent.dailyBaitsApi` (all optional):
  - `submitScore({ day, venue, seed, pts, kg, casts, log })` is called when a daily round ends (never for Explore).
  - `haptic(ms)` is called for bites, surges and landings.
  - `getPlayer()` returns `{ name }` or `null` (synchronous); the home screen shows the name or "Sign in".
  - `openSignIn()`, `openProfile()`, `openLeaderboard()` navigate to the shell's pages. With no
    `openLeaderboard`, the game falls back to its own local board.
  - After auth changes the shell calls `iframe.contentWindow.dailyBaits.refresh()`.
- If `window.__dbBootError` is set after the iframe loads, the game failed to start; show a retry screen.
- Today's water depends only on the date (`dailySeed(day)`), so every player and the server see the
  same water. Changing generation replaces today's water for everyone.
- No monetisation for now.
