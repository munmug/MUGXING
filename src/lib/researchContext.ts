import type {
  ResearchContext, ResearchReport, ResearchConflict,
  ConflictResolutionRecord, TraceNodeWithSections,
  ResearchSubject, ResearchGoal, IntentResult,
  AnalysisFramework, DataSourceType, SubjectType,
} from './types';
import { intentRouterEnhanced } from './intentRouter';

let ctxCounter = 1;

function nextId(): string {
  return `rc-${Date.now()}-${ctxCounter++}`;
}

// ============================================================
// createResearchContext — factory from user prompt
// ============================================================

export function createResearchContext(prompt: string, followUp?: string, intentOverride?: IntentResult): ResearchContext {
  const intent = intentOverride ?? intentRouterEnhanced(prompt);
  const subject = intent.subject;
  const id = nextId();

  return {
    id,
    originalPrompt: prompt,
    followUpPrompt: followUp || undefined,
    intentType: intent.intentType,
    subject,
    researchQuestion: followUp
      ? `${subject.name} ${followUp.replace(/^重点分析/, '').replace(/^分析/, '').trim()}补充分析`
      : intent.researchQuestion,
    researchGoal: followUp
      ? { primary: `针对"${followUp}"进行深入补充分析`, secondary: intent.suggestedFrameworks as unknown as string[], userConcern: followUp }
      : deriveGoal(subject, intent),
    selectedFrameworks: intent.suggestedFrameworks,
    selectedSources: intent.suggestedSources,
    runState: { status: 'idle', currentStep: 'created', progress: 0 },
    conflicts: [],
    traceNodes: [],
  };
}

function deriveGoal(subject: ResearchSubject, intent: IntentResult): ResearchGoal {
  const name = subject.name;

  if (name.includes('腾讯云') || name.includes('Tencent') && name.includes('Cloud')) {
    return {
      primary: '识别腾讯云增长的主要来源、增长口径差异、增长持续性和风险边界。',
      secondary: ['收入增长来源', '增长口径定义', '一次性项目影响', '云业务与生态服务边界', '行业竞争和价格压力', '后续验证指标'],
      userConcern: intent.suggestedFocus,
    };
  }

  if (subject.symbol === 'TSLA') {
    return {
      primary: '识别TSLA当前核心风险来源、短期波动触发点和关键价格区间。',
      secondary: ['交付预期波动', '利润率趋势', '市场情绪分歧', '技术区间分析'],
      userConcern: intent.suggestedFocus,
    };
  }

  if (name.includes('半导体')) {
    return {
      primary: '验证半导体行业增长是否由AI算力需求、先进制程产能和库存周期共同驱动。',
      secondary: ['AI算力需求', '先进制程产能', '库存周期', '非AI需求恢复'],
      userConcern: intent.suggestedFocus,
    };
  }

  return {
    primary: `围绕"${subject.name}"进行深入分析，识别关键驱动因素与风险。`,
    secondary: ['增长驱动', '风险识别', '竞争格局'],
    userConcern: intent.suggestedFocus,
  };
}

// ============================================================
// generateConflictForContext — create context-aware conflict
// ============================================================

export function generateConflictForContext(ctx: ResearchContext): ResearchConflict | null {
  const name = ctx.subject.name;

  if (name.includes('腾讯云') || (name.includes('Tencent') && name.includes('Cloud'))) {
    return {
      id: 'conflict-tencent-growth',
      title: '检测到关键定义偏差',
      description: '不同来源对腾讯云增长的统计口径存在差异，一类只统计"云基础设施收入"，另一类将"生态服务、企业微信协同、AI服务收入"计入相关增长贡献。',
      original: {
        label: '原始口径',
        growth: '28.4% YoY',
        definition: '仅计入云基础设施与核心云服务收入',
        excludes: '企业微信、腾讯会议、AI模型服务、政府补贴',
        source: '腾讯控股财报披露口径',
        bias: '更保守，可能低估整体企业服务增长',
      },
      adjusted: {
        label: '扩展口径',
        growth: '34.6% YoY',
        definition: '云服务 + 企业服务生态 + AI云相关增量',
        includes: '企业微信、腾讯会议、AI服务、部分生态服务收入',
        source: '财报电话会 + 卖方模型 + 行业数据',
        bias: '更能反映业务延展，但可能高估云业务本身增长',
      },
      conflictType: '增长率口径差异',
      suggestion: '检测到两种口径在"收入定义"与"一次性项目处理"上存在关键差异，可能导致结论偏差。建议结合分析目标选择口径，或保留两种观点写入最终报告。',
    };
  }

  // For other subjects, no conflict (or a generic one)
  return null;
}

