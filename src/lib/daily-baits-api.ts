/* The contract between the website shell and the game (public/dailybaits.html).
   The shell implements this object on `window.dailyBaitsApi`; the game calls it through
   `window.parent.dailyBaitsApi`. Every member is optional: whatever is missing, the game hides.
   After sign-in, sign-out, a purchase or a subscription change, the shell must call
   `iframe.contentWindow.dailyBaits.refresh()` so the game re-reads the account.
   Claude Code owns the game side of this contract; change both sides together. */

export type Tier = "free" | "club";

/** Stripe price lookup keys, in the Daily Baits Stripe account. */
export type ProductKey =
  | "refish_single"   // 1 re-fish, one-time
  | "refish_pack3"    // 3 re-fishes, one-time
  | "custom_bobber"   // custom bobber colour, one-time, kept forever
  | "custom_line"     // custom line colour, one-time, kept forever
  | "custom_pair"     // both colours, one-time
  | "club_monthly"    // Daily Baits Club, subscription
  | "club_yearly";    // Daily Baits Club, subscription

export type Player = { name: string; tier: Tier };

export type Entitlements = {
  tier: Tier;
  refishTokens: number;      // bought, unused re-fishes (never expire)
  clubRefishLeft: number;    // Club re-fishes left today (2 per day for members, 0 otherwise)
  refishArmed: boolean;      // a re-fish was already started today and not yet used up by a submitted round
  owned: { bobber?: boolean; line?: boolean };
};

export type DisplayPrices = {
  currency: string;          // e.g. "eur"
  zeroDecimal: boolean;      // true for currencies like JPY
  taxed: boolean;            // amounts include VAT
  amounts: Partial<Record<ProductKey, number>>; // minor units
};

export type Customization = { bobber: "classic" | "pine" | "sunset" | "ghost" | "gold"; bobberColor: string | null; lineColor: string | null };

export type ScoreSubmission = { day: number; venue: string; seed: number; pts: number; kg: number; casts: number; log: unknown[] };

export type LeaderboardRow = { rank: number; name: string; pts: number; kg: number; me?: boolean; club?: boolean; master?: boolean };
export type Leaderboard = {
  rows: LeaderboardRow[];                       // top 50
  me?: { rank: number; pts: number; kg: number } | null; // the signed-in player's own standing
  hall?: { day: number; name: string; pts: number }[];   // past Master Baiters (today tab only)
};

export interface DailyBaitsApi {
  // account
  getPlayer?(): Player | null;                         // synchronous
  signIn?(email: string, password: string): Promise<void>;
  signUp?(email: string, password: string, name: string): Promise<{ needsConfirm?: boolean } | void>;
  signInWithProvider?(provider: "google" | "apple"): Promise<void>;
  resetPassword?(email: string): Promise<void>;
  signOut?(): Promise<void>;
  renameMe?(name: string): Promise<{ name: string }>;
  deleteAccount?(): Promise<void>;
  // scores
  submitScore?(score: ScoreSubmission): Promise<unknown> | void;
  leaderboard?(scope: "today" | "week" | "all"): Promise<Leaderboard>;
  // Club and purchases
  displayPrices?(): Promise<DisplayPrices>;
  entitlements?(day: number): Promise<Entitlements>;
  buy?(key: ProductKey, source?: string): Promise<void>;   // opens Stripe embedded checkout over the game
  manageMembership?(): Promise<void>;                      // opens the Stripe billing portal
  startRefish?(day: number): Promise<{ ok: boolean; reason?: string; source?: "club" | "token" | "armed" }>;
  customization?(): Promise<Customization | null>;
  saveCustomization?(c: Customization): Promise<void>;
  // site
  openPage?(path: "/how-to-play" | "/pricing" | "/about" | "/privacy" | "/terms" | "/refunds" | "/contact"): void;
  haptic?(ms: number | number[]): void;
  // legacy fallbacks, used only if signIn is missing
  openSignIn?(): void;
}
