import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// Home components
import StarAxisHome from '@/components/home/StarAxisHome';
import LanguageToggle from '@/components/common/LanguageToggle';
import MarketPulse from '@/components/home/MarketPulse';

// Quick Analysis
import QuickSetup from '@/components/quick/QuickSetup';
import QuickResult from '@/components/quick/QuickResult';

// Guided Research
import GuidedSetup from '@/components/guided/GuidedSetup';
import ResearchRunning from '@/components/guided/ResearchRunning';
import ConflictReview from '@/components/guided/ConflictReview';
import ResearchReport from '@/components/guided/ResearchReport';
import TraceCanvas from '@/components/guided/TraceCanvas';

// Studio
import StudioCanvas from '@/components/studio/StudioCanvas';
import StudioRunResultView from '@/components/studio/StudioRunResult';

// Pages
import Library from '@/components/pages/Library';
import DataSourceSettings from '@/components/pages/DataSourceSettings';
import IntentRouting from '@/components/pages/IntentRouting';
import UnknownIntent from '@/components/pages/UnknownIntent';
import ErrorPage from '@/components/pages/ErrorPage';

// Common
import Toast from '@/components/common/Toast';

// Lib
import { intentRouter, intentRouterEnhanced } from '@/lib/intentRouter';
import { routeIntent } from '@/services/llm';
import { generateLiveReport } from '@/services/research';
import {
  createResearchContext, generateReport, generateTraceNodes,
  generateConflictForContext, getConflictResolutionOptions,
  getContextDataSources, getContextResearchSkeleton,
} from '@/lib/researchContext';
import { tslaQuickResult } from '@/data/mockReports';
import { defaultStudioNodes, defaultStudioConnections, defaultCopilotMessages, studioRunResult, tslaStudioNodes, tslaStudioConnections, tslaCopilotMessages, semiStudioNodes, semiStudioConnections, semiCopilotMessages } from '@/data/mockStudio';
import { libraryItems as initialLibraryItems } from '@/data/mockSources';
import { listLibraryItems, saveLibraryItem, deleteLibraryItem } from '@/services/library';
import type {
  AppView, IntentType, QuickFocus, AnalysisFramework,
  DataSourceType, ConflictResolution, ResearchNode, ResearchConnection,
  ResearchContext, ResearchReport as ResearchReportType, TraceNodeWithSections,
} from '@/lib/types';