export function getConflictResolutionOptions() {
  return [
    { id: 'original' as const, label: '采用原始口径', desc: '仅保留官方披露数据，适用于严格财务口径对比' },
    { id: 'adjusted' as const, label: '采用扩展口径', desc: '使用扩展后数据，更真实反映业务增长全貌' },
    { id: 'both' as const, label: '保留两种口径并写入报告', desc: '同时记录两种口径，让读者了解不同视角' },
  ];
}

// ============================================================
// generateReport — context-driven report generator
// ============================================================

export function generateReport(ctx: ResearchContext): ResearchReport {
  const name = ctx.subject.name;
  const prompt = ctx.originalPrompt;
  const resolution = ctx.conflictResolution;

  // Follow-up scenario
  if (ctx.followUpPrompt) {
    if (ctx.followUpPrompt.includes('毛利率')) {
      return generateTslaMarginReport(ctx);
    }
    if (ctx.followUpPrompt.includes('交付')) {
      return generateTslaDeliveryReport(ctx);
    }
    return generateFollowUpReport(ctx);
  }

  if (name.includes('腾讯云') || (name.includes('Tencent') && name.includes('Cloud')) || prompt.includes('腾讯云')) {
    return generateTencentCloudReport(ctx, resolution);
  }

  if (ctx.subject.symbol === 'TSLA' || prompt.includes('TSLA') || prompt.includes('tsla') || prompt.includes('特斯拉')) {
    return generateTslaRiskReport(ctx);
  }

  if (name.includes('半导体') || prompt.includes('半导体')) {
    return generateSemiconductorReport(ctx);
  }

  return generateGenericReport(ctx);
}

// ============================================================
// generateTraceNodes — context-driven trace nodes
// ============================================================

