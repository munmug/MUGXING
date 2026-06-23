import type { IntentType, IntentResult, SubjectType, AnalysisFramework, DataSourceType } from './types';

const QUICK_KEYWORDS = [
  'TSLA', 'tsla', 'Tesla', 'tesla', '特斯拉',
  'NVDA', 'nvda', '英伟达', '苹果', 'AAPL', 'aapl',
  '还能买吗', '风险', '止损', '危险吗', '回撤', '暴跌',
  '波动', '安全垫',
];

const GUIDED_KEYWORDS = [
  '拆解', '研究', '分析', '框架', '财报', '增长逻辑',
  '腾讯云', '收入', '利润', '竞争', '估值', '行业',
  '数据源', '报告', '深度研究', '腾讯', '00700',
  'TSM', 'tsm', '预期差', '多因子', '研报',
  '官方公告', '披露', '比对', '高盛', '口径', '审计',
];

const STUDIO_KEYWORDS = [
  'Studio', 'studio', '研究流', '工作流', '搭建',
  '节点', '自动化', '配置', '流程', '模块',
  '自定义', '画布',
];

export function intentRouter(input: string): IntentType {
  if (!input || !input.trim()) return 'unknown';

  const hasStudio = STUDIO_KEYWORDS.some((k) => input.includes(k));
  const hasGuided = GUIDED_KEYWORDS.some((k) => input.includes(k));
  const hasQuick = QUICK_KEYWORDS.some((k) => input.includes(k));

  if (hasStudio) return 'studio';
  if (hasGuided) return 'guided';
  if (hasQuick) return 'quick';
  return 'unknown';
}

export function detectSymbol(input: string): string | null {
  if (input.includes('TSLA') || input.includes('tsla') || input.includes('Tesla') || input.includes('特斯拉')) return 'TSLA';
  if (input.includes('NVDA') || input.includes('nvda') || input.includes('英伟达')) return 'NVDA';
  if (input.includes('AAPL') || input.includes('aapl') || input.includes('苹果')) return 'AAPL';
  if (input.includes('腾讯') || input.includes('00700')) return '00700.HK';
  if (input.includes('TSM') || input.includes('tsm')) return 'TSM';
  return null;
}

export function getRecommendation(input: string): IntentType {
  const intent = intentRouter(input);
  if (intent !== 'unknown') return intent;
  if (input.length > 6 && /[\u4e00-\u9fff]/.test(input)) return 'guided';
  if (input.length <= 6 && input.trim().match(/^[A-Za-z]+$/)) return 'quick';
  return 'unknown';
}

// ============================================================
// Enhanced Intent Router — returns full IntentResult with subject recognition
// ============================================================

