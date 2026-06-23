// ============================================================
// Supabase Edge Function — edgar
// Pulls real filings + structured financials from SEC EDGAR
// (free, official, no API key — but requires a User-Agent).
// GET ?symbol=TSLA
//
// Deploy:  supabase functions deploy edgar
// No secret needed.
// ============================================================

const CORS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

// EDGAR requires a descriptive User-Agent or it returns 403.
const UA = 'Xing Research Workbench contact@xing.app';

interface Filing { form: string; date: string; accession: string; url: string; description: string; }
interface FinPoint { fy: number; val: number; }
interface EdgarData {
  symbol: string; cik: string; company: string;
  filings: Filing[];
  financials: { revenue: FinPoint[]; netIncome: FinPoint[] };
  live: boolean;
}

declare const Deno: { env: { get(k: string): string | undefined }; serve(h: (req: Request) => Response | Promise<Response>): void };

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
}

// ── Pure helpers (unit-tested) ──────────────────────────────

/** Find a 10-digit zero-padded CIK for a ticker in the company_tickers map. */
export function findCIK(tickers: Record<string, { cik_str: number; ticker: string }>, symbol: string): string | null {
  const want = symbol.trim().toUpperCase();
  for (const k of Object.keys(tickers)) {
    const row = tickers[k];
    if (row && String(row.ticker).toUpperCase() === want) {
      return String(row.cik_str).padStart(10, '0');
    }
  }
  return null;
}

/** Extract the most relevant recent filings (10-K/10-Q/8-K) from a submissions doc. */
export function extractFilings(submissions: { cik?: string | number; filings?: { recent?: Record<string, unknown[]> } }, limit = 8): Filing[] {
  const recent = submissions?.filings?.recent;
  if (!recent) return [];
  const forms = (recent.form || []) as string[];
  const dates = (recent.filingDate || []) as string[];
  const accns = (recent.accessionNumber || []) as string[];
  const docs = (recent.primaryDocument || []) as string[];
  const descs = (recent.primaryDocDescription || []) as string[];
  const cikNum = String(submissions.cik ?? '').replace(/^0+/, '');

  const want = new Set(['10-K', '10-Q', '8-K', '20-F', '6-K']);
  const out: Filing[] = [];
  for (let i = 0; i < forms.length && out.length < limit; i++) {
    if (!want.has(forms[i])) continue;
    const acc = accns[i] || '';
    const accNoDash = acc.replace(/-/g, '');
    out.push({
      form: forms[i],
      date: dates[i] || '',
      accession: acc,
      description: descs[i] || forms[i],
      url: acc && docs[i]
        ? `https://www.sec.gov/Archives/edgar/data/${cikNum}/${accNoDash}/${docs[i]}`
        : `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${cikNum}`,
    });
  }
  return out;
}

/** Pull recent annual values, merging across candidate concepts and
 *  keeping a contiguous recent window (drops stray older years). */
export function extractConcept(facts: { facts?: Record<string, Record<string, { units?: Record<string, Array<{ val: number; fy?: number; fp?: string; form?: string }>> }>> }, concepts: string[], years = 4): FinPoint[] {
  const gaap = facts?.facts?.['us-gaap'];
  if (!gaap) return [];
  // Merge all candidate concepts into one fy->val map (priority concept wins
  // for a given year; later concepts fill gaps like 2020-2022).
  const byFy = new Map<number, number>();
  for (const concept of concepts) {
    const usd = gaap[concept]?.units?.['USD'];
    if (!Array.isArray(usd)) continue;
    for (const p of usd) {
      if ((p.fp === 'FY' || p.form === '10-K') && typeof p.val === 'number' && p.fy && !byFy.has(p.fy)) {
        byFy.set(p.fy, p.val);
      }
    }
  }
  if (!byFy.size) return [];
  const all = [...byFy.entries()].map(([fy, val]) => ({ fy, val })).sort((a, b) => b.fy - a.fy);
  // Keep only a contiguous recent window so stray backfilled years drop out.
  const newest = all[0].fy;
  return all.filter((p) => p.fy > newest - years).slice(0, years);
}

async function getJSON(url: string): Promise<unknown> {
  const r = await fetch(url, { headers: { 'User-Agent': UA, 'Accept': 'application/json' } });
  if (!r.ok) throw new Error(`${url} -> ${r.status}`);
  return r.json();
}

// Cache the big ticker map across invocations.
let tickerCache: { at: number; map: Record<string, { cik_str: number; ticker: string }> } | null = null;
const TICKER_TTL = 6 * 60 * 60 * 1000;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  const symbol = (new URL(req.url).searchParams.get('symbol') || '').trim().toUpperCase();
  if (!symbol) return json({ error: 'missing symbol' }, 400);

  try {
    // 1. ticker -> CIK
    if (!tickerCache || Date.now() - tickerCache.at > TICKER_TTL) {
      const map = (await getJSON('https://www.sec.gov/files/company_tickers.json')) as Record<string, { cik_str: number; ticker: string }>;
      tickerCache = { at: Date.now(), map };
    }
    const cik = findCIK(tickerCache.map, symbol);
    if (!cik) return json({ symbol, error: 'not_found_in_edgar', live: false } as Partial<EdgarData>);

    // 2. submissions + 3. company facts (parallel)
    const [subs, facts] = await Promise.all([
      getJSON(`https://data.sec.gov/submissions/CIK${cik}.json`),
      getJSON(`https://data.sec.gov/api/xbrl/companyfacts/CIK${cik}.json`).catch(() => ({})),
    ]);

    const company = (subs as { name?: string }).name || symbol;
    const filings = extractFilings(subs as Parameters<typeof extractFilings>[0]);
    const revenue = extractConcept(facts as Parameters<typeof extractConcept>[0],
      ['RevenueFromContractWithCustomerExcludingAssessedTax', 'Revenues', 'SalesRevenueNet']);
    const netIncome = extractConcept(facts as Parameters<typeof extractConcept>[0], ['NetIncomeLoss', 'ProfitLoss']);

    const data: EdgarData = { symbol, cik, company, filings, financials: { revenue, netIncome }, live: true };
    return json(data);
  } catch (e) {
    return json({ symbol, error: 'edgar_error', detail: String(e).slice(0, 200), live: false } as Partial<EdgarData>);
  }
});