export function generateTraceNodes(ctx: ResearchContext): TraceNodeWithSections[] {
  const name = ctx.subject.name;

  if (ctx.followUpPrompt) {
    if (ctx.followUpPrompt.includes('毛利率')) {
      return [
        { id: 'tt1', label: '行情数据', publisher: 'Bloomberg', date: '2024-05-20', sourceType: '行情数据', pathType: 'cold-path', relatedSections: ['sec-margin-pressure', 'sec-margin-outlook'], extractedSignals: ['价格波动集中在 $173.8-$179.2', '毛利率趋势与股价相关性分析', '机构持仓变化'] },
        { id: 'tt2', label: '新闻舆情', publisher: 'Reuters', date: '2024-05-19', sourceType: '新闻舆情', pathType: 'hot-path', relatedSections: ['sec-margin-pressure'], extractedSignals: ['市场对毛利率修复节奏存在分歧', '价格战仍是主要风险点', 'FSD 进展对情绪有一定支撑'] },
        { id: 'tt3', label: '事件日历', publisher: 'Xing Research', date: '2024-05-20', sourceType: '事件追踪', pathType: 'type-safe', relatedSections: ['sec-margin-outlook'], extractedSignals: ['Q2财报窗口', '毛利率数据发布'] },
      ];
    }
    if (ctx.followUpPrompt.includes('交付')) {
      return [
        { id: 'tt1', label: '行情数据', publisher: 'Bloomberg', date: '2024-05-20', sourceType: '行情数据', pathType: 'cold-path', relatedSections: ['sec-delivery-drivers'], extractedSignals: ['成交区间分析', '资金流向信号'] },
        { id: 'tt2', label: '新闻舆情', publisher: 'Reuters', date: '2024-05-19', sourceType: '新闻舆情', pathType: 'hot-path', relatedSections: ['sec-delivery-scenarios'], extractedSignals: ['Q2交付预期分歧', '中国市场观望情绪'] },
        { id: 'tt3', label: '事件日历', publisher: 'Xing Research', date: '2024-05-20', sourceType: '事件追踪', pathType: 'type-safe', relatedSections: ['sec-delivery-drivers', 'sec-delivery-scenarios'], extractedSignals: ['Q2交付公告临近', '欧洲补贴政策变化'] },
      ];
    }
    return [
      { id: 'tt1', label: '补充数据', publisher: 'Bloomberg', date: '2024-05-20', sourceType: '行情数据', pathType: 'cold-path', relatedSections: ['sec-followup-analysis'], extractedSignals: ['补充分析数据'] },
      { id: 'tt2', label: '新闻舆情', publisher: 'Reuters', date: '2024-05-19', sourceType: '新闻舆情', pathType: 'hot-path', relatedSections: ['sec-followup-analysis'], extractedSignals: ['舆情补充信息'] },
    ];
  }

  if (name.includes('腾讯云') || (name.includes('Tencent') && name.includes('Cloud')) || ctx.originalPrompt.includes('腾讯云')) {
    return [
      {
        id: 't1', label: '官方公告 Q1', publisher: '腾讯控股', date: '2024-05-15',
        sourceType: '官方渠道', pathType: 'cold-path',
        relatedSections: ['核心结论', '口径差异与影响'],
        extractedSignals: ['云业务收入定义及分类说明', '核心云服务收入恢复性增长'],
      },
      {
        id: 't2', label: '财报电话会', publisher: '腾讯控股 IR', date: '2024-05-15',
        sourceType: '官方渠道', pathType: 'cold-path',
        relatedSections: ['增长来源拆解', '下一步验证指标'],
        extractedSignals: ['管理层强调企业客户对AI和云服务需求提升', '企业微信、会议、文档等协同产品带来客户粘性', '云业务毛利率改善仍需观察'],
      },
      {
        id: 't3', label: '卖方研报切片', publisher: 'Goldman Sachs', date: '2024-05-14',
        sourceType: '卖方研报', pathType: 'hot-path',
        relatedSections: ['口径差异与影响', '风险与反证'],
        extractedSignals: ['卖方对腾讯云收入预测维持增长', '关注政企大客户续约情况'],
      },
      {
        id: 't4', label: '行业数据报告', publisher: 'IDC China', date: '2024-04-28',
        sourceType: '行业数据', pathType: 'cold-path',
        relatedSections: ['增长来源拆解', '风险与反证'],
        extractedSignals: ['2024Q1中国云服务市场增速回升', '腾讯云市场份额保持前三'],
      },
      {
        id: 't5', label: '结论汇总', publisher: 'Xing Research', date: '2024-05-20',
        sourceType: '研究总结', pathType: 'type-safe',
        relatedSections: ['研究结论'],
        extractedSignals: ['多源数据交叉验证完成', '两种口径均已保留'],
      },
    ];
  }

  if (ctx.subject.symbol === 'TSLA') {
    return [
      {
        id: 'tt1', label: '行情数据', publisher: 'Bloomberg', date: '2024-05-20',
        sourceType: '行情数据', pathType: 'cold-path',
        relatedSections: ['sec-tsla-drivers', 'core-conclusion'],
        extractedSignals: ['价格波动集中在 $173.8-$179.2 区间', '成交量在关键区间附近放大', '短线资金对交付数据更敏感'],
      },
      {
        id: 'tt2', label: '新闻舆情', publisher: 'Reuters', date: '2024-05-19',
        sourceType: '新闻舆情', pathType: 'hot-path',
        relatedSections: ['sec-tsla-risks', 'sec-tsla-drivers'],
        extractedSignals: ['市场对毛利率修复节奏存在分歧', '价格战仍是主要风险点', 'FSD 进展对情绪有一定支撑'],
      },
      {
        id: 'tt3', label: '事件日历', publisher: 'Xing Research', date: '2024-05-20',
        sourceType: '事件追踪', pathType: 'type-safe',
        relatedSections: ['verification-steps'],
        extractedSignals: ['下一次交付数据是关键验证点', '财报窗口前波动可能放大', '监管与FSD落地节奏需继续观察'],
      },
    ];
  }

  return [
    {
      id: 'tg1', label: '行业数据', publisher: '行业来源', date: '2024-05-20',
      sourceType: '行业数据', pathType: 'cold-path',
      relatedSections: ['核心结论'],
      extractedSignals: ['行业趋势数据'],
    },
    {
      id: 'tg2', label: '结论汇总', publisher: 'Xing Research', date: '2024-05-20',
      sourceType: '研究总结', pathType: 'type-safe',
      relatedSections: ['研究结论'],
      extractedSignals: ['分析完成'],
    },
  ];
}

