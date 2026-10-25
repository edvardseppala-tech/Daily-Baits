# Prompts for Lovable: accounts, leaderboard, Stripe and site pages

These replace the earlier prompts. Send them **one at a time**, and wait until each one works before
sending the next. Before prompt 3, do the Stripe dashboard steps in `docs/STRIPE_SETUP.md`.

## Prompt 1: Accounts

```text
Daily Baits is a daily fishing game. The game is public/dailybaits.html and is shown full screen by src/GameFrame.tsx. Never edit, rewrite or restyle the game file. The game already draws its own sign-in sheet, profile, tab bar, burger menu, shop and leaderboard. Your job is to give it real data through window.dailyBaitsApi. The exact contract, with types, is in src/lib/daily-baits-api.ts. Read it first and follow it exactly.

Use Lovable Cloud (Supabase) for accounts:
- Email + password, password reset, Google sign-in and Apple sign-in. The game's sign-in sheet puts "Continue with Apple" and "Continue with Google" at the top, so both providers must really work: set them up in Lovable Cloud auth (Apple needs an Apple Developer Services ID and key; Google needs an OAuth client). signInWithProvider should resolve only once the player is signed in, or throw if they cancel.
- A profiles table: id (auth user id), display_name (3–20 characters, unique, no offensive words), created_at.
- In GameFrame.tsx, implement these on window.dailyBaitsApi: getPlayer (synchronous: keep { name, tier } in memory; tier is "free" for now), signIn, signUp (with display name; return { needsConfirm: true } if email confirmation is needed), signInWithProvider, resetPassword, signOut, renameMe, deleteAccount. Keep haptic and submitScore working.
- Throw an Error with a short, friendly message when something fails. The game shows error.message to the player.
- Whenever the auth state changes, call iframe.contentWindow.dailyBaits?.refresh().
- Add a /reset-password page for the email link (new password form, then back to /).
- Style any page you add like the game: background #F3F6F2, white cards with border #DCE4DD and 14–16px corners, text #23342A, muted #6E7D74, green #1F7A4C, gold #C98A1B. Font Archivo, with small uppercase labels in DM Mono.
```

## Prompt 2: Scores, leaderboard and re-fish

```text
Add scores and the leaderboard behind window.dailyBaitsApi (see src/lib/daily-baits-api.ts).

Tables (row level security on everywhere; the browser may read only its own rows and the public leaderboard, and may never write scores or tokens directly):
- daily_scores: user_id, day (int), venue, pts (int), kg (numeric), casts (int), log (jsonb), attempts (int, default 1), created_at, updated_at. Unique (user_id, day).
- refish_tokens: id, user_id, source ("purchase" or "club"), stripe_session_id (unique, nullable), used_for (int day, nullable), used_at (nullable), environment ("sandbox" or "live"), created_at.

The game day is floor((UTC midnight of today's date − Date.UTC(2026, 9, 25)) / 86400000) + 1. Accept today ±1 for time zones.

Server functions (service role, signed-in user only):
- submitScore(score): check day is today, casts === 10, 0 ≤ pts ≤ 12000, 0 ≤ kg ≤ 2000. If the player has no row for the day, insert it. If they already have one, accept it only when they have started a re-fish for that day that hasn't been used yet (re-fishes used for the day ≥ attempts). Then increase attempts by 1 and keep whichever score is higher. Otherwise reject it.
- startRefish(day): day must be today and the player must already have a score for it. If a started re-fish is still unused, return { ok: true, source: "armed" }. Otherwise use a Club re-fish if they're a member with some left today (2 per day: insert a "club" token with used_for = day), else use their oldest unused bought token (atomic update). Otherwise return { ok: false, reason: "No re-fishes left" }.
- entitlements(day): { tier, refishTokens (unused bought tokens), clubRefishLeft (members: 2 minus club tokens used today; others 0), refishArmed, owned: { bobber, line } }. Tier is "free" until prompt 3.
- leaderboard(scope): scope "today" | "week" (sum of the last 7 days) | "all" (best single day). Return the top 50 { rank, name, pts, kg, club, master, me } plus me: the signed-in player's own { rank, pts, kg } even outside the top 50. master is true for today's number 1. For "today", also return hall: the last 14 days' winners as { day, name, pts }. Ties: higher kg, then earlier submission. Never expose emails or user ids. Keep the queries bounded.
- If a guest finishes the daily round, keep their submitScore payload in sessionStorage and submit it right after they sign in, if it's still the same day.
```

