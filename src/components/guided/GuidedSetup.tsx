import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Play, Save } from 'lucide-react';
import type { AnalysisFramework, DataSourceType, ResearchContext } from '@/lib/types';
import { tr } from '@/lib/lang';

interface GuidedSetupProps {
  context: ResearchContext | null;
  onBack: () => void;
  onSave: (frameworks: AnalysisFramework[], sources: DataSourceType[]) => void;
  onRun: (frameworks: AnalysisFramework[], sources: DataSourceType[]) => void;
}

const frameworkOptions: { id: AnalysisFramework; label: string; desc: string }[] = [
  { id: 'growth-breakdown', label: '增长拆解', desc: '收入结构、增速驱动、增长质量' },
  { id: 'financial-quality', label: '财务质量', desc: '利润率、现金流、ROIC' },
  { id: 'competitive-landscape', label: '竞争格局', desc: '市场份额、竞争壁垒、替代风险' },
  { id: 'risk-audit', label: '风险审查', desc: '宏观风险、行业风险、公司特定风险' },
];

const sourceOptions: { id: DataSourceType; label: string; icon: string }[] = [
  { id: 'official-filing', label: '官方公告', icon: 'ri-file-text-line' },
  { id: 'earnings', label: '财报', icon: 'ri-bar-chart-2-line' },
  { id: 'call-transcript', label: '电话会纪要', icon: 'ri-phone-line' },
  { id: 'sellside-report', label: '卖方研报', icon: 'ri-newspaper-line' },
  { id: 'industry-data', label: '行业数据', icon: 'ri-database-2-line' },
  { id: 'news-sentiment', label: '新闻舆情', icon: 'ri-rss-line' },
];

const frameworkNames: Record<AnalysisFramework, string> = {
  'growth-breakdown': '增长拆解',
  'financial-quality': '财务质量',
  'competitive-landscape': '竞争格局',
  'risk-audit': '风险审查',
};

const sourceNames: Record<DataSourceType, string> = {
  'official-filing': '官方公告',
  'earnings': '财报',
  'call-transcript': '电话会纪要',
  'sellside-report': '卖方研报',
  'industry-data': '行业数据',
  'news-sentiment': '新闻舆情',
};