// ============================================================
// Individual report generators
// ============================================================

function generateTencentCloudReport(
  ctx: ResearchContext,
  resolution?: ConflictResolutionRecord,
): ResearchReport {
  const hasBoth = resolution?.selectedOption === 'both';
  const hasAdjusted = resolution?.selectedOption === 'adjusted';
  const hasOriginal = resolution?.selectedOption === 'original';
  const showResolution = resolution && (hasBoth || hasAdjusted || hasOriginal);

  const tags: string[] = ['增长拆解', '财务质量'];
  let resolutionCard: ResearchReport['resolutionCard'];

  if (showResolution && hasBoth) {
    tags.push('多口径保留');
    resolutionCard = {
      label: '保留两种口径并写入报告',
      description: '原始口径显示腾讯云核心云服务收入增长28.4%，扩展口径显示包含企业服务生态与AI云相关收入后的增长贡献约34.6%。本报告将同时保留两种口径，用于区分"财务披露增长"与"业务真实扩展"。',
    };
  } else if (showResolution && hasAdjusted) {
    tags.push('扩展口径');
    resolutionCard = {
      label: '采用扩展口径',
      description: '采用扩展口径（34.6% YoY），包含云服务+企业服务生态+AI云相关增量，更能反映腾讯云业务版图的真实扩展。',
    };
  } else if (showResolution && hasOriginal) {
    tags.push('原始口径');
    resolutionCard = {
      label: '采用原始口径',
      description: '采用原始口径（28.4% YoY），仅计入云基础设施与核心云服务收入，适用于严格财务口径对比。',
    };
  }

  return {
    title: '腾讯云增长逻辑研究报告',
    subtitle: '基于官方财报、电话会纪要、卖方研报与行业数据的多口径分析',
    tags,
    status: '已完成',
    symbolBadge: '00700.HK',
    resolutionCard,

    coreConclusion: '腾讯云增长不是单一由云基础设施收入驱动，而是由"核心云服务恢复+企业服务生态扩展+AI相关需求提升"共同构成。若按严格财务口径观察，增长约28.4%；若按扩展业务口径观察，增长贡献约34.6%。两种口径的差异说明腾讯云正在从单一云资源销售，逐步转向"云+SaaS+AI服务"的组合增长模式。',

    sections: [
      {
        id: 'sec-growth-breakdown',
        title: '增长来源拆解',
        content: '核心云服务方面，恢复性增长主要来自企业数字化预算回暖和大客户续约。企业服务生态方面，企业微信、腾讯会议、文档等协同产品提升客户粘性并带来增量收入。AI云需求方面，模型训练、推理服务和算力相关需求成为新增驱动。行业客户方面，金融、政企、医疗等行业云渗透率提升显著。',
        sourceNodeIds: ['t2', 't4'],
      },
      {
        id: 'sec-conflict-impact',
        title: '口径差异与影响',
        content: '原始口径更适合判断腾讯云财务披露中的确定性收入，但可能低估腾讯企业服务生态的协同增长。扩展口径更适合判断腾讯云业务版图的真实扩展，但需要警惕将非云业务收入过度计入云增长的风险。'
          + (hasBoth ? ' 本报告同时保留两种口径，以区分"严格财务披露增长"与"业务真实扩展"。' : ''),
        sourceNodeIds: ['t1', 't3'],
      },
      {
        id: 'sec-risks',
        title: '风险与反证',
        content: '如果企业IT预算恢复不及预期，云业务增长可能放缓。如果AI云需求短期难以转化为稳定收入，扩展口径可能高估增长弹性。如果行业竞争加剧，价格战可能压缩利润率。如果企业服务生态与云收入边界不清，增长质量需要进一步验证。',
        sourceNodeIds: ['t3', 't4'],
      },
    ],

    nextVerificationSteps: [
      '腾讯云收入增速是否连续两个季度改善',
      '企业微信/腾讯会议商业化数据',
      'AI云相关收入或客户案例披露',
      '云业务毛利率变化',
      '政企大客户续约情况',
      '行业云市场份额变化',
    ],

    finalConclusion: '腾讯云当前处于从"云资源销售"向"云+企业服务+AI基础设施"升级的阶段。短期看，增长弹性来自企业服务生态和AI需求；中期看，真正需要验证的是这些增长能否转化为高质量、可持续、可披露的云收入。',
  };
}

