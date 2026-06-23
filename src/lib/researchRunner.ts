import type { DataSourceCard, ResearchSkeletonItem, ConflictData } from './types';

export function getResearchSteps(): string[] {
  return [
    '研究规划',
    '证据收集',
    '分析推理',
    '结论输出',
  ];
}

export function getMockDataSources(): DataSourceCard[] {
  return [
    { id: 'ds-1', name: 'Investor Relations', domain: 'ir.tesla.com', status: 'fetched', progress: 100, count: '10/10', category: 'official' },
    { id: 'ds-2', name: 'SEC 10-Q Filing', domain: 'sec.gov', status: 'fetched', progress: 100, count: '8/8', category: 'official' },
    { id: 'ds-3', name: 'SEC 10-K Filing', domain: 'sec.gov', status: 'fetched', progress: 100, count: '5/5', category: 'official' },
    { id: 'ds-4', name: 'Official Blog', domain: 'tesla.com/blog', status: 'fetched', progress: 100, count: '3/3', category: 'official' },
    { id: 'ds-5', name: 'Morgan Stanley Report', domain: 'morganstanley.com', status: 'processing', progress: 71, count: '5/7', category: 'sellside' },
    { id: 'ds-6', name: 'Goldman Sachs Report', domain: 'goldmansachs.com', status: 'fetched', progress: 100, count: '4/4', category: 'sellside' },
    { id: 'ds-7', name: 'J.P. Morgan Report', domain: 'jpmorgan.com', status: 'pending', progress: 0, count: '0/6', category: 'sellside' },
    { id: 'ds-8', name: 'UBS Report', domain: 'ubs.com', status: 'pending', progress: 0, count: '0/3', category: 'sellside' },
    { id: 'ds-9', name: 'Industry Research', domain: 'bloomberg.com', status: 'processing', progress: 45, count: '4/9', category: 'supplementary' },
    { id: 'ds-10', name: 'News Coverage', domain: 'reuters.com', status: 'fetched', progress: 100, count: '15/15', category: 'supplementary' },
    { id: 'ds-11', name: 'Supply Chain Data', domain: 'importgenius.com', status: 'pending', progress: 0, count: '0/4', category: 'supplementary' },
    { id: 'ds-12', name: 'Patent Data', domain: 'uspto.gov', status: 'failed', progress: 0, count: '0/2', category: 'supplementary' },
  ];
}

export function getMockResearchSkeleton(): ResearchSkeletonItem[] {
  return [
    { label: '业务拆解', done: 0, total: 6 },
    { label: '增长驱动', done: 0, total: 5 },
    { label: '风险点', done: 0, total: 6 },
    { label: '初步结论', done: 0, total: 4 },
  ];
}

export function getMockConflict(): ConflictData {
  return {
    title: '检测到关键定义偏差',
    originalLabel: '原始口径',
    originalGrowth: '+28.4% YoY',
    originalDefinition: '仅计入云服务收入',
    originalOneTime: '不包含政府补贴与迁移补贴',
    originalSource: '腾讯云财报 2024Q1',
    originalBias: '低估整体增长，约 -6.2pp',
    correctedLabel: '修正口径',
    correctedGrowth: '+34.6% YoY',
    correctedDefinition: '云服务收入 + 生态服务收入 + 政府补贴收入',
    correctedOneTime: '包含政府补贴与迁移补贴',
    correctedSource: '腾讯云财报 2024Q1 + 内部经营报表（补充）',
    correctedBias: '高估潜在风险，约 +4.0pp',
    conflictType: '收入定义分歧',
    suggestion: '检测到两种口径在"收入定义"与"一次性项目处理"上存在关键差异，可能导致结论偏差。建议结合分析目标选择口径，或保留两种观点写入最终报告。',
  };
}