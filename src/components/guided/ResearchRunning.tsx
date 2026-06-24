import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, XCircle, Loader2 } from 'lucide-react';
import Stepper from '@/components/common/Stepper';
import ProgressBar from '@/components/common/ProgressBar';
import SourceCard from '@/components/common/SourceCard';
import { getContextDataSources, getContextResearchSkeleton } from '@/lib/researchContext';
import type { DataSourceCard, ResearchSkeletonItem, ResearchContext } from '@/lib/types';
import { tr } from '@/lib/lang';

// ────────────────────────────────────────────────────────────
// Deterministic types
// ────────────────────────────────────────────────────────────

type RunStep = 'planning' | 'collecting' | 'analyzing' | 'checking' | 'writing' | 'completed';

interface SourceProgress {
  id: string;
  title: string;
  publisher: string;
  category: 'official' | 'sellside' | 'supplementary';
  current: number;
  total: number;
  status: 'pending' | 'processing' | 'fetched' | 'failed';
}

interface SkeletonProgress {
  label: string;
  current: number;
  total: number;
  status: 'pending' | 'processing' | 'completed';
}

// ────────────────────────────────────────────────────────────
// Deterministic builders — no random
// ────────────────────────────────────────────────────────────

function clamp(n: number, max: number): number {
  return Math.min(Math.max(0, n), max);
}

function buildSourceProgress(ctx: ResearchContext | null): SourceProgress[] {
  const fallbackCtx = ctx || { subject: { type: 'theme' as const, name: '未知' }, originalPrompt: '' } as ResearchContext;
  const rawSources = getContextDataSources(fallbackCtx);
  return rawSources.map((s, i) => {
    const total = i < 4 ? 8 : i < 8 ? 6 : 5;
    return {
      id: s.id,
      title: s.title,
      publisher: s.publisher,
      category: s.category,
      current: 0,
      total,
      status: 'pending' as const,
    };
  });
}

function buildSkeletonProgress(ctx: ResearchContext | null): SkeletonProgress[] {
  const fallbackCtx = ctx || { subject: { type: 'theme' as const, name: '未知' }, originalPrompt: '' } as ResearchContext;
  const raw = getContextResearchSkeleton(fallbackCtx);
  return raw.map((item) => ({
    label: item.label,
    current: 0,
    total: 1,
    status: 'pending' as const,
  }));
}

function hasConflict(ctx: ResearchContext | null): boolean {
  if (!ctx) return false;
  const name = ctx.subject.name;
  // Tencent Cloud → conflict
  if (name.includes('腾讯云') || (name.includes('Tencent') && name.includes('Cloud')) || ctx.originalPrompt.includes('腾讯云')) {
    return true;
  }
  // TSLA → no conflict
  if (ctx.subject.symbol === 'TSLA' || ctx.originalPrompt.includes('TSLA') || ctx.originalPrompt.includes('tsla') || ctx.originalPrompt.includes('特斯拉')) {
    return false;
  }
  // Semiconductor → no conflict
  if (name.includes('半导体') || ctx.originalPrompt.includes('半导体') || ctx.originalPrompt.includes('芯片') || ctx.originalPrompt.includes('AI 算力')) {
    return false;
  }
  return ctx.conflicts.length > 0;
}

// ────────────────────────────────────────────────────────────
// Timing constants (ms)
// ────────────────────────────────────────────────────────────

const T_PLANNING = 800;
const T_COLLECTING = 2400;
const T_ANALYZING = 4000;
const T_CHECKING = 5200;
const T_WRITING = 6000;
const T_COMPLETED = 6800;
const T_FLASH_DURATION = 700;

// ────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────

interface ResearchRunningProps {
  context: ResearchContext | null;
  onBack: () => void;
  onComplete: (hasConflict: boolean) => void;
  onAbort: () => void;
}