function generateTslaRiskReport(ctx: ResearchContext): ResearchReport {
  return {
    title: 'TSLA 风险深度研究报告',
    subtitle: '基于行情数据、新闻舆情、事件日历与市场情绪的短期风险分析',
    tags: ['风险识别', '事件驱动', '市场情绪'],
    status: '已完成',
    symbolBadge: 'TSLA',

    coreConclusion: '当前 TSLA 短期风险等级为"中"。主要风险来自交付预期、毛利率压力和市场情绪分歧，但能源业务与 FSD 进展仍提供一定估值支撑。',

    sections: [
      {
        id: 'sec-tsla-drivers',
        title: '关键驱动因素',
        content: 'Q2交付预期仍是短期价格波动核心。华尔街一致预期438K，Xing修正至425K-432K。市场对毛利率修复节奏存在分歧。能源业务和FSD进展提供一定情绪支撑，Megapack产能扩张持续推进，毛利率高于汽车业务。关键观察区间为173.8-179.2，该区间为机构筹码密集区。',
        sourceNodeIds: ['tt1', 'tt2'],
      },
      {
        id: 'sec-tsla-risks',
        title: '需关注风险',
        content: '价格战继续压缩利润率，若Q2实际交付低于420K短期将面临较大抛压。自动驾驶监管和落地节奏存在不确定性。高估值环境下风险偏好回落可能抑制成长股估值。中国新能源车企价格战加剧可能影响特斯拉市场份额。市场情绪分歧较大，短期波动率偏高。',
        sourceNodeIds: ['tt2'],
      },
    ],

    nextVerificationSteps: [
      '跟踪下一次交付数据（Q2交付公告）',
      '关注毛利率改善信号',
      '观察关键区间跌破后的成交量变化',
      '评估FSD中国落地时间表对估值的影响',
      '监控市场情绪和做空比例变化',
    ],

    finalConclusion: '短期风险可控但需密切关注Q2交付数据。能源业务和FSD进展提供中长期估值支撑，但当前价位处于机构筹码密集区，建议观察关键区间表现后再做判断。风险等级维持"中"，置信度72%，研究范围覆盖未来30天。',
  };
}

// ── Follow-up report generators ──

