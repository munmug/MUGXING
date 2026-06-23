// ============================================================
// Xing V4 — Core Type System
// ============================================================

export type AppView =
  | 'home'
  | 'intent-routing'
  | 'quick-setup'
  | 'quick-result'
  | 'guided-setup'
  | 'research-running'
  | 'conflict-review'
  | 'research-report'
  | 'source-detail'
  | 'studio'
  | 'studio-run-result'
  | 'library'
  | 'data-source-settings'
  | 'unknown-intent'
  | 'error';

export type IntentType = 'quick' | 'guided' | 'studio' | 'unknown';

export type QuickFocus = 'risk' | 'drivers' | 'tracking';

export type AnalysisFramework = 'growth-breakdown' | 'financial-quality' | 'competitive-landscape' | 'risk-audit';

export type DataSourceType = 'official-filing' | 'earnings' | 'call-transcript' | 'sellside-report' | 'industry-data' | 'news-sentiment';

export type ConflictResolution = 'original' | 'adjusted' | 'both';

export type SubjectType = 'stock' | 'company' | 'sector' | 'theme';

export type RunStatus = 'idle' | 'running' | 'conflict' | 'completed' | 'failed';

// ============================================================
// Research Context — the backbone that flows through all pages
// ============================================================

export interface ResearchSubject {
  type: SubjectType;
  symbol?: string;
  name: string;
  market?: string;
  aliases?: string[];
}

export interface ResearchGoal {
  primary: string;
  secondary?: string[];
  userConcern?: string;
}

export interface ResearchConflict {
  id: string;
  title: string;
  description: string;
  original: {
    label: string;
    growth: string;
    definition: string;
    excludes: string;
    source: string;
    bias: string;
  };
  adjusted: {
    label: string;
    growth: string;
    definition: string;
    includes: string;
    source: string;
    bias: string;
  };
  conflictType: string;
  suggestion: string;
}

export interface ConflictResolutionRecord {
  selectedOption: ConflictResolution;
  selectedLabel: string;
  reason: string;
  timestamp: string;
}

export interface ResearchContext {
  id: string;
  originalPrompt: string;
  followUpPrompt?: string;
  intentType: IntentType;
  subject: ResearchSubject;
  researchQuestion: string;
  researchGoal: ResearchGoal;
  selectedFrameworks: AnalysisFramework[];
  selectedSources: DataSourceType[];
  runState: {
    status: RunStatus;
    currentStep: string;
    progress: number;
  };
  conflicts: ResearchConflict[];
  conflictResolution?: ConflictResolutionRecord;
  generatedReport?: ResearchReport;
  traceNodes: TraceNodeWithSections[];
}

export interface IntentResult {
  intentType: IntentType;
  subject: ResearchSubject;
  researchQuestion: string;
  suggestedFrameworks: AnalysisFramework[];
  suggestedSources: DataSourceType[];
  suggestedFocus: string;
}

// ============================================================
// Research Report — context-driven structured report
// ============================================================

export interface ReportSection {
  id: string;
  title: string;
  content: string;
  sourceNodeIds: string[];
}

export interface ResearchReport {
  title: string;
  subtitle: string;
  tags: string[];
  status: string;
  symbolBadge?: string;
  resolutionCard?: {
    label: string;
    description: string;
  };
  coreConclusion: string;
  sections: ReportSection[];
  nextVerificationSteps: string[];
  finalConclusion: string;
}

// ============================================================
// Trace Node with section mapping
// ============================================================

export interface TraceNodeWithSections {
  id: string;
  label: string;
  publisher: string;
  date: string;
  sourceType: string;
  pathType: 'cold-path' | 'hot-path' | 'type-safe';
  relatedSections: string[];
  extractedSignals: string[];
}

// ============================================================
// Legacy types (kept for backward compat during transition)
// ============================================================

export interface MarketPulseItem {
  label: string;
  value: string;
  change: string;
  status: 'up' | 'down' | 'neutral';
}

export interface QuickAnalysisConfig {
  symbol: string;
  name: string;
  focus: QuickFocus;
  timeframe: string;
}

export interface QuickResultData {
  symbol: string;
  name: string;
  riskLevel: string;
  riskScore: number;
  coreJudgment: string;
  analysisBasis: string;
  dataDate: string;
  driverCards: DriverCard[];
  indicatorCards: IndicatorCard[];
  riskCards: RiskItem[];
  nextSteps: string[];
}

export interface DriverCard {
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
}

export interface IndicatorCard {
  label: string;
  value: string;
  subtext: string;
}

export interface RiskItem {
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
}

export interface GuidedResearchConfig {
  question: string;
  scope: string;
  frameworks: AnalysisFramework[];
  sources: DataSourceType[];
  outputFormat: string;
}

export interface DataSourceCard {
  id: string;
  name: string;
  domain: string;
  status: 'fetched' | 'processing' | 'pending' | 'failed';
  progress: number;
  count: string;
  category: 'official' | 'sellside' | 'supplementary';
}

export interface ResearchSkeletonItem {
  label: string;
  done: number;
  total: number;
}

export interface ConflictData {
  title: string;
  originalLabel: string;
  originalGrowth: string;
  originalDefinition: string;
  originalOneTime: string;
  originalSource: string;
  originalBias: string;
  correctedLabel: string;
  correctedGrowth: string;
  correctedDefinition: string;
  correctedOneTime: string;
  correctedSource: string;
  correctedBias: string;
  conflictType: string;
  suggestion: string;
}

export interface ReportData {
  title: string;
  tags: string[];
  status: string;
  coreConclusion: string;
  drivers: { title: string; content: string }[];
  risks: { title: string; content: string }[];
  nextSteps: { title: string; content: string }[];
  resolution: string;
}

export interface TraceNode {
  id: string;
  label: string;
  publisher: string;
  date: string;
  status: string;
  detail: string;
  sectionIndex: number;
}

export interface ResearchNode {
  id: string;
  label: string;
  description: string;
  x: number;
  y: number;
  fields: { key: string; value: string; editable?: boolean }[];
  type: 'target' | 'data' | 'audit' | 'output';
  edited?: boolean;
}

export interface ResearchConnection {
  from: string;
  to: string;
}

export interface CopilotMessage {
  role: 'assistant' | 'user' | 'action';
  text: string;
}

export interface LibraryItem {
  id: string;
  title: string;
  symbol: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  status: 'completed' | 'draft' | 'running' | 'error';
}

export interface DataSourceSetting {
  id: string;
  name: string;
  category: string;
  status: 'available' | 'unconfigured' | 'error';
  updatedAt: string;
  scope: string;
  enabled: boolean;
}

export interface StudioRunResult {
  conclusionSummary: string;
  confidence: number;
  keyVariables: { name: string; value: number }[];
  risks: string[];
  recommendations: string[];
  executionLog: string[];
}