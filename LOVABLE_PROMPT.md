Paste this into Lovable after connecting the project to this GitHub repo:

---

This project is **Daily Baits**, a daily fishing game. The game itself is already built as one
self-contained file at `public/dailybaits.html`. Don't rewrite or restyle it; build the website
shell around it.

1. Make the home route (`/`) render the game full-screen in an iframe pointing at
   `/dailybaits.html` (100dvh, no border, no page scroll), with a small recovery screen if the frame
   fails to load or `iframe.contentWindow.__dbBootError` is set after load.
2. Before the iframe loads, expose `window.dailyBaitsApi = { submitScore, haptic }` on the parent page.
   For now `submitScore` can just `console.log` its argument; `haptic(ms)` can call
   `navigator.vibrate(ms)` when available.
3. Add simple pages: `/how-to-play` (the rules from the game's "How to fish" sheet) and `/about`.
4. Match the game's look: background `#F3F6F2`, ink `#23342A`, accent `#1F7A4C`, fonts Archivo
   (text) and DM Mono (labels).
5. No payments or monetisation.

Later step (not now): accounts and a global daily leaderboard in Supabase, where the top score each
day gets the "Master Baiter" tag. Scores arrive through `submitScore`.