function generateTslaMarginReport(ctx: ResearchContext): ResearchReport {
  return {
    title: 'TSLA 毛利率风险补充分析',
    subtitle: '针对毛利率压力、成本结构与价格战影响的深度分析',
    tags: ['毛利率', '成本分析', '价格战'],
    status: '已完成',
    symbolBadge: 'TSLA',

    coreConclusion: 'TSLA 毛利率修复节奏慢于市场预期。核心压力来自三方面：持续的全球降价策略、原材料成本下降幅度有限、以及产能爬坡期固定成本摊薄不足。当前汽车毛利率（不含碳积分）约15.6%，同比下降约320bps。',

    sections: [
      {
        id: 'sec-margin-pressure',
        title: '毛利率压力来源',
        content: '价格端：全球降价策略使ASP同比下降约8%，中国市场降价幅度最大。成本端：电池级碳酸锂价格虽回落但降幅放缓，4680电池产能爬坡增加短期成本。结构端：Model 3/Y占比提升拉低整体毛利率，高毛利车型S/X交付量持续萎缩。',
        sourceNodeIds: ['tt1', 'tt2'],
      },
      {
        id: 'sec-margin-outlook',
        title: '毛利率修复路径',
        content: '短期修复需关注三点：Q2降价节奏是否放缓、4680电池成本改善进度、以及能源业务毛利率对整体毛利的支撑。若Q2汽车毛利率回升至17%以上，市场情绪将显著改善；若继续下滑至14%以下，估值压力将进一步加大。',
        sourceNodeIds: ['tt1', 'tt3'],
      },
    ],

    nextVerificationSteps: [
      '跟踪Q2财报汽车毛利率数据',
      '关注4680电池产能爬坡进度',
      '对比竞品（BYD、蔚来）的毛利率变化',
      '评估碳积分收入对毛利的贡献变化',
    ],

    finalConclusion: '毛利率是TSLA短期最核心的风险指标。若能稳定在16%-17%区间，市场给予的估值溢价仍有支撑；若跌破14%，将触发新一轮估值重估。建议重点关注Q2财报中毛利率指引。',
  };
}

function generateTslaDeliveryReport(ctx: ResearchContext): ResearchReport {
  return {
    title: 'TSLA 交付数据补充分析',
    subtitle: '聚焦Q2交付预期的风险因素与市场分歧',
    tags: ['交付数据', '供需分析', '市场分歧'],
    status: '已完成',
    symbolBadge: 'TSLA',

    coreConclusion: 'Q2交付预期存在显著市场分歧。华尔街一致预期438K偏乐观，Xing修正至425K-432K。中国市场需求波动和欧洲补贴退坡是主要下行风险源。',

    sections: [
      {
        id: 'sec-delivery-drivers',
        title: '交付驱动因素',
        content: '中国市场：特斯拉中国5月销量环比改善但同比仍有压力，价格战环境下消费者观望情绪浓厚。欧洲市场：部分国家补贴退坡影响订单，德国市场需求有所放缓。美国市场：Model 3 Highland改款接受度良好，但Cybertruck产能爬坡仍需时间。',
        sourceNodeIds: ['tt1', 'tt3'],
      },
      {
        id: 'sec-delivery-scenarios',
        title: '交付情景分析',
        content: '乐观情景（450K+）：中美需求共振，Q2交付超预期，股价有望突破当前区间。基准情景（425K-438K）：与市场预期一致，价格维持区间震荡。悲观情景（<420K）：交付明显低于预期，短期股价承压，但能源业务提供下行保护。',
        sourceNodeIds: ['tt2', 'tt3'],
      },
    ],

    nextVerificationSteps: [
      '跟踪每周中国特斯拉上险量数据',
      '关注欧洲主要市场月度注册数据',
      '评估6月中旬交付公告前的市场定价',
    ],

    finalConclusion: '交付数据是Q2最重要的验证点。建议在交付公告前保持对每周高频数据的跟踪，结合市场情绪变化动态调整风险判断。',
  };
}

function generateFollowUpReport(ctx: ResearchContext): ResearchReport {
  const subject = ctx.subject;
  return {
    title: `${subject.symbol || subject.name} 补充分析`,
    subtitle: `针对"${ctx.followUpPrompt || '补充问题'}"的深度分析`,
    tags: ['补充分析', '深度研究'],
    status: '已完成',
    symbolBadge: subject.symbol,

    coreConclusion: `围绕"${ctx.followUpPrompt || '用户追问'}"对${subject.name}进行了补充分析。基于现有研究框架和数据源，提供针对性结论。`,

    sections: [
      {
        id: 'sec-followup-analysis',
        title: '补充分析结果',
        content: `针对"${ctx.followUpPrompt}"的分析显示，该因素对${subject.name}的影响值得关注。建议将此分析结果纳入整体研究框架，并结合其他维度进行综合判断。`,
        sourceNodeIds: ['tt1', 'tt2'],
      },
    ],

    nextVerificationSteps: [
      '持续跟踪相关数据',
      '根据新信息调整分析结论',
    ],

    finalConclusion: `"${ctx.followUpPrompt}"的补充分析已完成，建议将此结论与主报告结合阅读，以获得更完整的风险判断。`,
  };
}

