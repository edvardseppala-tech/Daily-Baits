# Prompts for Lovable: sign in + leaderboard

Send these one at a time. Wait until each one works before sending the next.

## Prompt 1: Sign in

```text
Add sign in to Daily Baits using Lovable Cloud.

Important: the game is the file public/dailybaits.html and it is shown full screen by src/GameFrame.tsx. Never change the game file. Build everything around it.

- Make a /signin page with email + password, "Forgot password" and "Continue with Google".
- The first time someone signs in, ask them to pick a public name (3–20 characters, must be unique). Save it in a profiles table.
- Make a /profile page where they can change their name, sign out or delete their account.
- After signing in or out, send them back to / (the game).
- Style: background #F3F6F2, white cards with a light border #DCE4DD and rounded corners, dark green text #23342A, grey text #6E7D74, green buttons #1F7A4C. Font Archivo, with small uppercase labels in DM Mono. Calm and clean, no payments.
```

## Prompt 2: Connect sign in to the game

```text
The game talks to the website through window.dailyBaitsApi in src/GameFrame.tsx. Keep haptic as it is and add these:

- getPlayer(): return { name } for the signed-in player, or null for a guest. It must return straight away, so keep the player's name in memory.
- openSignIn(): go to /signin
- openProfile(): go to /profile
- openLeaderboard(): go to /leaderboard
- When someone signs in or out, call iframe.contentWindow.dailyBaits?.refresh() so the game shows their name.

The game then shows a "Sign in" button at the top, which turns into the player's name once they are signed in.
```

## Prompt 3: Leaderboard

```text
Add a daily leaderboard.

Saving scores:
- When a player finishes today's game, the game calls window.dailyBaitsApi.submitScore({ day, venue, seed, pts, kg, casts, log }).
- If they are signed in, save it. If they are a guest, keep it and save it right after they sign in (only if it is still the same day).
- Save it in a daily_scores table with one score per player per day.
- Scores must only be saved through a server function, never written straight from the browser. The function checks: the player is signed in; day is today's game day, which is floor((UTC midnight of today − Date.UTC(2026, 9, 25)) / 86400000) + 1, allowing one day either side for time zones; casts is 10; pts is between 0 and 12000; kg is between 0 and 2000.
- Turn on row level security so nobody can write scores directly, and never show emails.

The /leaderboard page:
- Three tabs: Today, This week (points added up over the last 7 days), All time (best single day).
- Each row shows rank, name, points and kg. Highlight my own row, and always show my rank even if I'm not in the top 50.
- Today's number 1 gets a gold tag (#C98A1B) that says "Master Baiter". Below the board, a small "Hall of fame" lists past Master Baiters with the date, name and points.
- If points are tied, the higher kg wins, then whoever posted first.
- Guests can see the board, plus a "Sign in to post your score" button.
- A "Back to the water" button returns to the game.
- Only load the top 50 plus my own rank, never everyone's full history.
```
