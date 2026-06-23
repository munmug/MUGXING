import { motion } from 'framer-motion';
import { ChevronLeft, TrendingUp, AlertTriangle, CheckCircle, Activity, FileText, Layers } from 'lucide-react';
import type { StudioRunResult } from '@/lib/types';
import { tr } from '@/lib/lang';

interface StudioRunResultViewProps {
  data: StudioRunResult;
  contextLabel?: string;
  onBack: () => void;
  onViewReport: () => void;
  onContinueEdit: () => void;
  onNewTask: () => void;
}

export default function StudioRunResultView({ data, contextLabel, onBack, onViewReport, onContinueEdit, onNewTask }: StudioRunResultViewProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-[900px] mx-auto p-8"
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="text-xing-text-disabled hover:text-xing-text-2 transition-colors cursor-pointer">
            <ChevronLeft size={18} />
          </button>
          <span className="text-xs text-xing-text-disabled font-mono">Analysis Results</span>
          {contextLabel && (
            <span className="text-[10px] text-xing-text-3 font-mono max-w-[300px] truncate" title={contextLabel}>
              {`"${contextLabel}"`}
            </span>
          )}
          <div className="ml-auto flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-xing-green" />
            <span className="text-[10px] text-xing-green/70 font-mono">{tr('运行完成')}</span>
          </div>
        </div>

        {/* Conclusion */}
        <div className="p-5 rounded-xl bg-xing-card border border-xing-green/20 mb-8">
          <div className="text-[11px] text-xing-green/70 font-mono mb-3">{tr('结论摘要')}</div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-xing-green/10 border-2 border-xing-green/30 flex items-center justify-center">
              <span className="text-lg font-bold text-xing-green">{data.confidence}%</span>
            </div>
            <div>
              <div className="text-lg font-semibold text-xing-text">{data.conclusionSummary}</div>
              <div className="text-[12px] text-xing-text-3 mt-1">综合分析置信度 {data.confidence}%，基于多源数据交叉验证</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Key Variables */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Activity size={14} className="text-xing-green/70" />
              <span className="text-[13px] font-medium text-xing-text">{tr('关键变量')}</span>
            </div>
            <div className="flex flex-col gap-2">
              {data.keyVariables.map((v, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-xing-card border border-xing-border">
                  <span className="text-[12px] text-xing-text-2">{v.name}</span>
                  <span className={`text-[13px] font-mono font-semibold ${v.value > 0 ? 'text-xing-green' : 'text-xing-red'}`}>
                    {v.value > 0 ? '+' : ''}{v.value.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Risks */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={14} className="text-xing-yellow/70" />
              <span className="text-[13px] font-medium text-xing-text">{tr('风险提示')}</span>
            </div>
            <div className="flex flex-col gap-2">
              {data.risks.map((r, i) => (
                <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-xing-card border border-xing-yellow/15">
                  <div className="w-1.5 h-1.5 rounded-full bg-xing-yellow/60 mt-1.5 shrink-0" />
                  <span className="text-[12px] text-xing-text-2/80 leading-relaxed">{r}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle size={14} className="text-xing-green/70" />
            <span className="text-[13px] font-medium text-xing-text">{tr('建议动作')}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {data.recommendations.map((r, i) => (
              <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-xing-card border border-xing-border">
                <div className="w-5 h-5 rounded-full bg-xing-green/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] text-xing-green font-mono">{i + 1}</span>
                </div>
                <span className="text-[12px] text-xing-text-2/80">{r}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Execution Log */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={14} className="text-xing-text-2/50" />
            <span className="text-[13px] font-medium text-xing-text">{tr('执行日志')}</span>
          </div>
          <div className="flex flex-col gap-1 p-3 rounded-lg bg-xing-card border border-xing-border">
            {data.executionLog.map((log, i) => (
              <div key={i} className="flex items-center gap-3 text-[11px]">
                <span className="text-xing-text-2/20 font-mono w-4">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-xing-text-2/60">{log}</span>
                <span className="ml-auto text-xing-green/50 font-mono text-[10px]">✓</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom actions */}
        <div className="flex items-center justify-center gap-4 border-t border-xing-border-subtle pt-6">
          <button
            onClick={onViewReport}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-xing-border-hover text-sm text-xing-text-2 hover:text-xing-text hover:border-xing-border-hover transition-all cursor-pointer whitespace-nowrap"
          >
            <FileText size={14} />
            查看完整报告
          </button>
          <button
            onClick={onContinueEdit}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-xing-green/30 text-sm text-xing-green hover:bg-xing-green/5 transition-all cursor-pointer whitespace-nowrap"
          >
            <Layers size={14} />
            继续编辑研究流
          </button>
          <button
            onClick={onNewTask}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-xing-green text-[#10120A] text-sm font-semibold hover:bg-xing-green-2 transition-all cursor-pointer whitespace-nowrap active:scale-[0.97]"
          >
            新建研究任务
          </button>
        </div>
      </motion.div>
    </div>
  );
}