function generateSemiconductorReport(ctx: ResearchContext): ResearchReport {
  return {
    title: '半导体行业研究流运行结果',
    subtitle: '基于AI算力需求、先进制程产能与库存周期的综合分析',
    tags: ['产业链拆解', '供需跟踪'],
    status: '已完成',

    coreConclusion: '当前半导体景气度偏乐观，主要由AI算力需求和先进制程产能利用率提升驱动。但库存周期和非AI需求恢复仍是关键风险，需持续跟踪下游需求信号。',

    sections: [
      {
        id: 'sec-semi-demand',
        title: '需求驱动分析',
        content: 'AI算力需求持续强劲，GPU和HBM供不应求。先进制程产能利用率处于高位，台积电3nm/5nm产线满载。数据中心资本开支维持增长，推动相关芯片需求。但消费电子和工业芯片需求恢复节奏偏慢。',
        sourceNodeIds: ['tg1'],
      },
      {
        id: 'sec-semi-risks',
        title: '风险因素',
        content: '库存周期拐点判断存在分歧，模拟芯片和存储芯片库存水平仍需消化。非AI需求恢复不及预期可能拖累整体行业复苏。中美科技摩擦可能影响供应链稳定性。产能扩张节奏与需求匹配存在不确定性。',
        sourceNodeIds: ['tg1'],
      },
    ],

    nextVerificationSteps: [
      '跟踪台积电季度产能利用率数据',
      '关注主要芯片厂商库存周转天数变化',
      '监控AI芯片出货量与订单数据',
      '观察消费电子需求恢复信号',
    ],

    finalConclusion: '半导体行业处于结构性增长与周期波动的双重影响下。AI相关赛道确定性较高，但需警惕库存周期和非AI需求的潜在风险。建议保持跟踪并关注产能利用率、库存水平和下游需求三大核心指标。',
  };
}

function generateGenericReport(ctx: ResearchContext): ResearchReport {
  const name = ctx.subject.name;
  return {
    title: `${name}研究报告`,
    subtitle: '基于多源数据的综合分析',
    tags: ['研究分析'],
    status: '已完成',

    coreConclusion: `围绕"${ctx.originalPrompt}"进行了多维度分析。研究覆盖了增长驱动、风险识别和竞争格局等关键维度。`,

    sections: [
      {
        id: 'sec-generic',
        title: '分析结果',
        content: `针对"${ctx.originalPrompt}"的研究已生成初步结论。如需更详细的分析，可以进入Research Studio自定义研究流，或调整分析框架和数据源后重新执行研究。`,
        sourceNodeIds: ['tg2'],
      },
    ],

    nextVerificationSteps: [
      '持续跟踪相关数据和事件',
      '根据新信息调整分析框架',
    ],

    finalConclusion: `"${ctx.originalPrompt}"的初步研究已完成，建议持续跟踪关键指标变化。`,
  };
}

// ============================================================
// Context-aware data sources for Research Running
// ============================================================