export default function AppShell() {
  // ─── Core State ──────────────────────────────────────────
  const [view, setView] = useState<AppView>('home');
  const [userInput, setUserInput] = useState('');
  const [inputFocused, setInputFocused] = useState(false);

  // Research Context — the backbone
  const [researchContext, setResearchContext] = useState<ResearchContext | null>(null);

  // Intent routing display state
  const [detectedIntentLabel, setDetectedIntentLabel] = useState('Quick Analysis');
  const [recommendationLabel, setRecommendationLabel] = useState('快速分析');
  const [lastIntent, setLastIntent] = useState<IntentType>('unknown');

  // Quick analysis state
  const [selectedFocus, setSelectedFocus] = useState<QuickFocus>('risk');

  // Report highlight state
  const [reportHighlightedSection, setReportHighlightedSection] = useState<string | null>(null);
  const [activeTraceNode, setActiveTraceNode] = useState<string | null>(null);

  // Studio state
  const [studioNodes, setStudioNodes] = useState<ResearchNode[]>(defaultStudioNodes);
  const [studioConnections, setStudioConnections] = useState<ResearchConnection[]>(defaultStudioConnections);
  const [studioCopilot, setStudioCopilot] = useState(defaultCopilotMessages);
  const [studioStrategyName, setStudioStrategyName] = useState('Tencent Cloud Growth Study');

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  }, []);

  // Library state — mutable so save-to-library works
  const [libraryItems, setLibraryItems] = useState(initialLibraryItems);

  // Load persisted items from Supabase on mount (falls back to fixture)
  useEffect(() => {
    let active = true;
    listLibraryItems().then((items) => {
      if (active) setLibraryItems(items);
    });
    return () => { active = false; };
  }, []);

  // ─── Navigation ──────────────────────────────────────────
  const goHome = useCallback(() => {
    setView('home');
    setInputFocused(false);
    setResearchContext(null);
  }, []);

  // Create context and route
  const createAndRoute = useCallback(async (input: string, forcedIntent?: IntentType) => {
    const labels: Record<IntentType, { detected: string; recommendation: string }> = {
      quick: { detected: 'Quick Analysis', recommendation: '快速分析' },
      guided: { detected: 'Guided Research', recommendation: '引导研究' },
      studio: { detected: 'Research Studio', recommendation: 'Research Studio' },
      unknown: { detected: 'Unknown Intent', recommendation: '引导研究' },
    };

    setUserInput(input);

    // Instant provisional label from the keyword router (no LLM latency),
    // then show the analyzing screen while the LLM resolves intent.
    const provisional = forcedIntent || intentRouterEnhanced(input).intentType;
    setDetectedIntentLabel(labels[provisional].detected);
    setRecommendationLabel(labels[provisional].recommendation);
    setView('intent-routing');

    // Resolve intent via LLM (falls back to keyword router internally).
    const startedAt = Date.now();
    const llmIntent = await routeIntent(input);
    const ctx = createResearchContext(input, undefined, llmIntent);
    if (forcedIntent) {
      ctx.intentType = forcedIntent;
    }
    setResearchContext(ctx);

    const resolvedIntent = forcedIntent || ctx.intentType;
    setLastIntent(resolvedIntent);
    setDetectedIntentLabel(labels[resolvedIntent].detected);
    setRecommendationLabel(labels[resolvedIntent].recommendation);

    // Keep the analyzing animation visible for a minimum beat.
    const wait = Math.max(0, 1200 - (Date.now() - startedAt));

    if (resolvedIntent === 'unknown') {
      setTimeout(() => setView('unknown-intent'), wait);
    } else {
      setTimeout(() => {
        // Route based on intent
        switch (resolvedIntent) {
          case 'quick': {
            // Update context subject for quick flow if not already set
            if (!ctx.subject.symbol) {
              ctx.subject = { type: 'stock', symbol: 'TSLA', name: 'Tesla', market: 'US' };
            }
            setView('quick-setup');
            break;
          }
          case 'guided': {
            setReportHighlightedSection(null);
            setActiveTraceNode(null);
            setView('guided-setup');
            break;
          }
          case 'studio': {
            const question = ctx.researchQuestion;
            const stratName = ctx.subject.name.includes('半导体')
              ? 'Semiconductor Research Flow'
              : ctx.subject.name.includes('腾讯')
                ? 'Tencent Cloud Growth Study'
                : `${ctx.subject.name} Research Study`;
            setStudioNodes(defaultStudioNodes.map((n) =>
              n.id === 'research-target'
                ? { ...n, fields: n.fields.map((f) => f.key === '研究问题' ? { ...f, value: question } : f) }
                : n
            ));
            setStudioConnections(defaultStudioConnections);
            setStudioCopilot([{
              role: 'assistant' as const,
              text: `已根据"${question}"自动生成研究流。你可以点击节点编辑参数，或运行分析。`,
            }]);
            setStudioStrategyName(stratName);
            setView('studio');
            break;
          }
        }
      }, wait);
    }
  }, []);

  // Input submit from home
  const handleSubmit = useCallback(() => {
    if (!userInput.trim()) return;
    createAndRoute(userInput.trim());
  }, [userInput, createAndRoute]);

  // Example prompt click
  const handleExampleSubmit = useCallback((text: string) => {
    createAndRoute(text);
  }, [createAndRoute]);

  // Direct intent from mode buttons
  const handleDirectIntent = useCallback((intent: IntentType) => {
    const fallbacks: Record<IntentType, string> = {
      quick: 'TSLA 风险在哪里',
      guided: '拆解腾讯云增长逻辑',
      studio: '搭建半导体研究流',
      unknown: '',
    };
    const input = userInput.trim() || fallbacks[intent];
    createAndRoute(input, intent);
  }, [userInput, createAndRoute]);

  // Studio direct entry
  const handleStudioDirectClick = useCallback(() => {
    const ctx = createResearchContext('搭建半导体研究流');
    ctx.intentType = 'studio';
    setResearchContext(ctx);
    setStudioNodes(defaultStudioNodes.map((n) =>
      n.id === 'research-target'
        ? { ...n, fields: n.fields.map((f) => f.key === '研究问题' ? { ...f, value: '搭建半导体研究流' } : f) }
        : n
    ));
    setStudioConnections(defaultStudioConnections);
    setStudioCopilot([{ role: 'assistant' as const, text: '已自动生成默认半导体研究流。你可以点击节点编辑参数，或运行分析。' }]);
    setStudioStrategyName('Semiconductor Research Flow');
    setView('studio');
  }, []);

  // ─── Quick Analysis ──────────────────────────────────────
  const handleQuickGenerate = useCallback((focus: QuickFocus) => {
    setSelectedFocus(focus);
    setView('quick-result');
  }, []);

  const handleQuickDeepResearch = useCallback(() => {
    if (!researchContext) return;
    // Transition to guided research with same context
    const ctx = createResearchContext(researchContext.originalPrompt);
    ctx.intentType = 'guided';
    setResearchContext(ctx);
    setView('guided-setup');
  }, [researchContext]);

  const handleQuickOpenStudio = useCallback(() => {
    if (!researchContext) {
      // Fallback
      setStudioStrategyName('TSLA Risk Study');
      setView('studio');
      return;
    }
    const ctx = researchContext;
    const question = ctx.originalPrompt;
    setStudioNodes(defaultStudioNodes.map((n) =>
      n.id === 'research-target'
        ? { ...n, fields: n.fields.map((f) => f.key === '研究问题' ? { ...f, value: question } : f) }
        : n
    ));
    setStudioCopilot([{
      role: 'assistant',
      text: `已根据快速分析结果自动生成 ${ctx.subject.symbol || ctx.subject.name} 研究流。`,
    }]);
    setStudioStrategyName(`${ctx.subject.symbol || ctx.subject.name} Study`);
    setView('studio');
  }, [researchContext]);

  // ─── Guided Research ─────────────────────────────────────
  const handleGuidedSave = useCallback((_frameworks: AnalysisFramework[], _sources: DataSourceType[]) => {
    showToast('研究计划已保存');
  }, [showToast]);

  const handleGuidedRun = useCallback((frameworks: AnalysisFramework[], sources: DataSourceType[]) => {
    setResearchContext((prev) => prev ? { ...prev, selectedFrameworks: frameworks, selectedSources: sources } : prev);
    setView('research-running');
  }, []);

  const handleResearchComplete = useCallback(async (hasConflict: boolean) => {
    const ctx = researchContext;
    if (!ctx) return;

    if (hasConflict) {
      const conflict = generateConflictForContext(ctx);
      if (conflict) {
        const updated = { ...ctx, conflicts: [conflict] };
        setResearchContext(updated);
        setView('conflict-review');
        return;
      }
    }

    // Try a real report from SEC EDGAR + LLM (US symbols). Falls back
    // to the existing hardcoded generation on any failure.
    let report = null as ReturnType<typeof generateReport> | null;
    let traceNodesGenerated = null as ReturnType<typeof generateTraceNodes> | null;
    try {
      const live = await generateLiveReport(ctx);
      if (live) {
        report = live.report;
        traceNodesGenerated = live.traceNodes;
      }
    } catch {
      // fall through to hardcoded
    }
    if (!report || !traceNodesGenerated) {
      report = generateReport(ctx);
      traceNodesGenerated = generateTraceNodes(ctx);
    }

    const updated = { ...ctx, generatedReport: report, traceNodes: traceNodesGenerated };
    setResearchContext(updated);
    setView('research-report');
  }, [researchContext]);

  const handleConflictResolve = useCallback((resolution: ConflictResolution) => {
    const ctx = researchContext;
    if (!ctx) return;

    const options = getConflictResolutionOptions();
    const selected = options.find((o) => o.id === resolution);
    const resolutionRecord = {
      selectedOption: resolution,
      selectedLabel: selected?.label || resolution,
      reason: selected?.desc || '',
      timestamp: new Date().toISOString(),
    };

    const updatedCtx = { ...ctx, conflictResolution: resolutionRecord };
    const report = generateReport(updatedCtx);
    const traceNodesGenerated = generateTraceNodes(updatedCtx);
    updatedCtx.generatedReport = report;
    updatedCtx.traceNodes = traceNodesGenerated;

    setResearchContext(updatedCtx);
    setReportHighlightedSection(null);
    setActiveTraceNode(null);
    setView('research-report');
  }, [researchContext]);

  const handleTraceNodeClick = useCallback((nodeId: string) => {
    const ctx = researchContext;
    if (!ctx || !ctx.traceNodes) return;
    const node = ctx.traceNodes.find((n) => n.id === nodeId);
    if (node && node.relatedSections.length > 0) {
      setActiveTraceNode(nodeId);
      setReportHighlightedSection(node.relatedSections[0]);
      // Auto-clear handled by ResearchReport via onClearActiveNode
    }
  }, [researchContext]);

  const handleClearActiveNode = useCallback(() => {
    setActiveTraceNode(null);
    setReportHighlightedSection(null);
  }, []);

  const handleTraceNodeHover = useCallback((nodeId: string | null) => {
    setActiveTraceNode(nodeId);
    if (nodeId && researchContext?.traceNodes) {
      const node = researchContext.traceNodes.find((n) => n.id === nodeId);
      if (node && node.relatedSections.length > 0) {
        setReportHighlightedSection(node.relatedSections[0]);
      }
    } else {
      setReportHighlightedSection(null);
    }
  }, [researchContext]);

  const handleExportReport = useCallback(() => {
    showToast('报告已导出 Demo');
  }, [showToast]);

  const handleSaveToLibrary = useCallback(() => {
    if (!researchContext) return;
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newItem = {
      id: `lib-${Date.now()}`,
      title: researchContext.generatedReport?.title || researchContext.researchQuestion,
      symbol: researchContext.subject.symbol || researchContext.subject.name,
      type: researchContext.intentType === 'quick' ? '快速分析' : researchContext.intentType === 'guided' ? '引导研究' : '研究流',
      createdAt: dateStr,
      updatedAt: dateStr,
      status: 'completed' as const,
    };
    setLibraryItems((prev) => [newItem, ...prev]);
    showToast('报告已保存到资料库');
    // Persist to Supabase (no-op if not configured); reconcile on success.
    saveLibraryItem(newItem).then((saved) => {
      if (saved) {
        setLibraryItems((prev) => prev.map((it) => (it.id === saved.id ? saved : it)));
      }
    });
  }, [researchContext, showToast]);

  const handleFollowUp = useCallback((question: string) => {
    if (!researchContext) return;
    const originalPrompt = researchContext.originalPrompt;
    const ctx = createResearchContext(originalPrompt, question);
    ctx.subject = researchContext.subject;
    setResearchContext(ctx);
    setView('research-running');
  }, [researchContext]);

  const handleOpenStudioFromReport = useCallback(() => {
    if (!researchContext) return;
    const ctx = researchContext;
    const question = ctx.originalPrompt;
    const sym = ctx.subject.symbol || '';
    const name = ctx.subject.name;

    // Context-aware studio nodes
    if (sym === 'TSLA' || name.includes('TSLA') || question.includes('TSLA') || question.includes('特斯拉')) {
      setStudioNodes(tslaStudioNodes.map((n) =>
        n.id === 'research-target'
          ? { ...n, fields: n.fields.map((f) => f.key === '研究问题' ? { ...f, value: ctx.researchQuestion || 'TSLA 风险在哪里' } : f) }
          : n
      ));
      setStudioConnections(tslaStudioConnections);
      setStudioCopilot(tslaCopilotMessages.map((m) => ({ ...m })));
      setStudioStrategyName('TSLA Risk Study');
    } else if (name.includes('半导体') || question.includes('半导体') || sym === 'SOX') {
      setStudioNodes(semiStudioNodes.map((n) =>
        n.id === 'research-target'
          ? { ...n, fields: n.fields.map((f) => f.key === '研究问题' ? { ...f, value: ctx.researchQuestion || '搭建半导体研究流' } : f) }
          : n
      ));
      setStudioConnections(semiStudioConnections);
      setStudioCopilot(semiCopilotMessages.map((m) => ({ ...m })));
      setStudioStrategyName('Semiconductor Research Flow');
    } else if (name.includes('腾讯') || question.includes('腾讯') || sym === '00700.HK') {
      setStudioNodes(defaultStudioNodes.map((n) =>
        n.id === 'research-target'
          ? { ...n, fields: n.fields.map((f) => f.key === '研究问题' ? { ...f, value: ctx.researchQuestion || '拆解腾讯云增长逻辑' } : f) }
          : n
      ));
      setStudioConnections(defaultStudioConnections);
      setStudioCopilot(defaultCopilotMessages.map((m) => ({ ...m })));
      setStudioStrategyName('Tencent Cloud Growth Study');
    } else {
      setStudioNodes(defaultStudioNodes.map((n) =>
        n.id === 'research-target'
          ? { ...n, fields: n.fields.map((f) => f.key === '研究问题' ? { ...f, value: ctx.researchQuestion } : f) }
          : n
      ));
      setStudioConnections(defaultStudioConnections);
      setStudioCopilot([{
        role: 'assistant' as const,
        text: `已根据报告"${ctx.generatedReport?.title || ctx.researchQuestion}"打开研究流。`,
      }]);
      setStudioStrategyName(`${name} Study`);
    }
    setView('studio');
  }, [researchContext]);

  // ─── Studio ──────────────────────────────────────────────
  const handleStudioRun = useCallback(async () => {
    const ctx = researchContext;
    // Run the flow → a real report from the subject's SEC data (US symbols),
    // reusing the Phase 4 pipeline. Falls back to the mock run result.
    if (ctx) {
      try {
        const live = await generateLiveReport(ctx);
        if (live) {
          setResearchContext({ ...ctx, generatedReport: live.report, traceNodes: live.traceNodes });
          setView('research-report');
          return;
        }
      } catch {
        // fall through to mock result
      }
    }
    setView('studio-run-result');
  }, [researchContext]);

  const handleStudioContinue = useCallback(() => {
    setView('studio');
  }, []);

  const handleStudioNewTask = useCallback(() => {
    goHome();
  }, [goHome]);

  const handleStudioReturnToReport = useCallback(() => {
    setView('research-report');
  }, []);

  // ─── Library ─────────────────────────────────────────────
  const handleLibraryView = useCallback((_id: string) => {
    setView('research-report');
    showToast('查看报告 Demo');
  }, [showToast]);

  const handleLibraryDelete = useCallback((id: string) => {
    setLibraryItems((prev) => prev.filter((it) => it.id !== id));
    showToast('已删除');
    deleteLibraryItem(id); // persist (no-op if not configured)
  }, [showToast]);

  const handleLibraryEdit = useCallback((_id: string) => {
    setView('studio');
    showToast('已在 Studio 中打开');
  }, [showToast]);

  // ─── Settings ────────────────────────────────────────────
  const handleSettingsSave = useCallback(() => {
    showToast('数据源设置已保存');
  }, [showToast]);

  // ─── Error ───────────────────────────────────────────────
  const handleErrorRetry = useCallback(() => {
    setView('research-running');
  }, []);

  const handleErrorReturnSetup = useCallback(() => {
    setView('guided-setup');
  }, []);

  // ─── Show/hide MarketPulse ───────────────────────────────
  const showMarketPulse = view === 'home' || view === 'quick-setup' || view === 'quick-result';

  // ─── Derived data for report page ────────────────────────
  const reportData: ResearchReportType | null = researchContext?.generatedReport || null;
  const traceNodes: TraceNodeWithSections[] = researchContext?.traceNodes || [];

  return (
    <div className="h-full flex flex-col bg-xing-bg text-xing-text overflow-hidden">
      <LanguageToggle />
      <div className="flex-1 flex min-h-0" style={{ paddingBottom: showMarketPulse ? '42px' : '0' }}>
        <AnimatePresence mode="wait">
          {/* ── HOME ── */}
          {view === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.35 }} className="flex-1 flex flex-col">
              <StarAxisHome
                inputValue={userInput}
                onInputChange={setUserInput}
                onSubmit={handleSubmit}
                onExampleSubmit={handleExampleSubmit}
                onStudioClick={handleStudioDirectClick}
                onDirectIntent={handleDirectIntent}
                inputFocused={inputFocused}
                onInputFocus={() => setInputFocused(true)}
                onInputBlur={() => setInputFocused(false)}
              />
            </motion.div>
          )}

          {/* ── INTENT ROUTING ── */}
          {view === 'intent-routing' && (
            <motion.div key="intent-routing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="flex-1 flex flex-col">
              <IntentRouting
                input={userInput}
                detectedIntent={detectedIntentLabel}
                recommendation={recommendationLabel}
                onBack={goHome}
              />
            </motion.div>
          )}

          {/* ── QUICK SETUP ── */}
          {view === 'quick-setup' && (
            <motion.div key="quick-setup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="flex-1 flex flex-col">
              <QuickSetup
                symbol={researchContext?.subject.symbol || 'TSLA'}
                name={researchContext?.subject.name || 'Tesla, Inc.'}
                researchQuestion={researchContext?.researchQuestion || ''}
                onBack={goHome}
                onGenerate={handleQuickGenerate}
                onChangeSymbol={() => showToast('更换标的 Demo')}
              />
            </motion.div>
          )}

          {/* ── QUICK RESULT ── */}
          {view === 'quick-result' && (
            <motion.div key="quick-result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="flex-1 flex flex-col">
              <QuickResult
                data={tslaQuickResult}
                contextLabel={researchContext?.originalPrompt}
                onBack={() => setView('quick-setup')}
                onDeepResearch={handleQuickDeepResearch}
                onOpenStudio={handleQuickOpenStudio}
              />
            </motion.div>
          )}

          {/* ── GUIDED SETUP ── */}
          {view === 'guided-setup' && (
            <motion.div key="guided-setup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="flex-1 flex flex-col">
              <GuidedSetup
                context={researchContext}
                onBack={goHome}
                onSave={handleGuidedSave}
                onRun={handleGuidedRun}
              />
            </motion.div>
          )}

          {/* ── RESEARCH RUNNING ── */}
          {view === 'research-running' && (
            <motion.div key="research-running" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="flex-1 flex flex-col">
              <ResearchRunning
                context={researchContext}
                onBack={() => setView('guided-setup')}
                onComplete={handleResearchComplete}
                onAbort={() => setView('guided-setup')}
              />
            </motion.div>
          )}

          {/* ── CONFLICT REVIEW ── */}
          {view === 'conflict-review' && (
            <motion.div key="conflict-review" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="flex-1 flex flex-col">
              <ConflictReview
                context={researchContext}
                onBack={() => setView('research-running')}
                onResolve={handleConflictResolve}
              />
            </motion.div>
          )}

          {/* ── RESEARCH REPORT ── */}
          {view === 'research-report' && (
            <motion.div key="research-report" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="flex-1 flex min-h-0">
              <ResearchReport
                report={reportData}
                context={researchContext}
                onBack={goHome}
                onOpenStudio={handleOpenStudioFromReport}
                onExport={handleExportReport}
                onSaveToLibrary={handleSaveToLibrary}
                onFollowUp={handleFollowUp}
                highlightedSection={reportHighlightedSection}
                activeNodeId={activeTraceNode}
                onSectionHighlight={setReportHighlightedSection}
                onClearActiveNode={handleClearActiveNode}
              />
              <TraceCanvas
                nodes={traceNodes}
                onNodeClick={handleTraceNodeClick}
                activeNode={activeTraceNode}
                onNodeHover={handleTraceNodeHover}
              />
            </motion.div>
          )}

          {/* ── STUDIO ── */}
          {view === 'studio' && (
            <motion.div key="studio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="flex-1 flex flex-col">
              <StudioCanvas
                strategyName={studioStrategyName}
                nodes={studioNodes}
                connections={studioConnections}
                copilotInitial={studioCopilot}
                context={researchContext}
                onBack={goHome}
                onRun={handleStudioRun}
                onReturnToReport={handleStudioReturnToReport}
                showToast={showToast}
              />
            </motion.div>
          )}

          {/* ── STUDIO RUN RESULT ── */}
          {view === 'studio-run-result' && (
            <motion.div key="studio-run-result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="flex-1 flex flex-col">
              <StudioRunResultView
                data={studioRunResult}
                contextLabel={researchContext?.originalPrompt}
                onBack={() => setView('studio')}
                onViewReport={() => setView('research-report')}
                onContinueEdit={handleStudioContinue}
                onNewTask={handleStudioNewTask}
              />
            </motion.div>
          )}

          {/* ── LIBRARY ── */}
          {view === 'library' && (
            <motion.div key="library" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="flex-1 flex flex-col">
              <Library
                onBack={goHome}
                onViewReport={handleLibraryView}
                onEditInStudio={handleLibraryEdit}
                onDelete={handleLibraryDelete}
                showToast={showToast}
                items={libraryItems}
              />
            </motion.div>
          )}

          {/* ── DATA SOURCE SETTINGS ── */}
          {view === 'data-source-settings' && (
            <motion.div key="data-source-settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="flex-1 flex flex-col">
              <DataSourceSettings
                onBack={goHome}
                showToast={showToast}
              />
            </motion.div>
          )}

          {/* ── UNKNOWN INTENT ── */}
          {view === 'unknown-intent' && (
            <motion.div key="unknown-intent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="flex-1 flex flex-col">
              <UnknownIntent
                input={userInput}
                onBack={goHome}
                onQuickAnalysis={() => {
                  createAndRoute('TSLA 风险在哪里', 'quick');
                }}
                onGuidedResearch={() => {
                  createAndRoute(userInput || '拆解腾讯云增长逻辑', 'guided');
                }}
                onStudio={() => {
                  handleStudioDirectClick();
                }}
              />
            </motion.div>
          )}

          {/* ── ERROR ── */}
          {view === 'error' && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="flex-1 flex flex-col">
              <ErrorPage
                type="source"
                onBack={goHome}
                onRetry={handleErrorRetry}
                onReturnToSetup={handleErrorReturnSetup}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Market Pulse */}
      {showMarketPulse && <MarketPulse />}

      {/* Toast */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}