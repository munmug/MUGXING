import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, RefreshCw } from 'lucide-react';
import type { QuickFocus } from '@/lib/types';
import { tr } from '@/lib/lang';

interface QuickSetupProps {
  symbol: string;
  name: string;
  researchQuestion?: string;
  onBack: () => void;
  onGenerate: (focus: QuickFocus) => void;
  onChangeSymbol: () => void;
}

const focusOptions: { id: QuickFocus; label: string; desc: string; icon: string }[] = [
  { id: 'risk', label: '风险在哪里', desc: '识别当前核心风险与压力位', icon: 'ri-shield-line' },
  { id: 'drivers', label: '近期驱动因素', desc: '分析股价核心驱动与催化剂', icon: 'ri-flashlight-line' },
  { id: 'tracking', label: '是否值得继续跟踪', desc: '评估持有逻辑与退出条件', icon: 'ri-compass-3-line' },
];

export default function QuickSetup({ symbol, name, researchQuestion, onBack, onGenerate, onChangeSymbol }: QuickSetupProps) {
  const [selected, setSelected] = useState<QuickFocus>('risk');

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[900px]"
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <button onClick={onBack} className="text-xing-text-disabled hover:text-xing-text-2 transition-colors cursor-pointer">
            <ChevronLeft size={18} />
          </button>
          <span className="text-xs text-xing-text-disabled font-mono">Quick Analysis Setup</span>
          {researchQuestion && (
            <span className="text-[10px] text-xing-text-3 font-mono ml-auto max-w-[300px] truncate" title={researchQuestion}>
              {researchQuestion}
            </span>
          )}
        </div>

        <div className="grid grid-cols-[200px_1fr_220px] gap-8">
          {/* Left: Symbol info */}
          <div>
            <div className="text-[11px] text-xing-text-disabled mb-1 font-mono">{tr('研究对象')}</div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-xing-card border border-xing-border">
              <div className="w-10 h-10 rounded-lg bg-xing-green/10 flex items-center justify-center">
                <span className="text-sm font-bold text-xing-green">{symbol.charAt(0)}</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-xing-text">{symbol}</div>
                <div className="text-[11px] text-xing-text-2/60">{name}</div>
              </div>
            </div>
            <button
              onClick={onChangeSymbol}
              className="mt-2 flex items-center gap-1.5 text-[11px] text-xing-text-disabled hover:text-xing-text-2/70 transition-colors cursor-pointer"
            >
              <RefreshCw size={10} />
              {tr('更换标的')}
            </button>
          </div>

          {/* Center: Steps */}
          <div className="flex flex-col gap-4">
            <div className="text-[11px] text-xing-text-disabled mb-2 font-mono">{tr('你最关心什么')}</div>
            {focusOptions.map((opt) => (
              <motion.button
                key={opt.id}
                onClick={() => setSelected(opt.id)}
                whileHover={{ x: 4 }}
                className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                  selected === opt.id
                    ? 'border-xing-border-active bg-xing-card-active'
                    : 'border-xing-border bg-xing-card hover:border-xing-border-hover'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    selected === opt.id ? 'bg-xing-green/15 text-xing-green' : 'bg-xing-card text-xing-text-3'
                  }`}>
                    <i className={`${opt.icon} text-sm`} />
                  </div>
                  <div>
                    <div className={`text-sm font-medium ${selected === opt.id ? 'text-xing-text' : 'text-xing-text-2'}`}>
                      {tr(opt.label)}
                    </div>
                    <div className="text-[11px] text-xing-text-3 mt-0.5">{tr(opt.desc)}</div>
                  </div>
                  {selected === opt.id && (
                    <div className="ml-auto w-5 h-5 rounded-full border-2 border-xing-green flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-xing-green" />
                    </div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>

          {/* Right: Analysis preview */}
          <div className="p-4 rounded-xl bg-xing-card border border-xing-border">
            <div className="text-[11px] text-xing-text-disabled mb-3 font-mono">{tr('分析概览')}</div>
            <div className="flex flex-col gap-2.5 text-[12px]">
              <div className="flex justify-between">
                <span className="text-xing-text-3">{tr('标的')}</span>
                <span className="text-xing-text font-mono">{symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xing-text-3">{tr('时间范围')}</span>
                <span className="text-xing-text font-mono">{tr('30 天')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xing-text-3">{tr('关注方向')}</span>
                <span className="text-xing-text font-mono">{focusOptions.find((f) => f.id === selected)?.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xing-text-3">{tr('输出')}</span>
                <span className="text-xing-text font-mono">{tr('3 分钟结论')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => onGenerate(selected)}
            className="px-8 py-3 rounded-full bg-xing-green text-[#10120A] text-sm font-semibold hover:bg-xing-green-2 transition-all cursor-pointer active:scale-[0.97]"
          >
            {tr('生成快速结论')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}