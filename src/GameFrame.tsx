import { useCallback, useEffect, useRef, useState } from "react";

// The game is a self-contained page in public/dailybaits.html. This shell shows it
// full screen and gives it a small bridge for things only the host can do.
export type DailyBaitsScore = { day: number; pts: number; kg: number; log: unknown[] };
declare global {
  interface Window {
    dailyBaitsApi?: { submitScore?: (s: DailyBaitsScore) => void; haptic?: (ms: number | number[]) => void };
  }
}

const LOAD_TIMEOUT_MS = 20000;
type Status = "loading" | "ready" | "failed";

export default function GameFrame({ src, title }: { src: string; title: string }) {
  const [status, setStatus] = useState<Status>("loading");
  const [attempt, setAttempt] = useState(0);
  const ref = useRef<HTMLIFrameElement | null>(null);

  // Install the bridge before the game boots. Scores only log for now; the global
  // leaderboard (and the daily "Master Baiter" tag) will take them later.
  useEffect(() => {
    window.dailyBaitsApi = {
      submitScore: (s) => console.info("[Daily Baits] score", s),
      haptic: (ms) => {
        // Vibration is refused (with a console error) until the player has tapped the page or the game.
        const act = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation;
        if (act && !act.hasBeenActive) return;
        try { navigator.vibrate?.(ms); } catch { /* unsupported */ }
      },
    };
  }, []);

  useEffect(() => {
    setStatus("loading");
    const t = window.setTimeout(() => setStatus((s) => (s === "loading" ? "failed" : s)), LOAD_TIMEOUT_MS);
    return () => window.clearTimeout(t);
  }, [attempt]);

  const onLoad = useCallback(() => {
    try {
      const win = ref.current?.contentWindow as (Window & { __dbBootError?: string | null }) | null;
      if (win?.__dbBootError || !ref.current?.contentDocument?.querySelector("canvas")) { setStatus("failed"); return; }
    } catch { /* cross-origin: trust the load */ }
    setStatus("ready");
  }, []);

  if (status === "failed") {
    return (
      <div role="alert" style={{ height: "100%", display: "grid", placeItems: "center", textAlign: "center", padding: 24 }}>
        <div>
          <div style={{ fontSize: 44 }} aria-hidden>🎣</div>
          <h2 style={{ margin: "8px 0" }}>The water didn't load</h2>
          <p style={{ color: "#6E7D74", maxWidth: 320 }}>Something interrupted the game while it was starting. Your catches are safe.</p>
          <button onClick={() => setAttempt((a) => a + 1)}
            style={{ marginTop: 8, padding: "12px 20px", borderRadius: 12, border: 0, background: "#1F7A4C", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
            Try again
          </button>
        </div>
      </div>
    );
  }
  return (
    <iframe key={attempt} ref={ref} src={src} title={title} onLoad={onLoad} allow="vibrate; clipboard-write; web-share"
      style={{ display: "block", width: "100%", height: "100dvh", border: 0 }} />
  );
}
