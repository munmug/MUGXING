// ============================================================
// Supabase Edge Function — llm
// Provider-agnostic LLM proxy (OpenAI-compatible chat endpoint).
// Holds the model key server-side. Defaults to Google Gemini's
// OpenAI-compatible endpoint; swap providers by changing secrets
// only — no code change.
//
// Secrets:
//   supabase secrets set LLM_API_KEY=your_gemini_key
//   (optional) LLM_BASE_URL  default: Gemini OpenAI-compatible URL
//   (optional) LLM_MODEL     default: gemini-2.5-flash
//
// Deploy:  supabase functions deploy llm
//
// Request body: { system?: string, messages: {role,content}[],
//                 temperature?: number }
// Response:     { text: string }  |  { error: string }
// ============================================================

const CORS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const DEFAULT_BASE_URL =
  'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
const DEFAULT_MODEL = 'gemini-2.5-flash';

declare const Deno: { env: { get(k: string): string | undefined }; serve(h: (req: Request) => Response | Promise<Response>): void };

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const apiKey = Deno.env.get('LLM_API_KEY');
  if (!apiKey) return json({ error: 'not_configured' }); // 200 → frontend falls back

  let payload: { system?: string; messages?: { role: string; content: string }[]; temperature?: number };
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'bad_request' }, 400);
  }

  const baseUrl = Deno.env.get('LLM_BASE_URL') || DEFAULT_BASE_URL;
  const model = Deno.env.get('LLM_MODEL') || DEFAULT_MODEL;

  const messages = [
    ...(payload.system ? [{ role: 'system', content: payload.system }] : []),
    ...(payload.messages || []),
  ];

  try {
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages,
        temperature: payload.temperature ?? 0.2,
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      return json({ error: 'provider_error', status: res.status, detail: detail.slice(0, 500) }, 502);
    }

    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content ?? '';
    return json({ text });
  } catch (e) {
    return json({ error: 'fetch_failed', detail: String(e).slice(0, 200) }, 502);
  }
});
