import { callLLM } from '@/services/llm';
import { isUSEquitySymbol } from '@/services/quote';
import { getLang, langInstruction, type Lang } from '@/lib/lang';
import type { ResearchContext, ResearchReport, ReportSection, TraceNodeWithSections } from '@/lib/types';

// ============================================================
// Research service (Phase 4)
// ------------------------------------------------------------
// Builds a genuine Guided Research report grounded in real SEC
// EDGAR filings + structured financials, synthesized by the LLM.
// Returns null when it can't (non-US symbol, EDGAR miss, or LLM
// failure) so the caller falls back to the existing report.
// ============================================================

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

interface Filing { form: string; date: string; accession: string; url: string; description: string; }
interface FinPoint { fy: number; val: number; }
export interface EdgarData {
  symbol: string; cik: string; company: string;
  filings: Filing[];
  financials: { revenue: FinPoint[]; netIncome: FinPoint[] };
  live: boolean;
}

export async function fetchEdgar(symbol: string, signal?: AbortSignal): Promise<EdgarData | null> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/edgar?symbol=${encodeURIComponent(symbol)}`, {
      headers: { apikey: SUPABASE_KEY }, signal,
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.live) return null;
    return data as EdgarData;
  } catch {
    return null;
  }
}

/** Real provenance nodes from actual SEC filings. */
export function buildTraceNodes(edgar: EdgarData): TraceNodeWithSections[] {
  return edgar.filings.map((f, i) => ({
    id: `edgar-${i}`,
    label: `${f.form} · ${f.date}`,
    publisher: 'SEC EDGAR',
    date: f.date,
    sourceType: 'official-filing',
    pathType: 'type-safe' as const,
    relatedSections: [],
    extractedSignals: [f.description, f.url].filter(Boolean),
  }));
}

function fmtUSD(v: number): string {
  const abs = Math.abs(v);
  if (abs >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  return `$${v.toLocaleString('en-US')}`;
}

function financialsTable(edgar: EdgarData): string {
  const fmtSeries = (pts: FinPoint[]) => {
    if (!pts.length) return '（无数据）';
    return pts.map((p, i) => {
      const prev = pts[i + 1];
      const yoy = prev && prev.val ? ` (${(((p.val - prev.val) / Math.abs(prev.val)) * 100).toFixed(1)}% YoY)` : '';
      return `FY${p.fy}: ${fmtUSD(p.val)}${yoy}`;
    }).join('; ');
  };
  return `营收: ${fmtSeries(edgar.financials.revenue)}\n净利润: ${fmtSeries(edgar.financials.netIncome)}`;
}

const REPORT_SYSTEM = `你是星(Xing)的资深金融研究分析师。基于提供的 SEC EDGAR 真实备案与财务数据，针对用户的研究问题撰写一份结构化研究报告。只输出严格 JSON，不要 Markdown 代码块或解释。

JSON 结构：
{
  "title": string,
  "subtitle": string,
  "coreConclusion": string,        // 一句话核心结论
  "sections": [
    { "id": "s1", "title": string, "content": string, "sourceNodeIds": [可用节点ID子集] }
  ],
  "nextVerificationSteps": [string],
  "finalConclusion": string
}

要求：
- 4-5 个 sections，覆盖业务/增长、财务质量、风险、估值等维度。
- content 必须引用提供的真实财务数字，不得编造。
- 每个 section 的 sourceNodeIds 必须从"可用证据节点"列表中选取真实存在的 ID。`;

interface ParsedReport { report: ResearchReport; sectionSourceMap: Record<string, string[]>; }

export function parseReportJSON(raw: string, ctx: ResearchContext, validNodeIds: string[]): ParsedReport | null {
  const m = raw.match(/\{[\s\S]*\}/);
  if (!m) return null;
  let obj: Record<string, unknown>;
  try { obj = JSON.parse(m[0]); } catch { return null; }

  const rawSections = Array.isArray(obj.sections) ? obj.sections : [];
  if (!rawSections.length) return null;

  const valid = new Set(validNodeIds);
  const sectionSourceMap: Record<string, string[]> = {};
  const sections: ReportSection[] = rawSections.map((s, i): ReportSection => {
    const sec = (s ?? {}) as Record<string, unknown>;
    const id = typeof sec.id === 'string' && sec.id ? sec.id : `s${i + 1}`;
    const srcs = Array.isArray(sec.sourceNodeIds)
      ? (sec.sourceNodeIds as unknown[]).filter((x): x is string => typeof x === 'string' && valid.has(x))
      : [];
    sectionSourceMap[id] = srcs;
    return {
      id,
      title: typeof sec.title === 'string' ? sec.title : `分析 ${i + 1}`,
      content: typeof sec.content === 'string' ? sec.content : '',
      sourceNodeIds: srcs,
    };
  });

  const strArr = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];

  const report: ResearchReport = {
    title: typeof obj.title === 'string' ? obj.title : `${ctx.subject.name} 研究报告`,
    subtitle: typeof obj.subtitle === 'string' ? obj.subtitle : ctx.researchQuestion,
    tags: ctx.selectedFrameworks as unknown as string[],
    status: '已完成',
    symbolBadge: ctx.subject.symbol,
    coreConclusion: typeof obj.coreConclusion === 'string' ? obj.coreConclusion : '',
    sections,
    nextVerificationSteps: strArr(obj.nextVerificationSteps),
    finalConclusion: typeof obj.finalConclusion === 'string' ? obj.finalConclusion : '',
  };
  return { report, sectionSourceMap };
}

/**
 * Build a real report from SEC data. Returns null on any failure so
 * the caller falls back to the hardcoded report.
 */
export async function generateLiveReport(
  ctx: ResearchContext,
  signal?: AbortSignal,
  lang: Lang = getLang(),
): Promise<{ report: ResearchReport; traceNodes: TraceNodeWithSections[] } | null> {
  const symbol = ctx.subject.symbol;
  if (!symbol || !isUSEquitySymbol(symbol)) return null; // US-only for now (EDGAR)

  const edgar = await fetchEdgar(symbol, signal);
  if (!edgar || !edgar.filings.length) return null;

  const traceNodes = buildTraceNodes(edgar);
  const nodeList = traceNodes.map((n) => `${n.id}: ${n.label} (${n.publisher})`).join('\n');

  const userMsg = `公司: ${edgar.company} (${symbol})
研究问题: ${ctx.researchQuestion}
分析框架: ${ctx.selectedFrameworks.join(', ')}

真实财务数据 (SEC EDGAR XBRL):
${financialsTable(edgar)}

可用证据节点 (sourceNodeIds 只能从中选取):
${nodeList}`;

  const text = await callLLM([{ role: 'user', content: userMsg }], { system: REPORT_SYSTEM + langInstruction(lang), temperature: 0.3, signal });
  if (!text) return null;

  const parsed = parseReportJSON(text, ctx, traceNodes.map((n) => n.id));
  if (!parsed) return null;

  // Back-link: populate each node's relatedSections from the section map.
  for (const node of traceNodes) {
    node.relatedSections = Object.entries(parsed.sectionSourceMap)
      .filter(([, srcs]) => srcs.includes(node.id))
      .map(([sid]) => sid);
  }

  return { report: parsed.report, traceNodes };
}
