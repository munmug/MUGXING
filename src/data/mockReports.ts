import type { QuickResultData, ReportData, TraceNode } from '@/lib/types';

export const tslaQuickResult: QuickResultData = {
  symbol: 'TSLA',
  name: 'Tesla, Inc.',
  riskLevel: '中等',
  riskScore: 58,
  coreJudgment: '短期波动风险上升，但核心下行触发仍集中在交付预期与利润率修正。当前价位处于机构筹码密集区范围内，不宜过度悲观。',
  analysisBasis: '分析基于 27 项指标，覆盖估值、情绪、基本面与事件驱动维度。',
  dataDate: '2024-05-20',
  driverCards: [
    { title: 'Q2 交付预期', description: '华尔街一致预期 438K，Xing 修正至 425K-432K。交付数据将成为短期股价核心驱动。', impact: 'negative' },
    { title: 'FSD 进展', description: 'V12.4 推送节奏加快，用户反馈正面。若能如期落地中国市场，将显著提升估值天花板。', impact: 'positive' },
    { title: '能源业务', description: 'Megapack 产能扩张持续推进，毛利率高于汽车业务，有望成为第二增长曲线。', impact: 'positive' },
  ],
  indicatorCards: [
    { label: '市场情绪', value: '62/100', subtext: '中等偏多' },
    { label: '关键区间', value: '$173.8-$179.2', subtext: '机构筹码密集区' },
    { label: '20日波动率', value: '31.6%', subtext: '偏高' },
    { label: '做空比例', value: '3.2%', subtext: '低于历史均值' },
  ],
  riskCards: [
    { title: '交付不及预期', description: '若Q2实际交付低于420K，短期将面临较大抛压。', severity: 'high' },
    { title: '利润率压缩', description: '降价策略可能继续侵蚀汽车毛利率，需要关注Q2财报中的毛利率指引。', severity: 'medium' },
    { title: '宏观风险', description: '利率政策不确定性可能抑制成长股估值，影响市场风险偏好。', severity: 'medium' },
    { title: '竞争加剧', description: '中国新能源车企价格战加剧，可能影响特斯拉在中国市场份额。', severity: 'low' },
  ],
  nextSteps: [
    '跟踪每周交付注册数据，与Xing修正预期对比',
    '关注6月中旬Q2交付公告',
    '评估FSD中国落地时间表对估值的影响',
  ],
};

export const tencentReport: ReportData = {
  title: '腾讯云增长逻辑研究报告',
  tags: ['增长拆解', '财务质量'],
  status: '已完成',
  coreConclusion: '腾讯云业务正处于从规模扩张到质量增长的转型期。修正口径下 YoY 增长 34.6%，高于原始披露口径的 28.4%。核心驱动来自政企数字化渗透加速与SaaS产品矩阵成熟。需关注竞争格局变化与宏观环境不确定性对政企客户预算的影响。',
  drivers: [
    { title: '政企数字化渗透', content: '政府与企业数字化转型加速，腾讯云在政务、金融、医疗等行业中标数量同比增长 42%。混合云与私有化部署成为差异化竞争优势。' },
    { title: 'SaaS 产品矩阵', content: '企业微信、腾讯会议、腾讯文档等 SaaS 产品付费用户规模持续扩大，形成从 IaaS 到 SaaS 的完整收入链条。' },
    { title: 'AI 能力加持', content: '混元大模型在云服务中的集成推动客单价提升约 15%，AI 训练与推理需求成为新的增长引擎。' },
  ],
  risks: [
    { title: '竞争白热化', content: '阿里云、华为云在政企市场份额竞争激烈，价格战可能压缩利润率。字节火山引擎在AI领域快速崛起构成新威胁。' },
    { title: '宏观不确定性', content: '经济增速放缓可能影响企业IT预算，政企客户回款周期延长至 180 天以上。' },
  ],
  nextSteps: [
    { title: '追踪季度财报', content: '重点关注下个财报窗口的云业务收入增速和毛利率变化，验证增长逻辑是否持续。' },
    { title: '监控竞争动态', content: '持续跟踪主要竞争对手（阿里云、华为云）的季度表现，评估市场份额变化趋势。' },
  ],
  resolution: '保留两种口径观点：原始口径 28.4% 用于与同行可比口径对比，修正口径 34.6% 反映完整业务增长全貌。',
};

export const traceNodes: TraceNode[] = [
  { id: 't1', label: '官方公告 Q1', publisher: '腾讯控股', date: '2024-05-15', status: 'cold-path', detail: '云业务收入定义及分类说明', sectionIndex: 0 },
  { id: 't2', label: '财报电话会', publisher: '腾讯控股 IR', date: '2024-05-15', status: 'cold-path', detail: '管理层对云业务增长的展望', sectionIndex: 1 },
  { id: 't3', label: '卖方研报切片', publisher: 'Goldman Sachs', date: '2024-05-14', status: 'hot-path', detail: '卖方对腾讯云收入预测及估值分析', sectionIndex: 2 },
  { id: 't4', label: '行业数据', publisher: 'IDC China', date: '2024-04-28', status: 'cold-path', detail: '2024Q1中国云服务市场份额报告', sectionIndex: 3 },
  { id: 't5', label: '结论汇总', publisher: 'Xing Research', date: '2024-05-20', status: 'type-safe', detail: '多源数据交叉验证后的最终结论', sectionIndex: 4 },
];