export default function GuidedSetup({ context, onBack, onSave, onRun }: GuidedSetupProps) {
  const ctx = context;
  const question = ctx?.researchQuestion || '拆解腾讯云增长逻辑';
  const subject = ctx?.subject;
  const goal = ctx?.researchGoal;

  const [frameworks, setFrameworks] = useState<AnalysisFramework[]>(
    ctx?.selectedFrameworks || ['growth-breakdown', 'financial-quality', 'competitive-landscape', 'risk-audit'],
  );
  const [sources, setSources] = useState<DataSourceType[]>(
    ctx?.selectedSources || ['official-filing', 'earnings', 'call-transcript', 'sellside-report', 'industry-data'],
  );

  const toggleFramework = (id: AnalysisFramework) => {
    setFrameworks((prev) => prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]);
  };

  const toggleSource = (id: DataSourceType) => {
    setSources((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-[1060px] mx-auto p-8"
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="text-xing-text-disabled hover:text-xing-text-2 transition-colors cursor-pointer">
            <ChevronLeft size={18} />
          </button>
          <span className="text-xs text-xing-text-disabled font-mono">Guided Research Setup</span>
          {subject?.symbol && (
            <span className="text-[11px] text-xing-text-3 font-mono ml-auto">{subject.symbol}</span>
          )}
        </div>

        <div className="grid grid-cols-[220px_1fr_260px] gap-8">
          {/* Left: Context — now shows real subject info */}
          <div>
            <div className="text-[11px] text-xing-text-disabled mb-3 font-mono">{tr('任务上下文')}</div>

            <div className="p-3 rounded-lg bg-xing-card border border-xing-border mb-3">
              <div className="text-[11px] text-xing-text-3 mb-1">{tr('研究问题')}</div>
              <div className="text-[13px] text-xing-text font-medium">{question}</div>
            </div>

            {subject && (
              <div className="p-3 rounded-lg bg-xing-card border border-xing-border mb-3">
                <div className="text-[11px] text-xing-text-3 mb-1">{tr('研究对象')}</div>
                <div className="text-[13px] text-xing-text font-medium">
                  {tr(subject.name)}
                  {subject.symbol && <span className="text-xing-text-3 text-[11px] ml-1 font-mono">{subject.symbol}</span>}
                </div>
                {subject.aliases && subject.aliases.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {subject.aliases.map((a) => (
                      <span key={a} className="px-1.5 py-0.5 rounded bg-xing-card text-[10px] text-xing-text-3">{a}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {goal && (
              <div className="p-3 rounded-lg bg-xing-card border border-xing-border">
                <div className="text-[11px] text-xing-text-3 mb-1">{tr('研究目标')}</div>
                <div className="text-[12px] text-xing-text-2/80 leading-relaxed">{goal.primary}</div>
              </div>
            )}
          </div>

          {/* Center: Steps */}
          <div className="flex flex-col gap-6">
            {/* Step 1: Frameworks */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-5 h-5 rounded-full bg-xing-green/10 text-xing-green text-[10px] flex items-center justify-center font-mono">1</span>
                <span className="text-[13px] text-xing-text font-medium">{tr('选择分析框架')}</span>
                <span className="text-[10px] text-xing-text-disabled">{tr('可多选')}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {frameworkOptions.map((fw) => (
                  <button
                    key={fw.id}
                    onClick={() => toggleFramework(fw.id)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer text-left ${
                      frameworks.includes(fw.id)
                        ? 'border-xing-border-active bg-xing-card-active'
                        : 'border-xing-border bg-xing-card hover:border-xing-border-hover'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[13px] font-medium ${frameworks.includes(fw.id) ? 'text-xing-text' : 'text-xing-text-2'}`}>
                        {tr(fw.label)}
                      </span>
                      {frameworks.includes(fw.id) && <i className="ri-check-line text-xing-green text-sm" />}
                    </div>
                    <div className="text-[11px] text-xing-text-3 mt-0.5">{tr(fw.desc)}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Data Sources */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-5 h-5 rounded-full bg-xing-green/10 text-xing-green text-[10px] flex items-center justify-center font-mono">2</span>
                <span className="text-[13px] text-xing-text font-medium">{tr('选择数据来源')}</span>
                <span className="text-[10px] text-xing-text-disabled">{tr('可多选')}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {sourceOptions.map((src) => (
                  <button
                    key={src.id}
                    onClick={() => toggleSource(src.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border transition-all cursor-pointer ${
                      sources.includes(src.id)
                        ? 'border-xing-border-active bg-xing-card-active'
                        : 'border-xing-border bg-xing-card hover:border-xing-border-hover'
                    }`}
                  >
                    <i className={`${src.icon} text-sm ${sources.includes(src.id) ? 'text-xing-green' : 'text-xing-text-3'}`} />
                    <span className={`text-[12px] ${sources.includes(src.id) ? 'text-xing-text' : 'text-xing-text-2'} whitespace-nowrap`}>
                      {tr(src.label)}
                    </span>
                    {sources.includes(src.id) && <i className="ri-check-line text-xing-green text-xs ml-auto" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Output */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-5 h-5 rounded-full bg-xing-green/10 text-xing-green text-[10px] flex items-center justify-center font-mono">3</span>
                <span className="text-[13px] text-xing-text font-medium">{tr('输出要求')}</span>
              </div>
              <select className="w-full max-w-[300px] bg-xing-card border border-xing-border rounded-lg p-3 text-[13px] text-xing-text cursor-pointer">
                <option>{tr('Markdown 结构化报告')}</option>
                <option>{tr('要点清单')}</option>
                <option>{tr('完整研究报告')}</option>
              </select>
            </div>
          </div>

          {/* Right: Plan Summary — context-aware */}
          <div className="p-4 rounded-xl bg-xing-card border border-xing-border h-fit">
            <div className="text-[11px] text-xing-text-disabled mb-3 font-mono">{tr('研究计划')}</div>
            <div className="flex flex-col gap-3 text-[12px]">
              <div>
                <div className="text-xing-text-3 mb-1">{tr('研究问题')}</div>
                <div className="text-xing-text leading-relaxed">{question}</div>
              </div>
              <div>
                <div className="text-xing-text-2/50 mb-1">{tr('分析框架')}</div>
                <div className="flex flex-wrap gap-1">
                  {frameworks.map((f) => (
                    <span key={f} className="px-2 py-0.5 rounded-md bg-xing-green/10 text-xing-green text-[11px]">{frameworkNames[f]}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xing-text-2/50 mb-1">{tr('数据来源')}</div>
                <div className="flex flex-wrap gap-1">
                  {sources.map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded-md bg-xing-card text-xing-text-2 text-[11px]">{sourceNames[s]}</span>
                  ))}
                </div>
              </div>
              {goal?.secondary && goal.secondary.length > 0 && (
                <div className="pt-3 border-t border-xing-border-subtle">
                  <div className="text-xing-text-2/50 mb-1">{tr('本次研究将重点检查')}</div>
                  <div className="flex flex-col gap-0.5">
                    {goal.secondary.map((item, i) => (
                      <div key={i} className="text-[11px] text-xing-text-3">{i + 1}. {item}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom actions */}
        <div className="mt-8 flex items-center justify-center gap-4 border-t border-xing-border-subtle pt-6">
          <button
            onClick={() => onSave(frameworks, sources)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-xing-border-hover text-sm text-xing-text-2 hover:text-xing-text hover:border-xing-border-hover transition-all cursor-pointer whitespace-nowrap"
          >
            <Save size={14} />
            {tr('保存研究计划')}
          </button>
          <button
            onClick={() => onRun(frameworks, sources)}
            className="flex items-center gap-2 px-8 py-2.5 rounded-full bg-xing-green text-[#10120A] text-sm font-semibold hover:bg-xing-green-2 transition-all cursor-pointer whitespace-nowrap active:scale-[0.97]"
          >
            <Play size={14} />
            {tr('开始执行分析')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}