export function intentRouterEnhanced(input: string): IntentResult {
  const baseIntent = intentRouter(input);

  if (!input || !input.trim()) {
    return {
      intentType: 'unknown',
      subject: { type: 'theme', name: '未知' },
      researchQuestion: input,
      suggestedFrameworks: [],
      suggestedSources: [],
      suggestedFocus: '',
    };
  }

  // ─── Scenario A: Tencent Cloud ───────────────────────────
  if (input.includes('腾讯云') || (input.includes('腾讯') && input.includes('云'))) {
    return {
      intentType: baseIntent === 'unknown' ? 'guided' : baseIntent,
      subject: {
        type: 'company',
        name: '腾讯云',
        symbol: '00700.HK',
        market: 'HK',
        aliases: ['腾讯控股', 'Tencent Cloud', '00700.HK'],
      },
      researchQuestion: input,
      suggestedFrameworks: ['growth-breakdown', 'financial-quality', 'competitive-landscape', 'risk-audit'],
      suggestedSources: ['official-filing', 'earnings', 'call-transcript', 'sellside-report', 'industry-data'],
      suggestedFocus: '识别腾讯云增长的核心驱动、口径差异和可持续性',
    };
  }

  if (input.includes('腾讯') || input.includes('00700')) {
    return {
      intentType: baseIntent === 'unknown' ? 'guided' : baseIntent,
      subject: {
        type: 'company',
        name: '腾讯控股',
        symbol: '00700.HK',
        market: 'HK',
        aliases: ['腾讯', 'Tencent', '00700.HK'],
      },
      researchQuestion: input,
      suggestedFrameworks: ['growth-breakdown', 'financial-quality', 'competitive-landscape'],
      suggestedSources: ['official-filing', 'earnings', 'call-transcript', 'sellside-report', 'industry-data'],
      suggestedFocus: '识别腾讯核心业务增长驱动与风险',
    };
  }

  // ─── Scenario B: TSLA ────────────────────────────────────
  if (input.includes('TSLA') || input.includes('tsla') || input.includes('Tesla') || input.includes('特斯拉')) {
    return {
      intentType: baseIntent === 'unknown' ? 'quick' : baseIntent,
      subject: {
        type: 'stock',
        symbol: 'TSLA',
        name: 'Tesla',
        market: 'US',
        aliases: ['Tesla, Inc.', '特斯拉'],
      },
      researchQuestion: input,
      suggestedFrameworks: ['risk-audit', 'growth-breakdown'],
      suggestedSources: ['earnings', 'news-sentiment', 'official-filing'],
      suggestedFocus: '识别短期波动风险、关键价格区间和事件触发点',
    };
  }

  // ─── Scenario C: NVDA ────────────────────────────────────
  if (input.includes('NVDA') || input.includes('nvda') || input.includes('英伟达')) {
    return {
      intentType: baseIntent === 'unknown' ? 'quick' : baseIntent,
      subject: {
        type: 'stock',
        symbol: 'NVDA',
        name: 'NVIDIA',
        market: 'US',
        aliases: ['NVIDIA Corp.', '英伟达'],
      },
      researchQuestion: input,
      suggestedFrameworks: ['growth-breakdown', 'financial-quality', 'risk-audit'],
      suggestedSources: ['earnings', 'call-transcript', 'sellside-report', 'news-sentiment'],
      suggestedFocus: '识别AI芯片需求持续性与估值合理性',
    };
  }

  // ─── Scenario D: AAPL ────────────────────────────────────
  if (input.includes('AAPL') || input.includes('aapl') || input.includes('苹果')) {
    return {
      intentType: baseIntent === 'unknown' ? 'quick' : baseIntent,
      subject: {
        type: 'stock',
        symbol: 'AAPL',
        name: 'Apple',
        market: 'US',
        aliases: ['Apple Inc.', '苹果'],
      },
      researchQuestion: input,
      suggestedFrameworks: ['growth-breakdown', 'competitive-landscape', 'risk-audit'],
      suggestedSources: ['earnings', 'call-transcript', 'sellside-report', 'news-sentiment'],
      suggestedFocus: '分析产品周期、服务收入增长与市场份额变化',
    };
  }

  // ─── Scenario E: TSM ────────────────────────────────────
  if (input.includes('TSM') || input.includes('tsm')) {
    return {
      intentType: baseIntent === 'unknown' ? 'guided' : baseIntent,
      subject: {
        type: 'stock',
        symbol: 'TSM',
        name: '台积电',
        market: 'US',
        aliases: ['Taiwan Semiconductor', 'TSMC'],
      },
      researchQuestion: input,
      suggestedFrameworks: ['growth-breakdown', 'financial-quality', 'competitive-landscape'],
      suggestedSources: ['earnings', 'call-transcript', 'sellside-report', 'industry-data'],
      suggestedFocus: '先进制程产能利用率和AI芯片需求趋势',
    };
  }

  // ─── Scenario F: Semiconductor ───────────────────────────
  if (input.includes('半导体')) {
    return {
      intentType: baseIntent === 'unknown' ? 'studio' : baseIntent,
      subject: {
        type: 'sector',
        name: '半导体',
        market: 'global',
        aliases: ['芯片', 'semiconductor'],
      },
      researchQuestion: input,
      suggestedFrameworks: ['growth-breakdown', 'competitive-landscape', 'risk-audit'],
      suggestedSources: ['earnings', 'industry-data', 'news-sentiment'],
      suggestedFocus: '验证半导体行业增长是否由AI算力需求、先进制程产能和库存周期共同驱动',
    };
  }

  // ─── Fallback: unknown ───────────────────────────────────
  if (baseIntent === 'unknown') {
    return {
      intentType: 'unknown',
      subject: { type: 'theme', name: input.slice(0, 30) },
      researchQuestion: input,
      suggestedFrameworks: ['growth-breakdown'],
      suggestedSources: ['news-sentiment'],
      suggestedFocus: '',
    };
  }

  // ─── Fallback: known intent but unrecognized subject ────
  return {
    intentType: baseIntent,
    subject: { type: 'theme', name: input.slice(0, 30) },
    researchQuestion: input,
    suggestedFrameworks: (baseIntent === 'quick')
      ? (['risk-audit'] as AnalysisFramework[])
      : (['growth-breakdown', 'financial-quality', 'competitive-landscape', 'risk-audit'] as AnalysisFramework[]),
    suggestedSources: (baseIntent === 'quick')
      ? (['earnings', 'news-sentiment'] as DataSourceType[])
      : (['official-filing', 'earnings', 'call-transcript', 'sellside-report', 'industry-data'] as DataSourceType[]),
    suggestedFocus: '围绕研究问题进行全面分析',
  };
}