import { useSyncExternalStore } from 'react';
import dict from '@/i18n/dict';

// ============================================================
// Language preference (中文 / English)
// ------------------------------------------------------------
// Controls the language of AI-generated content (reports, intent).
// Lightweight external store so any component can read/set it and
// the services can read the current value without prop-drilling.
// ============================================================

export type Lang = 'zh' | 'en';
const KEY = 'xing-lang';

function read(): Lang {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'en' ? 'en' : 'zh';
  } catch {
    return 'zh';
  }
}

let current: Lang = read();
const listeners = new Set<() => void>();

export function getLang(): Lang {
  return current;
}

export function setLang(lang: Lang): void {
  current = lang;
  try { localStorage.setItem(KEY, lang); } catch { /* ignore */ }
  listeners.forEach((fn) => fn());
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

export function useLang(): Lang {
  return useSyncExternalStore(subscribe, getLang, getLang);
}

/** Instruction appended to LLM system prompts to fix output language. */
export function langInstruction(lang: Lang = current): string {
  return lang === 'en'
    ? '\n\nOutput language: respond in ENGLISH. All natural-language fields (names, focus, titles, section content, conclusions) must be in English.'
    : '\n\n输出语言：中文。所有自然语言字段必须使用中文。';
}

/**
 * Translate a static UI string. Returns English from the dictionary
 * when language is 'en'; otherwise (or if untranslated) returns the
 * original Chinese unchanged. Read at render time, so components that
 * re-render on a language change (AppShell subscribes via useLang)
 * pick up the new language automatically.
 */
export function tr(zh: string): string {
  if (current !== 'en') return zh;
  return dict[zh] ?? zh;
}