export default function ResearchRunning({ context, onBack, onComplete, onAbort }: ResearchRunningProps) {
  const [runStep, setRunStep] = useState<RunStep>('planning');
  const [sources, setSources] = useState<SourceProgress[]>(() => buildSourceProgress(context));
  const [skeleton, setSkeleton] = useState<SkeletonProgress[]>(() => buildSkeletonProgress(context));
  const [showFlash, setShowFlash] = useState(false);
  const [showAbortModal, setShowAbortModal] = useState(false);

  const hasCompletedRef = useRef(false);
  const abortedRef = useRef(false);
  const timerIdsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervalIdsRef = useRef<ReturnType<typeof setInterval>[]>([]);

  const shouldConflict = useMemo(() => hasConflict(context), [context]);

  // Rebuild when context changes
  useEffect(() => {
    setSources(buildSourceProgress(context));
    setSkeleton(buildSkeletonProgress(context));
    setRunStep('planning');
    hasCompletedRef.current = false;
    abortedRef.current = false;
  }, [context]);

  // ── cleanup helper ──
  const clearAllTimers = useCallback(() => {
    timerIdsRef.current.forEach(clearTimeout);
    intervalIdsRef.current.forEach(clearInterval);
    timerIdsRef.current = [];
    intervalIdsRef.current = [];
  }, []);

  // ── abort ──
  const handleConfirmAbort = useCallback(() => {
    abortedRef.current = true;
    clearAllTimers();
    setShowAbortModal(false);
    onAbort();
  }, [clearAllTimers, onAbort]);

  const handleCancelAbort = useCallback(() => {
    setShowAbortModal(false);
  }, []);

  const handleClickAbort = useCallback(() => {
    setShowAbortModal(true);
  }, []);

  // ── Main state machine ──
  useEffect(() => {
    if (hasCompletedRef.current) return;
    abortedRef.current = false;

    const timers: ReturnType<typeof setTimeout>[] = [];
    const intervals: ReturnType<typeof setInterval>[] = [];
    timerIdsRef.current = timers;
    intervalIdsRef.current = intervals;

    // Phase: planning → collecting
    timers.push(setTimeout(() => {
      if (abortedRef.current) return;
      setRunStep('collecting');
    }, T_PLANNING));

    // Phase: start source fetching wave 1 (collecting)
    timers.push(setTimeout(() => {
      if (abortedRef.current) return;
      setSources((prev) =>
        prev.map((s, i) => {
          if (i < 4) return { ...s, current: s.total, status: 'fetched' as const };
          if (i < 7) return { ...s, current: clamp(Math.floor(s.total * 0.6), s.total), status: 'processing' as const };
          return s;
        }),
      );
    }, 1200));

    // Phase: source wave 2 + skeleton wave 1
    timers.push(setTimeout(() => {
      if (abortedRef.current) return;
      setSources((prev) =>
        prev.map((s, i) => {
          if (i < 7) return { ...s, current: s.total, status: 'fetched' as const };
          return { ...s, current: clamp(Math.floor(s.total * 0.5), s.total), status: 'processing' as const };
        }),
      );
      setSkeleton((prev) =>
        prev.map((s, i) => (i < 2 ? { ...s, current: 1, status: 'completed' as const } : s)),
      );
    }, 2000));

    // Phase: collecting → analyzing
    timers.push(setTimeout(() => {
      if (abortedRef.current) return;
      setRunStep('analyzing');
    }, T_COLLECTING));

    // Phase: sources all done + skeleton wave 2
    timers.push(setTimeout(() => {
      if (abortedRef.current) return;
      setSources((prev) =>
        prev.map((s) => ({ ...s, current: s.total, status: 'fetched' as const })),
      );
      setSkeleton((prev) =>
        prev.map((s, i) => (i < 5 ? { ...s, current: 1, status: 'completed' as const } : s)),
      );
    }, 3200));

    // Phase: analyzing → checking
    timers.push(setTimeout(() => {
      if (abortedRef.current) return;
      setRunStep('checking');
      setSkeleton((prev) =>
        prev.map((s, i) => (i < 7 ? { ...s, current: 1, status: 'completed' as const } : s)),
      );
    }, T_ANALYZING));

    // Phase: checking → writing
    timers.push(setTimeout(() => {
      if (abortedRef.current) return;
      setRunStep('writing');
    }, T_CHECKING));

    // Phase: writing — all skeleton done
    timers.push(setTimeout(() => {
      if (abortedRef.current) return;
      setSkeleton((prev) =>
        prev.map((s) => ({ ...s, current: s.total, status: 'completed' as const })),
      );
    }, 5600));

    // Phase: writing → completed
    timers.push(setTimeout(() => {
      if (abortedRef.current) return;
      setRunStep('completed');
    }, T_WRITING));

    // Phase: flash, then complete
    timers.push(setTimeout(() => {
      if (abortedRef.current) return;
      if (hasCompletedRef.current) return;
      setShowFlash(true);
    }, T_COMPLETED));

    timers.push(setTimeout(() => {
      if (abortedRef.current) return;
      if (hasCompletedRef.current) return;
      hasCompletedRef.current = true;
      clearAllTimers();
      onComplete(shouldConflict);
    }, T_COMPLETED + T_FLASH_DURATION));

    return () => {
      timers.forEach(clearTimeout);
      intervals.forEach(clearInterval);
      if (timerIdsRef.current === timers) {
        timerIdsRef.current = [];
        intervalIdsRef.current = [];
      }
    };
    // IMPORTANT: only run once per context change. Do NOT include sources/skeleton in deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context, shouldConflict, onComplete, clearAllTimers]);

  // ── Derived data ──
  const steps = useMemo(() => {
    const stepMap: Record<RunStep, number> = {
      planning: 0,
      collecting: 1,
      analyzing: 2,
      checking: 2,
      writing: 3,
      completed: 4,
    };
    const idx = stepMap[runStep];
    return [
      { label: '研究规划', status: (idx >= 0 && runStep !== 'planning' ? 'completed' : runStep === 'planning' ? 'active' : 'pending') as 'completed' | 'active' | 'pending' },
      { label: '证据收集', status: (idx >= 1 && runStep !== 'collecting' ? 'completed' : runStep === 'collecting' ? 'active' : 'pending') as 'completed' | 'active' | 'pending' },
      { label: '分析推理', status: (idx >= 2 && runStep !== 'analyzing' && runStep !== 'checking' ? 'completed' : (runStep === 'analyzing' || runStep === 'checking') ? 'active' : 'pending') as 'completed' | 'active' | 'pending' },
      { label: '结论输出', status: (idx >= 3 && runStep !== 'writing' ? 'completed' : runStep === 'writing' ? 'active' : 'pending') as 'completed' | 'active' | 'pending' },
    ];
  }, [runStep]);

  const sourceCards: DataSourceCard[] = useMemo(
    () =>
      sources.map((s) => ({
        id: s.id,
        name: s.title,
        domain: s.publisher,
        status: s.status,
        progress: s.total > 0 ? Math.min(100, Math.round((s.current / s.total) * 100)) : 0,
        count: `${clamp(s.current, s.total)}/${s.total}`,
        category: s.category,
      })),
    [sources],
  );

  const skeletonItems: ResearchSkeletonItem[] = useMemo(
    () =>
      skeleton.map((s) => ({
        label: s.label,
        done: clamp(s.current, s.total),
        total: s.total,
      })),
    [skeleton],
  );

  const officialSources = sourceCards.filter((s) => s.category === 'official');
  const sellsideSources = sourceCards.filter((s) => s.category === 'sellside');
  const supplementarySources = sourceCards.filter((s) => s.category === 'supplementary');

  const activePulseLabel =
    runStep === 'planning' ? '研究规划中' :
    runStep === 'collecting' ? '证据收集执行中' :
    runStep === 'analyzing' || runStep === 'checking' ? '分析推理执行中' :
    runStep === 'writing' ? '结论输出执行中' :
    runStep === 'completed' ? '分析完成' : '';

  const tslaLabel = context?.subject?.symbol === 'TSLA' ? ' · TSLA' : '';

  return (
    <div className="flex-1 overflow-y-auto">
      <motion.div
        key={`running-${context?.id ?? 'default'}`}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-[1100px] mx-auto p-8"
      >
        {/* ── Header ── */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="text-foreground-600 hover:text-foreground-950 transition-colors cursor-pointer"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-xs text-foreground-600 font-mono">
            Research Running{tslaLabel}
          </span>
          {context?.subject.symbol && (
            <span className="text-[10px] text-foreground-500 font-mono">
              {context.subject.symbol}
            </span>
          )}
          <div className="ml-auto flex items-center gap-1 text-[10px] text-accent-600/80 font-mono">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                runStep === 'completed' ? 'bg-accent-500' : 'bg-accent-500 animate-pulse'
              }`}
            />
            {activePulseLabel}
          </div>
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-[200px_1fr_240px] gap-8">
          {/* Left: Stepper */}
          <div>
            <div className="text-[11px] text-foreground-500 mb-3 font-mono">{tr('流程进度')}</div>
            <Stepper steps={steps} />
          </div>

          {/* Center: Data Sources */}
          <div>
            <div className="text-[11px] text-foreground-500 mb-3 font-mono">{tr('数据源抓取')}</div>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-2">
                <div className="text-[10px] text-foreground-500 mb-1">{tr('官方资料')}</div>
                {officialSources.map((src) => (
                  <SourceCard key={src.id} {...src} />
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <div className="text-[10px] text-foreground-500 mb-1">{tr('卖方观点')}</div>
                {sellsideSources.map((src) => (
                  <SourceCard key={src.id} {...src} />
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <div className="text-[10px] text-foreground-500 mb-1">{tr('补充证据')}</div>
                {supplementarySources.map((src) => (
                  <SourceCard key={src.id} {...src} />
                ))}
              </div>
            </div>
          </div>

          {/* Right: Research Skeleton */}
          <div>
            <div className="text-[11px] text-foreground-500 mb-3 font-mono">{tr('研究骨架进度')}</div>
            <div className="flex flex-col gap-3 p-3 rounded-lg bg-background-100 border border-background-200/70">
              {skeletonItems.map((item, i) => (
                <ProgressBar
                  key={i}
                  label={tr(item.label)}
                  progress={item.total > 0 ? (item.done / item.total) * 100 : 0}
                  count={`${item.done}/${item.total}`}
                  status={item.done >= item.total ? 'done' : item.done > 0 ? 'running' : 'pending'}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Abort ── */}
        <div className="mt-8 flex justify-center border-t border-background-200/60 pt-6">
          <button
            onClick={handleClickAbort}
            className="flex items-center gap-2 px-5 py-2 rounded-full border border-red-200 text-xs text-red-500/70 hover:text-red-600 hover:border-red-300/60 transition-all cursor-pointer whitespace-nowrap"
          >
            <XCircle size={14} />
            {tr('中止研究')}
          </button>
        </div>
      </motion.div>

      {/* ── Completion Flash Overlay ── */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="bg-background-50 rounded-xl px-10 py-8 flex flex-col items-center gap-4 border border-background-200/70"
            >
              <Loader2 size={28} className="text-accent-500 animate-spin" />
              <span className="text-sm text-foreground-700 font-mono">
                {tr('分析完成，正在生成研究报告...')}
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Abort Confirmation Modal ── */}
      <AnimatePresence>
        {showAbortModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-background-50 rounded-xl p-6 w-[380px] border border-background-200/70"
            >
              <h3 className="text-sm font-medium text-foreground-950 mb-2">{tr('确认中止研究？')}</h3>
              <p className="text-xs text-foreground-600 mb-6 leading-relaxed">
                {tr('当前研究任务尚未完成，中止后将返回研究配置页。')}
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={handleCancelAbort}
                  className="px-4 py-2 rounded-md text-xs text-foreground-700 bg-background-100 hover:bg-background-200/70 transition-colors cursor-pointer whitespace-nowrap"
                >
                  {tr('继续研究')}
                </button>
                <button
                  onClick={handleConfirmAbort}
                  className="px-4 py-2 rounded-md text-xs text-white bg-red-500 hover:bg-red-600 transition-colors cursor-pointer whitespace-nowrap"
                >
                  {tr('确认中止')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}