import type { ResearchNode, ResearchConnection, CopilotMessage, StudioRunResult } from '@/lib/types';

// ────────────────────────────────────────────────────────────
// Default (Tencent Cloud)
// ────────────────────────────────────────────────────────────

export const defaultStudioNodes: ResearchNode[] = [
  { id: 'research-target', label: '研究目标', description: '定义本次研究的核心问题与分析范围', x: 240, y: 80, type: 'target', fields: [{ key: '研究问题', value: '拆解腾讯云增长逻辑' }, { key: '分析范围', value: '腾讯云业务线' }] },
  { id: 'official-sources', label: '官方资料', description: '官方披露、财报、电话会纪要', x: 80, y: 260, type: 'data', fields: [{ key: '数据来源', value: '披露易 + 财报 + IR网站' }, { key: '状态', value: '已抓取' }] },
  { id: 'sellside-views', label: '卖方观点', description: '高盛、摩根士丹利等卖方研报', x: 400, y: 260, type: 'data', fields: [{ key: '覆盖机构', value: 'Goldman, MS, JPM, UBS' }, { key: '状态', value: '部分获取' }] },
  { id: 'conflict-review', label: '冲突审查', description: '对比官方与卖方在口径和指标上的差异', x: 240, y: 440, type: 'audit', fields: [{ key: '审查规则', value: '口径对比 + 指标对齐', editable: true }, { key: '优先口径', value: '保留多口径', editable: true }] },
  { id: 'conclusion-gen', label: '结论生成', description: '基于审查结果输出最终结论', x: 240, y: 610, type: 'output', fields: [{ key: '输出格式', value: 'Markdown报告', editable: true }, { key: '置信度阈值', value: '75%', editable: true }] },
];

export const defaultStudioConnections: ResearchConnection[] = [
  { from: 'research-target', to: 'official-sources' },
  { from: 'research-target', to: 'sellside-views' },
  { from: 'official-sources', to: 'conflict-review' },
  { from: 'sellside-views', to: 'conflict-review' },
  { from: 'conflict-review', to: 'conclusion-gen' },
];

export const defaultCopilotMessages: CopilotMessage[] = [
  { role: 'assistant', text: '已根据"拆解腾讯云增长逻辑"自动生成研究流。当前包含目标定义、官方/卖方数据源、冲突审查和结论生成模块。你可以点击节点编辑参数，或修改数据源配置。' },
];

// ────────────────────────────────────────────────────────────
// TSLA Risk Study
// ────────────────────────────────────────────────────────────

export const tslaStudioNodes: ResearchNode[] = [
  { id: 'research-target', label: '研究目标', description: 'TSLA风险深度研究', x: 240, y: 50, type: 'target', fields: [{ key: '研究问题', value: 'TSLA 风险在哪里' }, { key: '分析范围', value: 'TSLA 短期风险' }] },
  { id: 'market-data', label: '行情数据', description: '价格波动与关键区间分析', x: 40, y: 220, type: 'data', fields: [{ key: '数据来源', value: 'Bloomberg' }, { key: '关键区间', value: '$173.8-$179.2' }, { key: '状态', value: '已抓取' }] },
  { id: 'news-sentiment', label: '新闻舆情', description: 'Reuters、市场情绪、价格战信息', x: 240, y: 200, type: 'data', fields: [{ key: '数据来源', value: 'Reuters + 综合来源' }, { key: '关注重点', value: '交付预期、毛利率、FSD' }, { key: '状态', value: '已抓取' }] },
  { id: 'event-calendar', label: '事件日历', description: '交付数据、财报窗口、FSD监管节点', x: 440, y: 220, type: 'data', fields: [{ key: '数据来源', value: 'Xing Research' }, { key: '下一事件', value: 'Q2交付公告' }, { key: '状态', value: '已抓取' }] },
  { id: 'risk-review', label: '风险审查', description: '交付预期、毛利率压力、估值回落、监管风险', x: 240, y: 400, type: 'audit', fields: [{ key: '审查维度', value: '交付 / 毛利率 / 情绪 / 技术 / 事件', editable: true }, { key: '风险等级阈值', value: '中等', editable: true }] },
  { id: 'conclusion-gen', label: '结论生成', description: '生成 TSLA 风险报告', x: 240, y: 570, type: 'output', fields: [{ key: '输出格式', value: '结构化风险报告', editable: true }, { key: '置信度阈值', value: '72%', editable: true }] },
];

