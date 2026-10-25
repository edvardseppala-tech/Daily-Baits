# Prompt for Lovable: sign in + leaderboard

Paste everything below the line into Lovable.

---

Add accounts and a daily leaderboard to Daily Baits. Use Lovable Cloud (Supabase).

**Ground rules**
- The game is `public/dailybaits.html`, shown full screen by `src/GameFrame.tsx`. Do not edit, rewrite or
  restyle the game file. Everything you build lives in the React shell.
- Match the game's look: background `#F3F6F2`, cards `#FFFFFF` with border `#DCE4DD` and 14–16px radius,
  ink `#23342A`, muted text `#6E7D74`, accent green `#1F7A4C`, gold `#C98A1B` for the Master Baiter tag.
  Fonts: Archivo for text, DM Mono uppercase with letter-spacing for small labels. Keep it calm and clean.
- No payments or monetisation.

**1. Sign in (`/signin`)**
- Email + password sign-up and sign-in, a "forgot password" flow, and Continue with Google.
- On first sign-in, ask for a public display name (3–20 characters, unique, no offensive words).
  Store it in a `profiles` table (`id` = auth user id, `display_name`, `created_at`).
- A simple `/profile` page: change display name, sign out, delete account.
- After sign-in or sign-out, go back to `/` (the game).

**2. The bridge the game already calls**
Extend the `window.dailyBaitsApi` object in `GameFrame.tsx` (keep `haptic` as it is):
- `getPlayer()` → returns `{ name }` for the signed-in user, or `null` for a guest. It must be synchronous,
  so keep the current profile in memory.
- `openSignIn()` → navigate to `/signin`.
- `openProfile()` → navigate to `/profile`.
- `openLeaderboard()` → navigate to `/leaderboard`.
- `submitScore(score)` → called once when a player finishes the daily round. The argument is
  `{ day, venue, seed, pts, kg, casts, log }`. If the user is signed in, save it (see 3). If not, keep it in
  `sessionStorage` and save it right after they sign in, if `day` is still today.
- Whenever the auth state changes, call `iframe.contentWindow.dailyBaits?.refresh()` so the game's home
  screen shows the player's name instead of "Sign in".

**3. Saving scores safely**
- Table `daily_scores`: `id`, `user_id`, `day` (int), `venue` (text), `pts` (int), `kg` (numeric),
  `casts` (int), `log` (jsonb), `created_at`. Unique on (`user_id`, `day`): one score per player per day.
- Turn on row level security. Anyone may read the public leaderboard view; nobody may insert or update
  rows directly from the client.
- Save scores only through an edge function / server function `submit-score` that:
  - checks the user is signed in,
  - checks `day` equals today's game day, computed the same way as the game:
    `floor((UTC midnight of today's local date − Date.UTC(2026, 9, 25)) / 86400000) + 1`
    (allow ±1 day for time zones),
  - checks `casts === 10`, `0 ≤ pts ≤ 12000` and `0 ≤ kg ≤ 2000`,
  - inserts the row and rejects duplicates for the same day.
- A `leaderboard` view (or RPC) that joins `display_name` and never exposes emails or user ids.

**4. Leaderboard page (`/leaderboard`)**
- Tabs: **Today**, **This week** (sum of the last 7 days), **All time** (best single day).
- Each row: rank, display name, points, kg. Highlight the signed-in player's own row and always show
  their rank, even if they're outside the top 50.
- The #1 player on **Today** gets a gold pill tag that says **Master Baiter**. Show past Master Baiters as
  a small "Hall of fame" list (date, name, points) below the board.
- Ties: higher kg wins, then the earlier submission.
- Guests see the board and a "Sign in to post your score" button.
- A "Back to the water" button that returns to `/`.
- Keep the queries bounded (top 50 + the player's own rank); never download whole score histories.
