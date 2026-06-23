import { tr } from '@/lib/lang';
import { motion } from 'framer-motion';

interface IntentInputProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  compact?: boolean;
}

export default function IntentInput({ value, onChange, onSubmit, placeholder, focused, onFocus, onBlur, compact = false }: IntentInputProps) {
  const canSubmit = value.trim().length > 0;

  return (
    <motion.div
      className={`relative mx-auto ${compact ? 'w-full max-w-[500px]' : 'w-full max-w-[760px]'}`}
      animate={{ scale: focused ? 1.003 : 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <div
        className={`relative rounded-[28px] transition-all duration-400 border ${
          focused
            ? 'border-xing-border-active bg-xing-input-focus shadow-[0_0_0_1px_rgba(222,255,154,0.04),0_0_36px_rgba(222,255,154,0.12)]'
            : 'border-xing-green/42 bg-xing-input shadow-[0_0_0_1px_rgba(222,255,154,0.015),0_0_28px_rgba(222,255,154,0.06)] hover:bg-xing-input-hover hover:border-xing-border-active/70'
        }`}
      >
        {/* Left sparkle icon */}
        <div className="absolute left-5 top-1/2 -translate-y-1/2">
          <i className="ri-sparkling-line text-lg text-xing-green/70" />
        </div>

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && canSubmit) onSubmit();
          }}
          placeholder={placeholder || tr('输入标的、研究问题，或你想验证的观点')}
          className={`w-full bg-transparent text-xing-text placeholder:text-xing-text-3/50 outline-none ${
            compact ? 'h-12 pl-10 pr-12 text-sm' : 'h-[76px] pl-12 pr-16 text-[16px]'
          } font-medium tracking-[0.01em]`}
          autoComplete="off"
          spellCheck={false}
        />

        {/* Submit button */}
        <button
          onClick={onSubmit}
          disabled={!canSubmit}
          className={`absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full border transition-all duration-200 ${
            canSubmit
              ? 'bg-xing-green/10 border-xing-green/30 hover:bg-xing-green/18 hover:border-xing-green/50 text-xing-green active:scale-95 cursor-pointer'
              : 'bg-transparent border-transparent text-xing-text-disabled/25 cursor-default'
          }`}
        >
          <i className={`ri-arrow-right-up-line ${canSubmit ? 'text-lg' : 'text-lg opacity-35'}`} />
        </button>
      </div>
    </motion.div>
  );
}