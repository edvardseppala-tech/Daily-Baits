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
- The shell shows the game in a full-height iframe at `/dailybaits.html`. The game reaches the shell through
  `window.parent.dailyBaitsApi`. The full contract, with types, is `src/lib/daily-baits-api.ts`: account,
  scores and leaderboard, Club and purchases, customization, and site pages. Every member is optional,
  and the game hides whatever is missing. After any auth or purchase change, the shell calls
  `iframe.contentWindow.dailyBaits.refresh()`.
- The game draws its own UI: the tab bar (Fish / Board / Book / You), burger menu, sign-in sheet, profile,
  shop, leaderboard tabs and re-fish. The shell supplies the data and the Stripe checkout and portal.
- If `window.__dbBootError` is set after the iframe loads, the game failed to start; show a retry screen.
- Today's water depends only on the date (`dailySeed(day)`), so every player and the server see the
  same water. Changing generation replaces today's water for everyone.
- Payments: Stripe, in the separate **Daily Baits** Stripe account (same organisation as Daily Holes).
  Products and lookup keys are listed in `docs/STRIPE_SETUP.md`: re-fish (1 or 3), custom bobber/line colours,
  and the Daily Baits Club (monthly/yearly). Entitlements are decided on the server only.
