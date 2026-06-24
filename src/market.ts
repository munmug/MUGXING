import { marketPulseData } from '@/data/mockMarket';
import type { MarketPulseItem } from '@/lib/types';

// ============================================================
// Market data service
// ------------------------------------------------------------
// Single seam between the UI and live data. Components call
// getMarketPulse() and receive the SAME typed shape they always
// used (MarketPulseItem[]). If the backend isn't configured or
// fails, we fall back to the bundled fixture so the app never
// shows an empty ticker.
// ============================================================

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
// New-format publishable key (sb_publishable_...). Safe to ship in the bundle.
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
const FUNCTION_PATH = '/functions/v1/market-pulse';

export interface MarketPulseResult {
  items: MarketPulseItem[];
  /** true = served from the live provider; false = fixture fallback */
  live: boolean;
  asOf: string;
}

function fallback(): MarketPulseResult {
  return { items: marketPulseData, live: false, asOf: new Date().toISOString() };
}

export async function getMarketPulse(signal?: AbortSignal): Promise<MarketPulseResult> {
  // Backend not wired up yet → keep working with the fixture.
  if (!SUPABASE_URL || !SUPABASE_KEY) return fallback();

  try {
    const res = await fetch(`${SUPABASE_URL}${FUNCTION_PATH}`, {
      // Publishable keys go in the apikey header (not Authorization: Bearer).
      headers: { apikey: SUPABASE_KEY },
      signal,
    });
    if (!res.ok) throw new Error(`market-pulse ${res.status}`);

    const data = (await res.json()) as Partial<MarketPulseResult>;
    if (!Array.isArray(data.items) || data.items.length === 0) throw new Error('empty payload');

    return {
      items: data.items,
      live: data.live ?? true,
      asOf: data.asOf ?? new Date().toISOString(),
    };
  } catch {
    // Any failure (network, auth, rate limit) → graceful fallback.
    return fallback();
  }
}
