# Xing — Live Data Integration Roadmap

**Goal:** turn Xing from a mock-data prototype into a working AI research workbench backed by real market data, real document retrieval, real LLM analysis, and persistence.

**Current reality (from full code audit):** the app is a well-built shell with four flows. Every "AI research" output is hardcoded for three demo subjects — Tencent Cloud, TSLA, and Semiconductors. Branching is literally `if (name.includes('腾讯云'))` / `subject.symbol === 'TSLA'`. Only the Market Pulse ticker is live so far.

---

## 1. Architecture & principles

Established in Phase 1 and reused everywhere:

- **Service-layer seam.** UI components never call data providers directly. They call a function in `src/services/*` that returns the existing typed shapes from `src/lib/types.ts`. Swapping mock → real happens behind that seam, so UI code barely changes.
- **Keys live server-side.** All provider/LLM keys sit in **Supabase Edge Functions** (secrets), never in the React bundle. The browser only ever calls your own functions.
- **Graceful fallback.** If a backend call fails or isn't configured, the service falls back to the bundled fixture so the app never breaks.
- **Per-call caching** in each Edge Function protects third-party rate limits and controls cost.

```
React (services/*)  ──>  Supabase Edge Fn  ──>  [Twelve Data | Anthropic | SEC EDGAR | ...]
        ▲                  (holds secrets)
        └── typed fallback fixture on any failure
```

---

## 2. Status snapshot

| Item | State |
|------|-------|
| Build fix (framer-motion pin) | Done — bump to 12.41.x |
| Market Pulse ticker (Twelve Data) | **Done & deployed**, free tier = gold only live |
| Supabase project + publishable key | Done (`nqulfhqrarxaeipajgzk`) |
| Twelve Data key | Set as secret (free tier) |
| Everything else | Mock |

**Pending decisions:** (a) Twelve Data Grow plan ($29/mo) to unlock indices/commodities/HK-China, or ETF proxies / static for now; (b) Anthropic API key for all LLM features; (c) retrieval scope for HK filings (see §6).

---

## 3. Integration map

Effort key: **S** ≈ hours · **M** ≈ 1–2 days · **L** ≈ 3–5 days · **XL** ≈ 1–2 weeks.

| Feature | Files | Current source | Real source | Effort | Depends on |
|---------|-------|----------------|-------------|--------|-----------|
| Market Pulse ticker | `services/market.ts`, `home/MarketPulse.tsx` | `mockMarket.ts` | Twelve Data | ✅ done | quotes API |
| Quick Analysis indicators | `quick/QuickResult.tsx` | `mockReports.ts` | Twelve Data (quote/volatility) | M | quotes API |
| Library persistence | `pages/Library.tsx`, `AppShell.tsx` | in-memory `mockSources.ts` | Supabase DB | M | Supabase table |
| Intent routing | `lib/intentRouter.ts` | keyword match | LLM (extract subject+intent) | M | Anthropic key |
| Quick Analysis judgment | `lib/researchContext.ts` | hardcoded TSLA | LLM + live quote | L | LLM + quotes |
| Guided report + conflict + trace | `lib/researchContext.ts`, `guided/*` | hardcoded | retrieval + LLM | XL | LLM + retrieval |
| Research Running fetch | `lib/researchRunner.ts` | fake progress | real fetchers | L | retrieval |
| Studio execution + Copilot | `studio/*`, `mockStudio.ts` | mock nodes/result | node runtime + LLM | XL | LLM + retrieval |
| Data Source Settings | `pages/DataSourceSettings.tsx`, `mockSources.ts` | cosmetic toggles | gate real connectors | M | retrieval |

**The two unlocks:** an **LLM** (Anthropic) lights up routing, all generation, conflict detection, and the Studio copilot. A **retrieval layer** (SEC EDGAR free for US; HK harder) feeds guided/studio research real sources. Persistence and quotes are easy, independent wins.

---

## 4. Phased plan

### Phase 1 — Market data ✅ (done)
Live ticker via Twelve Data + Supabase Edge Function. Free tier only returns gold; indices/commodities need the Grow plan or ETF proxies.
**Next sub-step:** extend the same `market.ts` service to feed Quick Analysis indicator cards (price, 20-day volatility, key range) with live quotes. (Effort M)

### Phase 2 — Persistence (Supabase) — recommended next
Make the Library real so saved research survives a refresh.
- Create a Supabase table `research_items` (id, title, symbol, type, status, payload jsonb, created_at, updated_at).
- New service `src/services/library.ts`: `listItems()`, `saveItem()`, `deleteItem()`.
- Wire `AppShell.tsx` save-to-library + `pages/Library.tsx` to the service instead of `useState(initialLibraryItems)`.
- Add Row Level Security; for a single-user/demo phase, a permissive policy is fine, tighten when auth is added.
**Effort M · Depends on:** Supabase table only (no new keys). **No LLM needed — fully shippable on its own.**