## Prompt 3: Stripe payments (Daily Baits account)

```text
Add Stripe payments. Use the Daily Baits Stripe account. It is in the same Stripe organisation as Daily Holes but is a separate account, so use only its keys. Use test mode first. The products are listed in docs/STRIPE_SETUP.md, and the code always looks prices up by lookup key: refish_single, refish_pack3, custom_bobber, custom_line, custom_pair, club_monthly, club_yearly.

Tables (row level security on, server-only writes):
- subscriptions: user_id, stripe_customer_id, stripe_subscription_id (unique), lookup_key, status, current_period_end, cancel_at_period_end, environment, updated_at.
- cosmetics: user_id, item ("bobber" or "line"), stripe_session_id, environment, created_at. Unique (user_id, item, environment).
- customization: user_id (primary key), bobber, bobber_color, line_color, updated_at.

Server functions:
- displayPrices(): fetch the prices by lookup key and return { currency, zeroDecimal, taxed, amounts } in minor units. Use the visitor's currency (from the cf-ipcountry header) only if the price has that currency option, otherwise euros. taxed = the price's tax behaviour is inclusive.
- createCheckout(key, source): signed-in only. Refuse a colour the player already owns, custom_pair if they own either colour, and the Club if they're already a member. Find or create the Stripe customer with metadata.userId. Create an embedded Checkout Session (mode "subscription" for club_*, otherwise "payment") with metadata { userId, key, source } (also on subscription_data for subscriptions) and automatic tax. Return the client secret.
- billingPortal(): open the Stripe customer portal and return to the site. Only allow return URLs on our own domains.
- Webhook (verify the signature): on checkout.session.completed for a payment, grant refish_single = 1 token, refish_pack3 = 3 tokens, custom_bobber / custom_line / custom_pair = the matching cosmetics rows. It must be idempotent by session id. On customer.subscription.created/updated/deleted, upsert the subscriptions row. On charge.refunded, remove unused tokens and the cosmetics from that session.
- Tier: "club" while a club_* subscription is active or trialing (or past_due within 3 days), else "free". Use it in getPlayer, entitlements and the leaderboard club flag.
- getCustomization / saveCustomization: bobber must be one of classic, pine, sunset, ghost, gold, and only members may save anything but classic. bobber_color needs the bobber cosmetic and line_color the line cosmetic, and both must be valid #rrggbb colours.

In GameFrame.tsx, implement on window.dailyBaitsApi: displayPrices, buy(key, source), manageMembership, customization, saveCustomization, and make entitlements/getPlayer return real data. buy() opens Stripe Embedded Checkout in a centred overlay above the game, with a close button. When the purchase completes, close it, re-read the account and call iframe.contentWindow.dailyBaits?.refresh(). Do the same when the player comes back from the portal.

deleteAccount must cancel any active subscription first, then delete the player's rows, then the auth user.

Test-mode publishable keys start with pk_test_ and live ones with pk_live_. Store the environment ("sandbox" or "live") on every payment row and only count rows from the current environment.
```

## Prompt 4: Site pages and menu links

```text
The game's burger menu calls window.dailyBaitsApi.openPage(path). Implement openPage to navigate to these pages and add them, styled like the game (see prompt 1), each with a "Back to the water" link to /:
- /how-to-play: how Daily Baits works: one seeded water a day, 10 casts, read the depth and cover, shadows only hint at the species, lures (Popper shallow, Spinner mid, Jig deep), cast accuracy, strike timing, tension reeling, points from size × rarity (Common ×1 to Legendary ×9), Explore (30 casts a day, unlimited for Club), the handbook, and the Master Baiter tag.
- /pricing: free to play; Re-fish €0.89 or 3 for €1.99; custom bobber or line colour €1.99 each, €2.99 for both (kept forever, not part of the Club); Daily Baits Club €4.99/month or €39/year (4 months free): unlimited Explore, 2 re-fishes a day, every bobber style including gold, a Club badge, cancel anytime. Show live prices from displayPrices when available. VAT included.
- /about, /contact (a simple email contact), /privacy, /terms and /refunds. Base these on the Daily Holes ones, but say Daily Baits and describe Daily Baits' purchases.
Also add a sitemap and good meta titles/descriptions for each page, with og:image /assets/venue-lake.webp.
```