export const tslaStudioConnections: ResearchConnection[] = [
  { from: 'research-target', to: 'market-data' },
  { from: 'research-target', to: 'news-sentiment' },
  { from: 'research-target', to: 'event-calendar' },
  { from: 'market-data', to: 'risk-review' },
  { from: 'news-sentiment', to: 'risk-review' },
  { from: 'event-calendar', to: 'risk-review' },
  { from: 'risk-review', to: 'conclusion-gen' },
];

export const tslaCopilotMessages: CopilotMessage[] = [
  { role: 'assistant', text: '已根据"TSLA 风险深度研究报告"自动生成研究流。当前包含行情数据、新闻舆情、事件日历、风险审查和结论生成模块。默认选中「风险审查」节点，你可以调整审查维度或重新运行分析。' },
];

// ────────────────────────────────────────────────────────────
// Semiconductor Study
// ────────────────────────────────────────────────────────────

export const semiStudioNodes: ResearchNode[] = [
  { id: 'research-target', label: '研究目标', description: '半导体产业链研究', x: 240, y: 50, type: 'target', fields: [{ key: '研究问题', value: '搭建半导体研究流' }, { key: '分析范围', value: 'AI算力 + 先进制程 + 库存周期' }] },
  { id: 'demand-data', label: '需求侧数据', description: 'AI算力需求、GPU/HBM订单', x: 80, y: 240, type: 'data', fields: [{ key: '数据来源', value: '行业报告 + 芯片厂商财报' }, { key: '状态', value: '已抓取' }] },
  { id: 'supply-data', label: '供给侧数据', description: '先进制程产能、设备支出', x: 400, y: 240, type: 'data', fields: [{ key: '数据来源', value: '台积电 + ASML + SEMI' }, { key: '状态', value: '已抓取' }] },
  { id: 'cycle-audit', label: '周期审查', description: '库存周期、非AI需求恢复', x: 240, y: 420, type: 'audit', fields: [{ key: '审查维度', value: '库存 / 产能 / 需求 / 政策', editable: true }] },
  { id: 'conclusion-gen', label: '结论生成', description: '生成半导体产业链分析', x: 240, y: 590, type: 'output', fields: [{ key: '输出格式', value: '结构化产业链报告', editable: true }, { key: '置信度阈值', value: '70%', editable: true }] },
];

export const semiStudioConnections: ResearchConnection[] = [
  { from: 'research-target', to: 'demand-data' },
  { from: 'research-target', to: 'supply-data' },
  { from: 'demand-data', to: 'cycle-audit' },
  { from: 'supply-data', to: 'cycle-audit' },
  { from: 'cycle-audit', to: 'conclusion-gen' },
];

export const semiCopilotMessages: CopilotMessage[] = [
  { role: 'assistant', text: '已根据"半导体产业链研究"自动生成研究流。当前包含需求侧数据、供给侧数据、周期审查和结论生成模块。你可以调整审查维度或添加新的数据源节点。' },
];

// ────────────────────────────────────────────────────────────
// Studio Run Result
// ────────────────────────────────────────────────────────────

export const studioRunResult: StudioRunResult = {
  conclusionSummary: '偏乐观，置信度 78%。',
  confidence: 78,
  keyVariables: [
    { name: '需求增长率', value: 0.62 },
    { name: '供给约束指数', value: -0.41 },
    { name: '成本压力', value: -0.28 },
    { name: '政策支持度', value: 0.35 },
    { name: '市场情绪指数', value: 0.19 },
  ],
  risks: [
    '宏观波动加大导致需求不及预期',
    '政策节奏变化影响落地效率',
    '成本上行压缩利润空间',
    '竞争加剧可能引发价格压力',
  ],
  recommendations: [
    '优先推进核心产品线资源投入',
    '加强供应链韧性与成本管控',
    '关注政策窗口，提前布局合规',
    '建立竞争监测与快速响应机制',
  ],
  executionLog: [
    '研究初始化',
    '数据检索与清洗',
    '多源证据抽取',
    '变量建模与分析',
    '情景推演',
    '结论生成与校验',
    '报告与资料同步',
  ],
};