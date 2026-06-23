# Live Market Data — Phase 1 (Market Pulse)

Wires the homepage ticker to **live Twelve Data** quotes through a **Supabase
Edge Function** that holds the API key server-side. Configured for the new
`sb_publishable_*` key format.

## What changed

| File | Role |
|------|------|
| `supabase/functions/market-pulse/index.ts` | Edge Function. Holds the Twelve Data key, fetches quotes, maps to `MarketPulseItem[]`, caches 30s, falls back per-symbol. |
| `supabase/config.toml` | Sets `verify_jwt = false` for the function (required for publishable keys). |
| `src/services/market.ts` | Frontend seam. `getMarketPulse()` calls the function; falls back to the fixture on any failure. |
| `src/components/home/MarketPulse.tsx` | Reads from the service (polls every 60s). Visuals unchanged; shows `LIVE` when data is live. |
| `.env` | Pre-filled with your Supabase URL + publishable key. |

Flow: the browser only ever talks to your Supabase function. The Twelve Data
key never enters the React bundle.

```
Browser ──(publishable key)──> Supabase Edge Fn ──(TWELVE_DATA_API_KEY)──> Twelve Data
   ▲                                                                          │
   └──────────────────── MarketPulseItem[] JSON ◀─────────────────────────────┘
```

## Deploy steps (run on your laptop)

1. **Install + link the Supabase CLI:**
   ```bash
   npm i -g supabase
   supabase login
   supabase link --project-ref nqulfhqrarxaeipajgzk
   ```

2. **Set the Twelve Data key as a secret** (server-side only):
   ```bash
   supabase secrets set TWELVE_DATA_API_KEY=your_twelve_data_key
   ```

3. **Deploy the function** (config.toml already disables JWT verification):
   ```bash
   supabase functions deploy market-pulse
   ```

4. **Run the app:** `npm run dev` — the `.env` is already filled in, so the
   ticker will start pulling live quotes.

## Before going live: verify the symbols

US symbols (SPX, IXIC, DXY) and gold (XAU/USD) are standard. **Confirm these
against your Twelve Data plan** — they vary or may need a paid tier:
`沪深300` (CSI 300, currently `000300`), `恒指` (HSI), `原油` (WTI/USD).

```bash
curl "https://api.twelvedata.com/symbol_search?symbol=CSI%20300&apikey=YOUR_KEY"
```

Edit the `symbol` field in the `SYMBOLS` array in `index.ts`. Any symbol the API
can't return just shows its fallback value — the ticker never breaks.

## A note on protection

The function is a public endpoint (publishable keys can't be verified as JWTs).
Its real safeguard is the **30-second in-function cache**: no matter how often
it's called, Twelve Data is hit at most once every 30s, so your quota is safe.

## Test without keys

With no `TWELVE_DATA_API_KEY` secret set, the function returns fallback values
and the app works exactly as before. The frontend also falls back if the
function is unreachable. The pure mapping logic is covered by a standalone test
(7 assertions, all passing).
