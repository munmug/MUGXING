import { tr, useLang, setLang } from '@/lib/lang';

// Floating 中 / EN switch. Controls the language of AI-generated
// content (reports, intent). Static UI labels are a separate phase.
export default function LanguageToggle() {
  const lang = useLang();
  const base = 'px-2 py-0.5 text-[11px] font-mono rounded-md transition-colors cursor-pointer';
  const on = 'bg-xing-green/15 text-xing-green';
  const off = 'text-xing-text-disabled hover:text-xing-text-2';
  return (
    <div className="fixed top-3 right-3 z-50 flex items-center gap-0.5 bg-xing-card/80 backdrop-blur-sm border border-xing-border-subtle rounded-lg p-0.5">
      <button onClick={() => setLang('zh')} className={`${base} ${lang === 'zh' ? on : off}`} title={tr('中文 AI 输出')}>{tr('中')}</button>
      <button onClick={() => setLang('en')} className={`${base} ${lang === 'en' ? on : off}`} title="English AI output">EN</button>
    </div>
  );
}