### Phase 3 — LLM core (intent + quick judgment)
One Edge Function `llm` that proxies Anthropic; reused by later phases.
- `lib/intentRouter.ts` → call LLM to return `{ intentType, subject{symbol,name,market}, frameworks }`. Keep the keyword version as offline fallback.
- Quick Analysis judgment in `researchContext.ts` → LLM produces the risk read; live quote fills the numeric indicator cards.
- Strict JSON output from the model, parsed into existing types.
**Effort L · Depends on:** Anthropic key. Big perceived jump — the app starts "understanding" arbitrary inputs.

### Phase 4 — Guided Research (the flagship)
Replace the hardcoded report/conflict/trace with retrieval + synthesis.
- **Retrieval:** SEC EDGAR (free, official) for US filings — `services/retrieval.ts` with an Edge Function fetching 10-K/10-Q/8-K. IR pages + news as secondary. HK filings for Tencent: see §6.
- `researchRunner.ts`: replace fake progress with real per-source fetch status.
- `generateReport` / `generateConflictForContext` / `generateTraceNodes`: LLM reads retrieved docs, emits report sections, detects caliber/metric conflicts, and returns citations that map to the TraceCanvas provenance graph.
- Cache retrieved docs + generated reports in Supabase to control cost.
**Effort XL · Depends on:** LLM + retrieval. Do US names (TSLA/NVDA/AAPL) first; Tencent after HK retrieval is solved.

### Phase 5 — Research Studio execution
Turn the node graph into an executable workflow.
- Define a node runtime: `data` nodes call retrieval/market services; `audit`/`output` nodes call the LLM; results flow along `connections`.
- Studio Copilot → real LLM chat that can read/modify the graph.
- `studioRunResult` becomes the runtime's actual output.
**Effort XL · Depends on:** Phases 3–4 (reuses their services).

### Phase 6 — Data Source Settings → real connectors
Make the 7 toggles actually gate which retrieval sources run, with real status/last-updated from the fetchers. Add real file upload (Supabase Storage) for 用户上传文件.
**Effort M · Depends on:** Phase 4 retrieval.

---

## 5. Suggested build order

```
[done] Phase 1  Market Pulse
   │
   ├─ Phase 2  Library persistence      (no new keys — easy win, do now)
   │
   └─ Phase 3  LLM intent + quick       (Anthropic key)
          │
          └─ Phase 4  Guided research    (LLM + SEC EDGAR)
                 │
                 ├─ Phase 5  Studio runtime
                 └─ Phase 6  Source settings + uploads
```

Phases 2 and 3 are independent and can be done in parallel.

---

## 6. Cross-cutting concerns & honest risks

- **HK / China data gap (important).** Xing's headline example is Tencent (00700.HK), but free/standard sources are US-centric. SEC EDGAR has no HK filings; Massive/Polygon doesn't cover HK at all. Options: (a) scrape HKEXnews (free public portal, no clean API); (b) a paid provider that covers HK filings; (c) lead with US names for the retrieval-heavy flows and treat Tencent as a special-cased source set. **Decide before Phase 4.**
- **Market data plan.** Free Twelve Data = US stocks + forex + crypto only. Indices, commodities, and HK/China need Grow ($29/mo). This also affects Quick Analysis indicators.
- **LLM cost.** Every report/conflict/trace is one or more model calls. Cache aggressively (Supabase), generate on demand not on every view, and set confidence/length caps. Keep the key server-side only.
- **Rate limits.** Each Edge Function caches; tune TTLs per provider. Twelve Data free = 8 req/min, 800/day.
- **i18n.** UI is bilingual (`src/i18n`). LLM prompts should request Chinese output to match the UI; keep labels in the i18n layer.
- **Auth.** Currently none. Phase 2 works single-user; add Supabase Auth before multi-user so RLS scopes data per user.
- **Secrets hygiene.** Publishable key is public (fine). Twelve Data + Anthropic keys are secrets — Supabase only. Rotate any key pasted in plaintext once live.

---

## 7. Decisions needed to proceed

1. **Twelve Data:** upgrade to Grow ($29/mo) for full ticker + indicators, or stay free (gold-only / ETF proxies) for now?
2. **Anthropic API key:** provide one so Phases 3–5 can be built (proxied via Supabase).
3. **Tencent/HK retrieval:** which option in §6 — and is US-first acceptable for the first build of Guided Research?
4. **Next phase to build:** Phase 2 (persistence, no new keys) or Phase 3 (LLM)?