export function getContextDataSources(ctx: ResearchContext): Array<{
  id: string;
  title: string;
  publisher: string;
  sourceType: string;
  category: 'official' | 'sellside' | 'supplementary';
}> {
  const name = ctx.subject.name;

  if (name.includes('腾讯云') || (name.includes('Tencent') && name.includes('Cloud')) || ctx.originalPrompt.includes('腾讯云')) {
    return [
      { id: 'ds-t1', title: '腾讯控股2024Q1财报', publisher: '腾讯控股', sourceType: '财报', category: 'official' },
      { id: 'ds-t2', title: '腾讯控股2024Q1电话会纪要', publisher: '腾讯控股IR', sourceType: '电话会纪要', category: 'official' },
      { id: 'ds-t3', title: '腾讯控股官方公告', publisher: '披露易', sourceType: '官方公告', category: 'official' },
      { id: 'ds-t4', title: '腾讯云官网产品更新', publisher: '腾讯云', sourceType: '官方渠道', category: 'official' },
      { id: 'ds-t5', title: 'Goldman Sachs腾讯研报', publisher: 'Goldman Sachs', sourceType: '卖方研报', category: 'sellside' },
      { id: 'ds-t6', title: 'Morgan Stanley腾讯研报', publisher: 'Morgan Stanley', sourceType: '卖方研报', category: 'sellside' },
      { id: 'ds-t7', title: '中金公司腾讯云业务点评', publisher: '中金公司', sourceType: '卖方研报', category: 'sellside' },
      { id: 'ds-t8', title: 'JPM Tencent Report', publisher: 'J.P. Morgan', sourceType: '卖方研报', category: 'sellside' },
      { id: 'ds-t9', title: '中国公有云市场跟踪报告', publisher: 'IDC', sourceType: '行业数据', category: 'supplementary' },
      { id: 'ds-t10', title: '信通院云计算白皮书', publisher: '中国信通院', sourceType: '行业数据', category: 'supplementary' },
      { id: 'ds-t11', title: '行业新闻摘要', publisher: '综合来源', sourceType: '新闻舆情', category: 'supplementary' },
    ];
  }

  if (ctx.subject.symbol === 'TSLA') {
    return [
      { id: 'ds-ts1', title: 'TSLA Q2交付跟踪', publisher: 'Bloomberg', sourceType: '行情数据', category: 'official' },
      { id: 'ds-ts2', title: 'SEC Filing', publisher: 'sec.gov', sourceType: '官方公告', category: 'official' },
      { id: 'ds-ts3', title: 'Tesla IR Updates', publisher: 'ir.tesla.com', sourceType: '官方渠道', category: 'official' },
      { id: 'ds-ts4', title: 'Morgan Stanley TSLA Note', publisher: 'Morgan Stanley', sourceType: '卖方研报', category: 'sellside' },
      { id: 'ds-ts5', title: '新闻舆情摘要', publisher: 'Reuters', sourceType: '新闻舆情', category: 'supplementary' },
      { id: 'ds-ts6', title: '事件日历', publisher: 'Xing Research', sourceType: '事件追踪', category: 'supplementary' },
    ];
  }

  return [
    { id: 'ds-g1', title: '行业数据', publisher: '行业来源', sourceType: '行业数据', category: 'official' },
    { id: 'ds-g2', title: '新闻舆情', publisher: '公开信息', sourceType: '新闻舆情', category: 'supplementary' },
    { id: 'ds-g3', title: '公开报告', publisher: '公开来源', sourceType: '研究报告', category: 'sellside' },
  ];
}

export function getContextResearchSkeleton(ctx: ResearchContext): Array<{ label: string }> {
  const name = ctx.subject.name;

  if (name.includes('腾讯云') || (name.includes('Tencent') && name.includes('Cloud')) || ctx.originalPrompt.includes('腾讯云')) {
    return [
      { label: '收入增长来源' },
      { label: '客户结构变化' },
      { label: '产品矩阵扩展' },
      { label: '价格与毛利率' },
      { label: '行业竞争' },
      { label: '增长可持续性' },
      { label: '风险边界' },
      { label: '结论生成' },
    ];
  }

  if (ctx.subject.symbol === 'TSLA') {
    return [
      { label: '价格波动' },
      { label: '交付预期' },
      { label: '毛利率变化' },
      { label: '市场情绪' },
      { label: '事件风险' },
      { label: '技术区间' },
      { label: '风险等级' },
      { label: '结论生成' },
    ];
  }

  return [
    { label: '增长驱动' },
    { label: '风险识别' },
    { label: '竞争格局' },
    { label: '结论生成' },
  ];
}