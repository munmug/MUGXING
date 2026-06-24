import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Layers, Download, BookmarkPlus, PlusCircle, ChevronRight, TrendingUp, AlertTriangle, Target, Calendar, FileText } from 'lucide-react';
import type { ResearchReport as ResearchReportType, ResearchContext } from '@/lib/types';
import { tr } from '@/lib/lang';

interface ResearchReportProps {
  report: ResearchReportType | null;
  context: ResearchContext | null;
  onBack: () => void;
  onOpenStudio: () => void;
  onExport: () => void;
  onSaveToLibrary: () => void;
  onFollowUp: (question: string) => void;
  highlightedSection: string | null;
  activeNodeId: string | null;
  onSectionHighlight: (id: string | null) => void;
  onClearActiveNode: () => void;
}

export default function ResearchReport({
  report, context, onBack, onOpenStudio, onExport, onSaveToLibrary,
  onFollowUp, highlightedSection, activeNodeId,
  onSectionHighlight, onClearActiveNode,
}: ResearchReportProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [followUpInput, setFollowUpInput] = useState('');
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Scroll to highlighted section
  useEffect(() => {
    if (highlightedSection && sectionRefs.current[highlightedSection]) {
      const el = sectionRefs.current[highlightedSection];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      // Auto-clear after 1.2s
      const t = setTimeout(() => onClearActiveNode(), 1200);
      return () => clearTimeout(t);
    }
  }, [highlightedSection, onClearActiveNode]);

  const handleFollowUpSubmit = useCallback(() => {
    if (!followUpInput.trim()) return;
    onFollowUp(followUpInput.trim());
    setFollowUpInput('');
    setShowFollowUp(false);
  }, [followUpInput, onFollowUp]);

  // Fallback
  if (!report) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background-50">
        <div className="text-center">
          <div className="text-[13px] text-foreground-500 mb-4">{tr('报告尚未生成')}</div>
          <button onClick={onBack} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary-500 text-background-50 text-sm font-semibold hover:bg-primary-600 transition-all cursor-pointer whitespace-nowrap">
            <ChevronLeft size={14} /> 返回
          </button>
        </div>
      </div>
    );
  }

  const hasConflict = context?.conflictResolution != null;
  const isTsla = context?.subject?.symbol === 'TSLA';
  const subjectName = context?.subject?.name || '';

  // Build source → section label mapping
  const sourceLabels: Record<string, string> = {};
  if (context?.traceNodes) {
    for (const node of context.traceNodes) {
      const mainSection = report.sections.find((s) => s.sourceNodeIds.includes(node.id));
      sourceLabels[node.id] = node.label;
    }
  }

  // Collect unique source IDs per section
  const sectionSources: Record<string, string[]> = {};
  for (const section of report.sections) {
    sectionSources[section.id] = (section.sourceNodeIds || [])
      .map((sid) => sourceLabels[sid] || sid)
      .filter(Boolean);
  }

  // Section icons
  const sectionIcons: Record<string, React.ReactNode> = {
    'sec-tsla-drivers': <TrendingUp size={15} className="text-accent-500" />,
    'sec-tsla-risks': <AlertTriangle size={15} className="text-amber-500" />,
    'sec-margin-pressure': <TrendingUp size={15} className="text-amber-500" />,
    'sec-margin-outlook': <Target size={15} className="text-accent-500" />,
    'sec-delivery-drivers': <Calendar size={15} className="text-accent-500" />,
    'sec-delivery-scenarios': <Target size={15} className="text-amber-500" />,
  };

  const getSectionIcon = (id: string) => sectionIcons[id] || <FileText size={15} className="text-foreground-400" />;

  const isSectionHighlighted = (sectionId: string) =>
    highlightedSection === sectionId || highlightedSection === `core-${sectionId}`;

  return (
    <div className="flex-1 overflow-y-auto bg-background-50">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* ── Top status bar ── */}
        <div className="sticky top-0 z-10 px-6 py-2 bg-background-50/95 backdrop-blur-sm border-b border-background-200/70 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-foreground-500 hover:text-foreground-950 transition-colors cursor-pointer">
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-3 text-[10px] text-foreground-500 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-500" />
                Cold Path Report
              </span>
              <span className="text-foreground-300">|</span>
              <span>Type-Safe Verified</span>
              {report.symbolBadge && (
                <>
                  <span className="text-foreground-300">|</span>
                  <span className="text-foreground-600">{report.symbolBadge}</span>
                </>
              )}
            </div>
          </div>
          <div
            className="relative group"
            title={tr('将当前报告转为可编辑研究流，继续调整数据源、框架和分析逻辑')}
          >
            <button
              onClick={onOpenStudio}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-accent-500/25 text-accent-600 hover:text-accent-700 hover:bg-accent-500/5 text-[12px] transition-all cursor-pointer whitespace-nowrap"
            >
              <Layers size={13} />
              {tr('进入 Research Studio')}
            </button>
            <div className="absolute right-0 top-full mt-1.5 w-64 p-3 rounded-lg bg-foreground-950 text-background-50 text-[11px] leading-relaxed opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-20">
              {tr('将当前报告转为可编辑研究流，继续调整数据源、框架和分析逻辑。')}
            </div>
          </div>
        </div>

        <div className="max-w-[880px] mx-auto px-8 py-8">
          {/* ── Report Summary Card ── */}
          <div className="mb-10 p-6 rounded-xl bg-background-100 border border-background-200/70">
            {/* Tags */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {report.tags.map((tag, i) => (
                <span key={i} className="px-2 py-0.5 rounded-md bg-accent-500/10 text-accent-600 text-[11px] font-medium">
                  {tag}
                </span>
              ))}
              <span className="px-2 py-0.5 rounded-md bg-background-200/70 text-foreground-500 text-[11px]">{report.status}</span>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-semibold text-foreground-950 mb-1.5">{tr(report.title)}</h2>
            <p className="text-[13px] text-foreground-500 mb-5">{tr(report.subtitle)}</p>

            {/* Summary stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="p-3 rounded-lg bg-background-50 border border-background-200/50">
                <div className="text-[10px] text-foreground-400 font-mono mb-1">{tr('研究问题')}</div>
                <div className="text-[12px] text-foreground-800 font-medium leading-snug">
                  {context?.originalPrompt || '—'}
                </div>
              </div>
              {isTsla && (
                <>
                  <div className="p-3 rounded-lg bg-background-50 border border-background-200/50">
                    <div className="text-[10px] text-foreground-400 font-mono mb-1">{tr('风险等级')}</div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span className="text-[15px] font-semibold text-foreground-900">{tr('中')}</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-background-50 border border-background-200/50">
                    <div className="text-[10px] text-foreground-400 font-mono mb-1">{tr('置信度')}</div>
                    <div className="text-[15px] font-semibold text-foreground-900">72%</div>
                  </div>
                  <div className="p-3 rounded-lg bg-background-50 border border-background-200/50">
                    <div className="text-[10px] text-foreground-400 font-mono mb-1">{tr('研究范围')}</div>
                    <div className="text-[12px] text-foreground-800 font-medium">{tr('未来 30 天')}</div>
                  </div>
                </>
              )}
              {!isTsla && (
                <div className="col-span-3 p-3 rounded-lg bg-background-50 border border-background-200/50">
                  <div className="text-[10px] text-foreground-400 font-mono mb-1">{tr('研究目标')}</div>
                  <div className="text-[12px] text-foreground-800 font-medium leading-snug">
                    {context?.researchGoal?.primary || context?.researchQuestion || '—'}
                  </div>
                </div>
              )}
            </div>

            {/* Resolution card — only when conflict was resolved */}
            {hasConflict && report.resolutionCard && (
              <div className="mt-4 p-4 rounded-lg bg-accent-500/5 border border-accent-500/15">
                <div className="text-[11px] text-accent-600 font-mono mb-1.5">{tr('处理方式')}</div>
                <div className="text-[13px] font-medium text-foreground-900 mb-1">{tr(report.resolutionCard.label)}</div>
                <div className="text-[12px] text-foreground-600 leading-relaxed">{tr(report.resolutionCard.description)}</div>
              </div>
            )}
          </div>

          {/* ── Core Conclusion ── */}
          <motion.div
            ref={(el) => { sectionRefs.current['core-conclusion'] = el; }}
            animate={{
              backgroundColor: highlightedSection === 'core-conclusion'
                ? 'oklch(var(--accent-500) / 0.06)'
                : 'transparent',
            }}
            className="p-5 rounded-xl border transition-all duration-500 mb-[48px] border-transparent"
            onMouseEnter={() => onSectionHighlight('core-conclusion')}
            onMouseLeave={() => onSectionHighlight(null)}
          >
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-[16px] font-semibold text-foreground-950">{tr('核心结论')}</h3>
              <div className="flex items-center gap-1 text-[10px] text-foreground-400">
                <span className="w-1 h-1 rounded-full bg-accent-500/40" />
                <span className="font-mono">{tr('多源交叉验证')}</span>
              </div>
            </div>
            <p className="text-[14px] text-foreground-700 leading-[1.75]">{report.coreConclusion}</p>
          </motion.div>

          {/* ── Report Sections ── */}
          <div className="flex flex-col" style={{ gap: '48px' }}>
            {report.sections.map((section) => {
              const isHighlighted = isSectionHighlighted(section.id);
              const isExpanded = expandedSection === section.id;
              const sources = sectionSources[section.id] || [];

              return (
                <motion.div
                  key={section.id}
                  ref={(el) => { sectionRefs.current[section.id] = el; }}
                  animate={{
                    backgroundColor: isHighlighted
                      ? 'oklch(var(--accent-500) / 0.06)'
                      : 'transparent',
                    borderColor: isHighlighted
                      ? 'oklch(var(--accent-500) / 0.25)'
                      : 'transparent',
                  }}
                  className={`p-5 rounded-xl border transition-all duration-500 ${
                    isHighlighted ? 'border-accent-500/25' : 'border-transparent'
                  }`}
                  onMouseEnter={() => onSectionHighlight(section.id)}
                  onMouseLeave={() => onSectionHighlight(null)}
                >
                  {/* Section header */}
                  <div className="flex items-center gap-2.5 mb-3">
                    {getSectionIcon(section.id)}
                    <h3 className="text-[16px] font-semibold text-foreground-950">{tr(section.title)}</h3>
                    {sources.length > 0 && (
                      <button
                        onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                        className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-md bg-accent-500/8 text-[11px] text-accent-600 hover:bg-accent-500/15 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        {sources.length} 个来源节点
                        <ChevronRight size={10} className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </button>
                    )}
                  </div>

                  {/* Source labels when highlighted */}
                  <AnimatePresence>
                    {isHighlighted && sources.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-3 overflow-hidden"
                      >
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] text-foreground-400 font-mono">{tr('由')}</span>
                          {sources.map((src, si) => (
                            <span key={si} className="px-1.5 py-0.5 rounded bg-accent-500/10 text-accent-600 text-[10px] font-mono">
                              {src}
                            </span>
                          ))}
                          <span className="text-[10px] text-foreground-400 font-mono">{tr('支撑')}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Content */}
                  <p className="text-[14px] text-foreground-700 leading-[1.75]">{tr(section.content)}</p>

                  {/* Source nodes at bottom */}
                  {sources.length > 0 && !isHighlighted && (
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        {section.sourceNodeIds.map((sid) => (
                          <span
                            key={sid}
                            className={`w-1.5 h-1.5 rounded-full transition-colors ${
                              activeNodeId === sid ? 'bg-accent-500' : 'bg-accent-500/40'
                            }`}
                            title={`来源: ${sourceLabels[sid] || sid}`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-foreground-400 font-mono">
                        {sources.length} 个来源节点关联
                      </span>
                    </div>
                  )}

                  {/* Expanded source detail */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-background-200/60 overflow-hidden"
                      >
                        <div className="text-[11px] text-foreground-400 font-mono mb-2">{tr('关联来源详情')}</div>
                        <div className="flex flex-col gap-2">
                          {section.sourceNodeIds.map((sid) => {
                            const node = context?.traceNodes?.find((n) => n.id === sid);
                            if (!node) return null;
                            return (
                              <div key={sid} className="p-3 rounded-lg bg-background-50 border border-background-200/50">
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="text-[12px] font-medium text-foreground-800">{tr(node.label)}</span>
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono ${
                                    node.pathType === 'cold-path' ? 'bg-accent-500/10 text-accent-600' :
                                    node.pathType === 'type-safe' ? 'bg-accent-500/15 text-accent-600' :
                                    'bg-amber-500/10 text-amber-600'
                                  }`}>{node.pathType}</span>
                                </div>
                                <div className="text-[10px] text-foreground-500 mb-2">{node.sourceType} · {node.publisher} · {node.date}</div>
                                <div className="flex flex-col gap-0.5">
                                  {node.extractedSignals.map((sig, si) => (
                                    <div key={si} className="text-[11px] text-foreground-600 leading-relaxed">
                                      {si + 1}. {sig}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* ── Next Verification Steps ── */}
          {report.nextVerificationSteps.length > 0 && (
            <motion.div
              ref={(el) => { sectionRefs.current['verification-steps'] = el; }}
              className="p-5 rounded-xl border border-transparent mt-[48px] bg-background-100"
            >
              <h3 className="text-[16px] font-semibold text-foreground-950 mb-4">{tr('下一步验证指标')}</h3>
              <div className="grid grid-cols-2 gap-2">
                {report.nextVerificationSteps.map((step, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-background-50 border border-background-200/50">
                    <span className="text-[10px] text-accent-600 font-mono mt-0.5 shrink-0 w-4">{String(i + 1).padStart(2, '0')}</span>
                    <span className="text-[12px] text-foreground-600 leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Final Conclusion ── */}
          {report.finalConclusion && (
            <motion.div
              ref={(el) => { sectionRefs.current['final-conclusion'] = el; }}
              className="p-5 rounded-xl border mt-[48px] border-accent-500/15 bg-background-100"
            >
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-[16px] font-semibold text-accent-600">{tr('研究结论')}</h3>
                <span className="text-[10px] text-accent-500/60 font-mono">type-safe</span>
              </div>
              <p className="text-[14px] text-foreground-800 leading-[1.75]">{report.finalConclusion}</p>
            </motion.div>
          )}

          {/* ── Next Step Action Area ── */}
          <div className="mt-[56px] border-t border-background-200/60 pt-10">
            <h3 className="text-[15px] font-semibold text-foreground-900 mb-5">{tr('下一步可以继续做什么？')}</h3>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {/* 1: Enter Studio */}
              <button
                onClick={onOpenStudio}
                className="flex flex-col p-4 rounded-xl bg-background-100 border border-background-200/70 hover:border-accent-500/30 hover:bg-accent-500/[0.03] transition-all cursor-pointer text-left group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-accent-500/10 flex items-center justify-center">
                    <Layers size={15} className="text-accent-600" />
                  </div>
                  <span className="text-[13px] font-semibold text-foreground-900">{tr('进入 Research Studio')}</span>
                </div>
                <p className="text-[12px] text-foreground-500 leading-relaxed mb-3">
                  将当前{context?.subject?.symbol || subjectName}报告转为可编辑研究流，继续调整数据源、研究框架和风险指标。
                </p>
                <span className="text-[11px] text-accent-600 font-mono flex items-center gap-1 group-hover:gap-2 transition-all">
                  打开研究流 <ChevronRight size={10} />
                </span>
              </button>

              {/* 2: Follow-up Question */}
              <button
                onClick={() => setShowFollowUp(!showFollowUp)}
                className="flex flex-col p-4 rounded-xl bg-background-100 border border-background-200/70 hover:border-accent-500/30 hover:bg-accent-500/[0.03] transition-all cursor-pointer text-left group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-accent-500/10 flex items-center justify-center">
                    <PlusCircle size={15} className="text-accent-600" />
                  </div>
                  <span className="text-[13px] font-semibold text-foreground-900">{tr('追加研究问题')}</span>
                </div>
                <p className="text-[12px] text-foreground-500 leading-relaxed mb-3">
                  在当前报告基础上继续追问，例如"重点分析毛利率风险"或"加入交付数据重新判断"。
                </p>
                <span className="text-[11px] text-accent-600 font-mono flex items-center gap-1 group-hover:gap-2 transition-all">
                  展开输入 <ChevronRight size={10} />
                </span>
              </button>
            </div>

            {/* Follow-up input area */}
            <AnimatePresence>
              {showFollowUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-8 overflow-hidden"
                >
                  <div className="p-5 rounded-xl bg-background-100 border border-accent-500/15">
                    <div className="text-[12px] font-medium text-foreground-800 mb-3">
                      {tr('继续研究当前主题')}
                    </div>
                    <div className="flex items-start gap-3">
                      <input
                        type="text"
                        value={followUpInput}
                        onChange={(e) => setFollowUpInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleFollowUpSubmit(); }}
                        placeholder={tr('例如：重点分析毛利率风险 / 加入交付数据重新判断 / 对比 NVDA 风险')}
                        className="flex-1 bg-background-50 border border-background-200/70 rounded-lg px-4 py-2.5 text-[13px] text-foreground-900 placeholder:text-foreground-400 outline-none focus:border-accent-500/50 transition-colors"
                        autoFocus
                      />
                      <button
                        onClick={handleFollowUpSubmit}
                        disabled={!followUpInput.trim()}
                        className="px-5 py-2.5 rounded-lg bg-accent-500 text-background-50 text-[13px] font-medium hover:bg-accent-600 transition-all cursor-pointer whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {tr('开始补充分析')}
                      </button>
                      <button
                        onClick={() => { setShowFollowUp(false); setFollowUpInput(''); }}
                        className="px-4 py-2.5 rounded-lg border border-background-200/70 text-[13px] text-foreground-500 hover:text-foreground-800 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        {tr('取消')}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 3 & 4: Export & Save */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={onExport}
                className="flex items-center gap-3 p-4 rounded-xl bg-background-100 border border-background-200/70 hover:border-accent-500/20 transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-background-200/70 flex items-center justify-center">
                  <Download size={15} className="text-foreground-600" />
                </div>
                <div className="text-left">
                  <div className="text-[13px] font-semibold text-foreground-900">{tr('导出报告')}</div>
                  <div className="text-[11px] text-foreground-500">{tr('导出为 Markdown / PDF 结构化文档')}</div>
                </div>
              </button>
              <button
                onClick={onSaveToLibrary}
                className="flex items-center gap-3 p-4 rounded-xl bg-background-100 border border-background-200/70 hover:border-accent-500/20 transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-background-200/70 flex items-center justify-center">
                  <BookmarkPlus size={15} className="text-foreground-600" />
                </div>
                <div className="text-left">
                  <div className="text-[13px] font-semibold text-foreground-900">{tr('保存到资料库')}</div>
                  <div className="text-[11px] text-foreground-500">{tr('将报告、来源节点和研究上下文保存')}</div>
                </div>
              </button>
            </div>
          </div>

          <div className="h-10" />
        </div>
      </motion.div>
    </div>
  );
}