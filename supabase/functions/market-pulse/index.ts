// ============================================================
// Supabase Edge Function — market-pulse
// Proxies Twelve Data /quote → MarketPulseItem[] for the ticker.
// The Twelve Data API key lives ONLY here (server-side secret),
// never in the React bundle.
//
// Deploy:
//   supabase functions deploy market-pulse
// Set the secret:
//   supabase secrets set TWELVE_DATA_API_KEY=your_key_here
// ============================================================

interface MarketPulseItem {
  label: string;
  value: string;
  change: string;
  status: 'up' | 'down' | 'neutral';
}

// ── Symbol map ──────────────────────────────────────────────
// label  = text shown on the ticker (matches the current UI)
// symbol = Twelve Data symbol
// fallback = used if the API doesn't return this symbol, so the
//            ticker NEVER breaks (graceful degradation per-symbol).
//
// ⚠️ VERIFY the index/commodity symbols against Twelve Data's catalog
//    before going live — index symbols vary by provider:
//    https://api.twelvedata.com/symbol_search?symbol=S%26P%20500&apikey=KEY
//    CSI 300 + WTI in particular may need a paid plan or a different code.
const SYMBOLS: { label: string; symbol: string; fallback: MarketPulseItem }[] = [
  { label: '标普500',  symbol: 'SPX',     fallback: { label: '标普500',  value: '5,468.21',  change: '+0.23%', status: 'up'   } },
  { label: '纳斯达克', symbol: 'IXIC',    fallback: { label: '纳斯达克', value: '17,821.34', change: '+0.39%', status: 'up'   } },
  { label: '恒指',     symbol: 'HSI',     fallback: { label: '恒指',     value: '18,230.45', change: '-0.31%', status: 'down' } },
  { label: '沪深300',  symbol: '000300',  fallback: { label: '沪深300',  value: '3,582.76',  change: '+0.18%', status: 'up'   } },
  { label: '黄金',     symbol: 'XAU/USD', fallback: { label: '黄金',     value: '2,352.10',  change: '+0.21%', status: 'up'   } },
  { label: '原油',     symbol: 'WTI/USD', fallback: { label: '原油',     value: '78.32',     change: '-0.36%', status: 'down' } },
  { label: '美元指数', symbol: 'DXY',     fallback: { label: '美元指数', value: '104.32',    change: '+0.12%', status: 'up'   } },
];

const CORS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

// Module-scope cache protects the rate limit across page loads
// (the isolate is reused between invocations for a while).
let cache: { at: number; body: string } | null = null;
const TTL_MS = 30_000;

function fmt(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Map one Twelve Data quote object to a MarketPulseItem. */
export function toItem(
  label: string,
  q: Record<string, unknown> | undefined,
  fallback: MarketPulseItem,
): { item: MarketPulseItem; live: boolean } {
  const close = parseFloat(String(q?.close ?? ''));
  const pct = parseFloat(String(q?.percent_change ?? ''));
  // Twelve Data error objects carry `code`/`status: "error"` and no numeric close.
  if (q == null || q.code != null || q.status === 'error' || !isFinite(close) || !isFinite(pct)) {
    return { item: fallback, live: false };
  }
  const status: MarketPulseItem['status'] = pct > 0.0001 ? 'up' : pct < -0.0001 ? 'down' : 'neutral';
  const sign = pct > 0 ? '+' : '';
  return {
    item: { label, value: fmt(close), change: `${sign}${pct.toFixed(2)}%`, status },
    live: true,
  };
}

/** Normalize Twelve Data's /quote response into a symbol→quote map. */
export function normalizeQuotes(j: unknown): Record<string, Record<string, unknown>> {
  const out: Record<string, Record<string, unknown>> = {};
  if (j && typeof j === 'object') {
    const obj = j as Record<string, unknown>;
    // Single symbol → flat object with its own `symbol` field.
    if (typeof obj.symbol === 'string') {
      out[obj.symbol] = obj;
    } else {
      // Multiple symbols → keyed by symbol string.
      for (const [k, v] of Object.entries(obj)) {
        if (v && typeof v === 'object') out[k] = v as Record<string, unknown>;
      }
    }
  }
  return out;
}

export function buildPayload(quotes: Record<string, Record<string, unknown>>) {
  let anyLive = false;
  const items = SYMBOLS.map((s) => {
    const { item, live } = toItem(s.label, quotes[s.symbol], s.fallback);
    if (live) anyLive = true;
    return item;
  });
  return { items, live: anyLive, asOf: new Date().toISOString() };
}

// Deno is provided by the Supabase Edge runtime.
declare const Deno: { env: { get(k: string): string | undefined }; serve(h: (req: Request) => Response | Promise<Response>): void };

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  const now = Date.now();
  if (cache && now - cache.at < TTL_MS) {
    return new Response(cache.body, { headers: { ...CORS, 'Content-Type': 'application/json', 'X-Cache': 'HIT' } });
  }

  const apiKey = Deno.env.get('TWELVE_DATA_API_KEY');
  if (!apiKey) {
    const body = JSON.stringify({
      items: SYMBOLS.map((s) => s.fallback),
      live: false,
      asOf: new Date().toISOString(),
      note: 'TWELVE_DATA_API_KEY not set — serving fallback values',
    });
    return new Response(body, { headers: { ...CORS, 'Content-Type': 'application/json' } });
  }

  let quotes: Record<string, Record<string, unknown>> = {};
  try {
    const symbolParam = SYMBOLS.map((s) => s.symbol).join(',');
    const url = `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbolParam)}&apikey=${apiKey}`;
    const r = await fetch(url);
    quotes = normalizeQuotes(await r.json());
  } catch (_e) {
    // Network failure → every symbol falls back below.
  }

  const payload = buildPayload(quotes);
  const body = JSON.stringify(payload);
  cache = { at: now, body };
  return new Response(body, { headers: { ...CORS, 'Content-Type': 'application/json', 'X-Cache': 'MISS' } });
});
