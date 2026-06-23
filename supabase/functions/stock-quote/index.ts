// ============================================================
// Supabase Edge Function — stock-quote
// GET ?symbol=TSLA  → live quote + computed 20-day volatility.
// Used by Quick Analysis indicator cards (and reusable later).
// Free Twelve Data tier covers US equities incl. time_series.
//
// Deploy:  supabase functions deploy stock-quote
// (TWELVE_DATA_API_KEY secret is already set from Phase 1.)
// ============================================================

interface QuotePayload {
  symbol: string;
  price: number | null;
  changePct: number | null;
  dayLow: number | null;
  dayHigh: number | null;
  week52Low: number | null;
  week52High: number | null;
  volatility20d: number | null; // annualized %, from daily closes
  live: boolean;
}

const CORS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

const cache = new Map<string, { at: number; body: string }>();
const TTL_MS = 30_000;

function num(v: unknown): number | null {
  const n = parseFloat(String(v ?? ''));
  return isFinite(n) ? n : null;
}

/** Annualized volatility (%) from a list of daily closes (order-independent). */
export function annualizedVol(closes: number[]): number | null {
  const c = closes.filter((x) => isFinite(x) && x > 0);
  if (c.length < 5) return null;
  const rets: number[] = [];
  for (let i = 1; i < c.length; i++) rets.push(Math.log(c[i - 1] / c[i]));
  const mean = rets.reduce((a, b) => a + b, 0) / rets.length;
  const variance = rets.reduce((a, b) => a + (b - mean) ** 2, 0) / (rets.length - 1);
  return Math.sqrt(variance) * Math.sqrt(252) * 100;
}

export function buildQuote(symbol: string, quote: Record<string, unknown> | null, closes: number[]): QuotePayload {
  const fw = (quote?.fifty_two_week ?? {}) as Record<string, unknown>;
  const price = num(quote?.close);
  const live = quote != null && (quote as { code?: unknown }).code == null && price != null;
  return {
    symbol,
    price,
    changePct: num(quote?.percent_change),
    dayLow: num(quote?.low),
    dayHigh: num(quote?.high),
    week52Low: num(fw.low),
    week52High: num(fw.high),
    volatility20d: annualizedVol(closes),
    live,
  };
}

declare const Deno: { env: { get(k: string): string | undefined }; serve(h: (req: Request) => Response | Promise<Response>): void };

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  const url = new URL(req.url);
  const symbol = (url.searchParams.get('symbol') || '').trim().toUpperCase();
  if (!symbol) {
    return new Response(JSON.stringify({ error: 'missing symbol' }), { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } });
  }

  const now = Date.now();
  const hit = cache.get(symbol);
  if (hit && now - hit.at < TTL_MS) {
    return new Response(hit.body, { headers: { ...CORS, 'Content-Type': 'application/json', 'X-Cache': 'HIT' } });
  }

  const apiKey = Deno.env.get('TWELVE_DATA_API_KEY');
  if (!apiKey) {
    const body = JSON.stringify(buildQuote(symbol, null, []));
    return new Response(body, { headers: { ...CORS, 'Content-Type': 'application/json' } });
  }

  let quote: Record<string, unknown> | null = null;
  let closes: number[] = [];
  try {
    const [qRes, tRes] = await Promise.all([
      fetch(`https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`),
      fetch(`https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(symbol)}&interval=1day&outputsize=21&apikey=${apiKey}`),
    ]);
    quote = await qRes.json();
    const t = await tRes.json();
    if (Array.isArray(t?.values)) {
      closes = t.values.map((v: { close?: unknown }) => parseFloat(String(v.close))).filter((n: number) => isFinite(n));
    }
  } catch (_e) {
    // leave nulls → live:false
  }

  const body = JSON.stringify(buildQuote(symbol, quote, closes));
  cache.set(symbol, { at: now, body });
  return new Response(body, { headers: { ...CORS, 'Content-Type': 'application/json', 'X-Cache': 'MISS' } });
});
