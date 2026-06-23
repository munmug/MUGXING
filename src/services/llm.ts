import { intentRouterEnhanced } from '@/lib/intentRouter';
import { getLang, langInstruction, type Lang } from '@/lib/lang';
import type {
  IntentResult, IntentType, SubjectType, AnalysisFramework, DataSourceType,
} from '@/lib/types';

// ============================================================
// LLM service
// ------------------------------------------------------------
// Talks to the `llm` Edge Function (provider-agnostic, Gemini by
// default). Every public function falls back to the deterministic
// keyword router when the LLM isn't configured or fails, so the
// app keeps working with no key.
// ============================================================

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export interface LLMMessage { role: 'system' | 'user' | 'assistant'; content: string; }

/** Low-level call. Returns the model text, or null on any failure. */
export async function callLLM(
  messages: LLMMessage[],
  opts: { system?: string; temperature?: number; signal?: AbortSignal } = {},
): Promise<string | null> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/llm`, {
      method: 'POST',
      headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ system: opts.system, messages, temperature: opts.temperature }),
      signal: opts.signal,
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.error || typeof data?.text !== 'string' || !data.text.trim()) return null;
    return data.text as string;
  } catch {
    return null;
  }
}

// ── Allowed enum values (the model must stay within these) ──
const INTENT_TYPES: IntentType[] = ['quick', 'guided', 'studio', 'unknown'];
const SUBJECT_TYPES: SubjectType[] = ['stock', 'company', 'sector', 'theme'];
const FRAMEWORKS: AnalysisFramework[] = ['growth-breakdown', 'financial-quality', 'competitive-landscape', 'risk-audit'];
const SOURCES: DataSourceType[] = ['official-filing', 'earnings', 'call-transcript', 'sellside-report', 'industry-data', 'news-sentiment'];

const ROUTING_SYSTEM = `你是星(Xing)金融研究工作台的意图路由器。读取用户的研究问题，输出一个严格的 JSON 对象，描述应如何处理该问题。只输出 JSON，不要包含任何解释或 Markdown 代码块。

JSON 结构与取值范围：
{
  "intentType": "quick" | "guided" | "studio" | "unknown",
  "subject": {
    "type": "stock" | "company" | "sector" | "theme",
    "name": string,            // 标的中文名，如 "微软"、"半导体"
    "symbol": string | null,   // 股票代码，如 "MSFT"、"00700.HK"，无则 null
    "market": "US" | "HK" | "CN" | "global" | null
  },
  "suggestedFrameworks": (含于 ["growth-breakdown","financial-quality","competitive-landscape","risk-audit"]),
  "suggestedSources": (含于 ["official-filing","earnings","call-transcript","sellside-report","industry-data","news-sentiment"]),
  "suggestedFocus": string     // 一句话研究重点（中文）
}

意图判断规则：
- quick：针对单一个股的快速风险/买卖判断（如"还能买吗""风险大吗"）。
- guided：需要拆解、深度分析、财报或增长逻辑研究的问题。
- studio：用户想搭建研究流/工作流/自动化流程。
- unknown：与金融研究无关或无法识别标的。`;

function pickEnum<T extends string>(value: unknown, allowed: T[], fallback: T): T {
  return typeof value === 'string' && (allowed as string[]).includes(value) ? (value as T) : fallback;
}
function filterEnum<T extends string>(arr: unknown, allowed: T[]): T[] {
  if (!Array.isArray(arr)) return [];
  return arr.filter((v): v is T => typeof v === 'string' && (allowed as string[]).includes(v));
}

function parseIntentJSON(raw: string, input: string): IntentResult | null {
  // strip code fences / stray text around the JSON object
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return null;
  let obj: Record<string, unknown>;
  try { obj = JSON.parse(match[0]); } catch { return null; }

  const subj = (obj.subject ?? {}) as Record<string, unknown>;
  const name = typeof subj.name === 'string' && subj.name.trim() ? subj.name.trim() : input.slice(0, 30);
  const symbol = typeof subj.symbol === 'string' && subj.symbol.trim() ? subj.symbol.trim() : undefined;
  const market = typeof subj.market === 'string' && subj.market.trim() ? subj.market.trim() : undefined;

  const frameworks = filterEnum<AnalysisFramework>(obj.suggestedFrameworks, FRAMEWORKS);
  const sources = filterEnum<DataSourceType>(obj.suggestedSources, SOURCES);

  return {
    intentType: pickEnum<IntentType>(obj.intentType, INTENT_TYPES, 'unknown'),
    subject: {
      type: pickEnum<SubjectType>(subj.type, SUBJECT_TYPES, 'theme'),
      name,
      ...(symbol ? { symbol } : {}),
      ...(market ? { market } : {}),
    },
    researchQuestion: input,
    suggestedFrameworks: frameworks.length ? frameworks : ['growth-breakdown'],
    suggestedSources: sources.length ? sources : ['news-sentiment'],
    suggestedFocus: typeof obj.suggestedFocus === 'string' ? obj.suggestedFocus : '',
  };
}

/**
 * Resolve a user prompt into an IntentResult using the LLM.
 * Falls back to the deterministic keyword router on any failure,
 * so callers always get a valid result.
 */
export async function routeIntent(input: string, signal?: AbortSignal, lang: Lang = getLang()): Promise<IntentResult> {
  const fallback = intentRouterEnhanced(input);
  if (!input.trim() || !SUPABASE_URL || !SUPABASE_KEY) return fallback;

  const text = await callLLM(
    [{ role: 'user', content: input }],
    { system: ROUTING_SYSTEM + langInstruction(lang), temperature: 0.1, signal },
  );
  if (!text) return fallback;

  const parsed = parseIntentJSON(text, input);
  return parsed ?? fallback;
}
