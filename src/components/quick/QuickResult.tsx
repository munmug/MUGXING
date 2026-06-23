import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, TrendingUp, AlertTriangle, ArrowRight, Shield, Zap, Activity } from 'lucide-react';
import type { QuickResultData } from '@/lib/types';
import { getStockQuote, isUSEquitySymbol, applyLiveIndicators } from '@/services/quote';
import { tr } from '@/lib/lang';

interface QuickResultProps {
  data: QuickResultData;
  contextLabel?: string;
  onBack: () => void;
  onDeepResearch: () => void;
  onOpenStudio: () => void;
}

const impactColors = {
  positive: { bg: 'bg-xing-green/10', text: 'text-xing-green', icon: TrendingUp },
  negative: { bg: 'bg-xing-red/10', text: 'text-xing-red', icon: AlertTriangle },
  neutral: { bg: 'bg-xing-card', text: 'text-xing-text-2', icon: Activity },
};

const severityColors = {
  high: { bg: 'bg-xing-red/10 border-xing-red/25', dot: 'bg-xing-red' },
  medium: { bg: 'bg-xing-yellow/10 border-xing-yellow/25', dot: 'bg-xing-yellow' },
  low: { bg: 'bg-xing-card border-xing-border', dot: 'bg-xing-text-2/50' },
};

export default function QuickResult({ data, contextLabel, onBack, onDeepResearch, onOpenStudio }: QuickResultProps) {
  // Indicator cards start from the provided data, then the two quote-derived
  // cards (key range + volatility) are replaced with live values for US stocks.
  const [indicatorCards, setIndicatorCards] = useState(data.indicatorCards);

  useEffect(() => {
    setIndicatorCards(data.indicatorCards);
    if (!isUSEquitySymbol(data.symbol)) return;
    const controller = new AbortController();
    let active = true;
    getStockQuote(data.symbol, controller.signal).then((q) => {
      if (active) setIndicatorCards((prev) => applyLiveIndicators(prev, q));
    });
    return () => { active = false; controller.abort(); };
  }, [data.symbol, data.indicatorCards]);

  return (
    <div className="flex-1 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-[1100px] mx-auto p-8"
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="text-xing-text-disabled hover:text-xing-text-2 transition-colors cursor-pointer">
            <ChevronLeft size={18} />
          </button>
          <span className="text-xs text-xing-text-disabled font-mono">Quick Analysis Result</span>
          {contextLabel && (
            <span className="text-[10px] text-xing-text-3 font-mono max-w-[280px] truncate" title={contextLabel}>
              {`"${contextLabel}"`}
            </span>
          )}
          <span className="ml-auto text-[11px] text-xing-text-disabled font-mono">数据截至 {data.dataDate}</span>
        </div>

        <div className="flex gap-8">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-lg bg-xing-green/10 flex items-center justify-center">
                <span className="text-sm font-bold text-xing-green">{data.symbol.charAt(0)}</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-xing-text">{data.symbol} {data.name}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${
                    data.riskScore > 65 ? 'bg-xing-red/10 text-xing-red border border-xing-red/20' :
                    data.riskScore > 35 ? 'bg-xing-yellow/10 text-xing-yellow border border-xing-yellow/20' :
                    'bg-xing-green/10 text-xing-green border border-xing-green/20'
                  }`}>
                    <Shield size={11} /> 风险等级 {data.riskLevel} · {data.riskScore}/100
                  </span>
                </div>
              </div>
            </div>

            {/* Core judgment */}
            <div className="p-4 rounded-xl bg-xing-card border border-xing-border-active/40 mb-6">
              <div className="text-[11px] text-xing-green/70 font-mono mb-2">{tr('核心判断')}</div>
              <p className="text-sm text-xing-text leading-relaxed">{data.coreJudgment}</p>
              <p className="text-[11px] text-xing-text-3 mt-2">{data.analysisBasis}</p>
            </div>

            {/* Driver cards */}
            <div className="mb-6">
              <div className="text-[11px] text-xing-text-disabled font-mono mb-3">{tr('关键驱动因素')}</div>
              <div className="grid grid-cols-3 gap-3">
                {data.driverCards.map((card, i) => {
                  const Icon = impactColors[card.impact].icon;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * i, duration: 0.3 }}
                      className={`p-3 rounded-lg border ${impactColors[card.impact].bg} border-xing-border`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon size={14} className={impactColors[card.impact].text} />
                        <span className="text-[13px] font-medium text-xing-text">{card.title}</span>
                      </div>
                      <p className="text-[12px] text-xing-text-2/70 leading-relaxed">{card.description}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Risk cards */}
            <div className="mb-6">
              <div className="text-[11px] text-xing-text-disabled font-mono mb-3">{tr('需关注风险')}</div>
              <div className="flex flex-col gap-2">
                {data.riskCards.map((risk, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${severityColors[risk.severity].bg}`}>
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${severityColors[risk.severity].dot}`} />
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium text-xing-text">{risk.title}</div>
                      <div className="text-[12px] text-xing-text-2/60 mt-0.5">{risk.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Next steps */}
            <div>
              <div className="text-[11px] text-xing-text-disabled font-mono mb-3">{tr('下一步建议')}</div>
              <div className="flex flex-col gap-1.5">
                {data.nextSteps.map((step, i) => (
                  <div key={i} className="flex items-center gap-2 text-[12px] text-xing-text-2/70">
                    <ArrowRight size={12} className="text-xing-green/50 shrink-0" />
                    {step}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Side indicators */}
          <div className="w-[240px] shrink-0">
            <div className="sticky top-8 flex flex-col gap-3">
              <div className="text-[11px] text-xing-text-disabled font-mono mb-1">{tr('辅助指标')}</div>
              {indicatorCards.map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i, duration: 0.3 }}
                  className="p-3 rounded-lg bg-xing-card border border-xing-border"
                >
                  <div className="text-[11px] text-xing-text-2/50 mb-1">{card.label}</div>
                  <div className="text-base font-semibold text-xing-text font-mono">{card.value}</div>
                  <div className="text-[10px] text-xing-text-3 mt-0.5">{card.subtext}</div>
                </motion.div>
              ))}

              {/* Event timeline */}
              <div className="mt-3 p-3 rounded-lg bg-xing-card border border-xing-border">
                <div className="text-[11px] text-xing-text-3 mb-2">{tr('事件时间线')}</div>
                <div className="flex flex-col gap-2">
                  {['Q1 财报发布', 'Q2 交付数据', '能源业务更新', '股东大会'].map((ev, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-xing-green/40 shrink-0" />
                      <span className="text-[11px] text-xing-text-2/70">{ev}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom actions */}
        <div className="mt-10 flex items-center justify-center gap-4 border-t border-xing-border-subtle pt-6">
          <button
            onClick={onDeepResearch}
            className="px-6 py-2.5 rounded-full border border-xing-green/30 text-sm text-xing-green hover:bg-xing-green/5 transition-all cursor-pointer whitespace-nowrap"
          >
            继续深入研究
          </button>
          <button
            onClick={onOpenStudio}
            className="px-6 py-2.5 rounded-full bg-xing-green text-[#10120A] text-sm font-semibold hover:bg-xing-green-2 transition-all cursor-pointer whitespace-nowrap active:scale-[0.97]"
          >
            加入研究工作台
          </button>
        </div>
      </motion.div>
    </div>
  );
}