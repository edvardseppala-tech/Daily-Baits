# Daily Baits

One water a day. Ten casts. Everyone gets the same seeded lake, river, coast or tarn.

- **Knowledge:** read the depth and cover, and learn each species' habitat and lure from the Handbook.
- **Skill:** cast accuracy meter, strike timing, tension reeling. Rarer and bigger fish are harder.
- **Luck:** every fish is a shadow. Its shape is only a clue, and size and rarity are rolled.

Score = (10 + 90 × size ratio) × rarity multiplier (Common ×1 … Legendary ×9), with ×1.25 for trophies.
The top score each day earns the **Master Baiter** tag.

`public/dailybaits.html` is the single source of truth for the game (same principle as Daily Holes).
Native shells and backends talk to it through `window.parent.dailyBaitsApi` (`submitScore`, `haptic`).

## Run
    python3 -m http.server 5180 -d public   # then open /dailybaits.html

## Waters
Still Lake, Fast River and Rocky Coast use the reference paintings in `public/assets/` for the home page.
Frozen Tarn uses `venue-ice.svg`, a placeholder until real art exists. Each map is a big seeded world you can pan and zoom,
with a pier to fish from. 40 species (10 per water), each with a drawn model in `SPECIES[...].m`.

## Roadmap
1. ~~Prototype: casting, shadows, reeling, handbook, local board~~
2. ~~Home page, big maps with piers, 40 species with models~~
3. Real art for Frozen Tarn
4. Accounts + global/friends leaderboard (Supabase), server-side score verification
5. Friends & challenges
6. Launch: domain, OG image
7. iOS shell (WKWebView, push, haptics). No monetisation for now.
