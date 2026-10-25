# Stripe setup for Daily Baits

Daily Baits uses its own Stripe account, **Daily Baits**, inside the same organisation as Daily Holes.
Do all of this in that account (check the account switcher at the top left of the Stripe dashboard).
Do it in **test mode** first, then repeat in live mode.

## 1. Products and prices

Create these products. The **lookup key** on each price is what the code asks Stripe for, so it must
match exactly. Prices are the same as Daily Holes and include VAT (set *Include tax in price* to **Yes**).

| Product | Type | Price | Lookup key |
|---|---|---|---|
| Re-fish | One-time | €0.89 | `refish_single` |
| Re-fish ×3 | One-time | €1.99 | `refish_pack3` |
| Custom bobber colour | One-time | €1.99 | `custom_bobber` |
| Custom line colour | One-time | €1.99 | `custom_line` |
| Custom colours: bobber + line | One-time | €2.99 | `custom_pair` |
| Daily Baits Pro | Recurring, monthly | €4.99 | `club_monthly` |
| Daily Baits Pro | Recurring, yearly | €39.00 | `club_yearly` |

Optional: add currency options on each price (USD, GBP, SEK…) the same way Daily Holes does. The site
shows the visitor's currency only when the price has it, and otherwise falls back to euros.

## 2. Settings
- **Tax:** turn on Stripe Tax and add your registrations, as for Daily Holes.
- **Customer portal** (Settings → Billing → Customer portal): allow cancelling the subscription,
  switching between monthly and yearly, and updating the payment method. Set the return link to the site.
- **Branding:** name "Daily Baits", the game's green `#1F7A4C`, and an icon.
- **Statement descriptor:** `DAILY BAITS`.

## 3. Keys for Lovable
Lovable needs the keys **from the Daily Baits account**, not the Daily Holes one:
- the publishable key (`pk_test_…` / `pk_live_…`),
- the secret key (`sk_test_…` / `sk_live_…`), stored as a secret, never in the code,
- the webhook signing secret (`whsec_…`) for the endpoint Lovable creates.

Webhook events to send: `checkout.session.completed`, `customer.subscription.created`,
`customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`,
`invoice.payment_failed`, `charge.refunded`.

## 4. Test it
In test mode, use card `4242 4242 4242 4242` with any future date and any CVC:
buy a re-fish, buy both colours, start the Pro monthly plan, then cancel it in the portal.
Check that each one changes the game (the shop shows *Owned* / *You're a member*).
