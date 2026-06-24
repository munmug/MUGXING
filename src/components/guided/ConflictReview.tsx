import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, AlertTriangle, Check, GitCompare } from 'lucide-react';
import { generateConflictForContext, getConflictResolutionOptions } from '@/lib/researchContext';
import type { ConflictResolution, ResearchContext } from '@/lib/types';
import { tr } from '@/lib/lang';

interface ConflictReviewProps {
  context: ResearchContext | null;
  onBack: () => void;
  onResolve: (resolution: ConflictResolution) => void;
}

export default function ConflictReview({ context, onBack, onResolve }: ConflictReviewProps) {
  const conflict = context ? generateConflictForContext(context) : null;
  const [selected, setSelected] = useState<ConflictResolution>('both');
  const options = getConflictResolutionOptions();

  // If no conflict, render empty state
  if (!conflict) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="text-[13px] text-xing-text-3 mb-2">{tr('未检测到口径冲突')}</div>
          <button
            onClick={() => onResolve('both')}
            className="px-6 py-2.5 rounded-full bg-xing-green text-[#10120A] text-sm font-semibold hover:bg-xing-green-2 transition-all cursor-pointer whitespace-nowrap"
          >
            {tr('继续生成报告')}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-[1000px] mx-auto p-8"
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={onBack} className="text-xing-text-disabled hover:text-xing-text-2 transition-colors cursor-pointer">
            <ChevronLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-xing-red" />
            <span className="text-sm font-semibold text-xing-red">{tr(conflict.title)}</span>
          </div>
          {context?.subject.symbol && (
            <span className="text-[10px] text-xing-text-3 font-mono ml-auto">{context.subject.symbol}</span>
          )}
        </div>

        {/* Main comparison */}
        <div className="grid grid-cols-[1fr_80px_1fr] gap-4 mb-8">
          {/* Original */}
          <div className="p-5 rounded-xl bg-xing-card border border-xing-red/20">
            <div className="text-xs text-xing-red/60 font-mono mb-3">{tr(conflict.original.label)}</div>
            <div className="flex flex-col gap-3">
              <div>
                <div className="text-[11px] text-xing-text-3">{tr('增长率')}</div>
                <div className="text-lg font-semibold text-xing-text font-mono">{conflict.original.growth}</div>
              </div>
              <div>
                <div className="text-[11px] text-xing-text-3">{tr('收入口径')}</div>
                <div className="text-[13px] text-xing-text">{conflict.original.definition}</div>
              </div>
              <div>
                <div className="text-[11px] text-xing-text-3">{tr('不包含')}</div>
                <div className="text-[13px] text-xing-text">{conflict.original.excludes}</div>
              </div>
              <div className="pt-2 border-t border-xing-border">
                <div className="text-[11px] text-xing-text-3">{tr('数据来源')}</div>
                <div className="text-[12px] text-xing-text-2 font-mono">{conflict.original.source}</div>
              </div>
              <div className="inline-flex px-2 py-0.5 rounded-md bg-xing-red/10 text-xing-red text-[11px] w-fit">
                {conflict.original.bias}
              </div>
            </div>
          </div>

          {/* Middle: Conflict indicator */}
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-px flex-1 bg-xing-red/25" />
            <div className="w-10 h-10 rounded-full bg-xing-red/10 border border-xing-red/20 flex items-center justify-center">
              <GitCompare size={16} className="text-xing-red" />
            </div>
            <div className="text-[10px] text-xing-red/70 font-mono text-center whitespace-nowrap">{tr('口径偏差')}</div>
            <div className="w-px flex-1 bg-xing-red/25" />
          </div>

          {/* Adjusted */}
          <div className="p-5 rounded-xl bg-xing-card border border-xing-green/20">
            <div className="text-xs text-xing-green/70 font-mono mb-3">{tr(conflict.adjusted.label)}</div>
            <div className="flex flex-col gap-3">
              <div>
                <div className="text-[11px] text-xing-text-3">{tr('增长率')}</div>
                <div className="text-lg font-semibold text-xing-green font-mono">{conflict.adjusted.growth}</div>
              </div>
              <div>
                <div className="text-[11px] text-xing-text-3">{tr('收入口径')}</div>
                <div className="text-[13px] text-xing-text">{conflict.adjusted.definition}</div>
              </div>
              <div>
                <div className="text-[11px] text-xing-text-3">{tr('包含')}</div>
                <div className="text-[13px] text-xing-text">{conflict.adjusted.includes}</div>
              </div>
              <div className="pt-2 border-t border-xing-border">
                <div className="text-[11px] text-xing-text-3">{tr('数据来源')}</div>
                <div className="text-[12px] text-xing-text-2 font-mono">{conflict.adjusted.source}</div>
              </div>
              <div className="inline-flex px-2 py-0.5 rounded-md bg-xing-green/10 text-xing-green text-[11px] w-fit">
                {conflict.adjusted.bias}
              </div>
            </div>
          </div>
        </div>

        {/* Suggestion */}
        <div className="p-4 rounded-xl bg-xing-card border border-xing-yellow/20 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle size={14} className="text-xing-yellow mt-0.5 shrink-0" />
            <div>
              <div className="text-[12px] font-medium text-xing-yellow mb-1">{conflict.conflictType}</div>
              <p className="text-[12px] text-xing-text-2/80 leading-relaxed">{tr(conflict.suggestion)}</p>
            </div>
          </div>
        </div>

        {/* Resolution options */}
        <div className="mb-8">
          <div className="text-[11px] text-xing-text-disabled font-mono mb-3">{tr('处理方式')}</div>
          <div className="flex flex-col gap-2">
            {options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSelected(opt.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer text-left flex items-start gap-4 ${
                  selected === opt.id
                    ? 'border-xing-border-active bg-xing-card-active'
                    : 'border-xing-border bg-xing-card hover:border-xing-border-hover'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                  selected === opt.id ? 'border-xing-green' : 'border-xing-border-hover'
                }`}>
                  {selected === opt.id && <div className="w-2.5 h-2.5 rounded-full bg-xing-green" />}
                </div>
                <div>
                  <div className={`text-[13px] font-medium ${selected === opt.id ? 'text-xing-text' : 'text-xing-text-2'}`}>
                    {tr(opt.label)}
                  </div>
                  <div className="text-[11px] text-xing-text-3 mt-0.5">{tr(opt.desc)}</div>
                </div>
                {opt.id === 'both' && (
                  <span className="ml-auto text-[10px] text-xing-green/70 font-mono whitespace-nowrap">{tr('推荐')}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Confirm button */}
        <div className="flex justify-center border-t border-xing-border-subtle pt-6">
          <button
            onClick={() => onResolve(selected)}
            className="flex items-center gap-2 px-8 py-2.5 rounded-full bg-xing-green text-[#10120A] text-sm font-semibold hover:bg-xing-green-2 transition-all cursor-pointer whitespace-nowrap active:scale-[0.97]"
          >
            <Check size={14} />
            {tr('确认处理方式，生成报告')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}