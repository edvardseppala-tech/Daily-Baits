Paste this into Lovable now that the repo is connected:

---

This project is **Daily Baits**, a daily fishing game. The game is one self-contained file,
`public/dailybaits.html`, and `src/GameFrame.tsx` already shows it full screen with a
`window.dailyBaitsApi` bridge (`submitScore`, `haptic`). Please don't rewrite or restyle the game file,
and keep the home route showing the game exactly as it does now.

You can add Tailwind/shadcn and routing if you need them. Then add:
1. `/how-to-play`: the rules from the game's "How to fish" sheet.
2. `/about`: a short page about the game.
3. Match the game's look: background `#F3F6F2`, ink `#23342A`, accent `#1F7A4C`, fonts Archivo (text)
   and DM Mono (labels).
4. No payments or monetisation.

Later (not now): accounts and a global daily leaderboard in Supabase. Scores arrive through
`window.dailyBaitsApi.submitScore({ day, pts, kg, log })`, and the top score each day gets the
"Master Baiter" tag.
