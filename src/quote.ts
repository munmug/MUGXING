import type { IndicatorCard } from '@/lib/types';

// ============================================================
// Stock quote service
// ------------------------------------------------------------
// Fetches a live quote + computed 20-day volatility for a symbol
// via the stock-quote Edge Function. Reused by Quick Analysis
// indicator cards now, and Phase 3/4 later. Returns live:false
// on any failure so callers keep their existing values.
// ============================================================

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export interface QuoteData {
  symbol: string;
  price: number | null;
  changePct: number | null;
  dayLow: number | null;
  dayHigh: number | null;
  week52Low: number | null;
  week52High: number | null;
  volatility20d: number | null;
  live: boolean;
}

const EMPTY: QuoteData = {
  symbol: '', price: null, changePct: null, dayLow: null, dayHigh: null,
  week52Low: null, week52High: null, volatility20d: null, live: false,
};

/** Heuristic: US-style ticker (covered by Twelve Data free tier). */
export function isUSEquitySymbol(symbol: string): boolean {
  return /^[A-Z]{1,5}$/.test(symbol.trim());
}

export async function getStockQuote(symbol: string, signal?: AbortSignal): Promise<QuoteData> {
  if (!SUPABASE_URL || !SUPABASE_KEY || !symbol) return { ...EMPTY, symbol };
  try {
    const res = await fetch(
      `${SUPABASE_URL}/functions/v1/stock-quote?symbol=${encodeURIComponent(symbol)}`,
      { headers: { apikey: SUPABASE_KEY }, signal },
    );
    if (!res.ok) throw new Error(`stock-quote ${res.status}`);
    const data = (await res.json()) as QuoteData;
    return { ...EMPTY, ...data };
  } catch {
    return { ...EMPTY, symbol };
  }
}

/**
 * Given the existing indicator cards and a live quote, return a new
 * card array with the two quote-derived cards (key range + volatility)
 * replaced by live values when available. Sentiment / short-ratio are
 * left untouched — not available on the free data tier.
 */
export function applyLiveIndicators(
  cards: IndicatorCard[],
  q: QuoteData,
): IndicatorCard[] {
  if (!q.live) return cards;
  return cards.map((card) => {
    if (card.label === '关键区间' && q.dayLow != null && q.dayHigh != null) {
      return { ...card, value: `$${q.dayLow.toFixed(1)}-$${q.dayHigh.toFixed(1)}`, subtext: '当日波动区间' };
    }
    if (card.label === '20日波动率' && q.volatility20d != null) {
      const v = q.volatility20d;
      const tag = v >= 40 ? '偏高' : v >= 25 ? '中等' : '偏低';
      return { ...card, value: `${v.toFixed(1)}%`, subtext: tag };
    }
    return card;
  });
}
