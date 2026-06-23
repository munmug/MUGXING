import type { DataSourceSetting, LibraryItem } from '@/lib/types';

export const dataSourceSettings: DataSourceSetting[] = [
  { id: 'src-1', name: '官方公告', category: '官方渠道', status: 'available', updatedAt: '2024-05-20 14:30', scope: '全部研究', enabled: true },
  { id: 'src-2', name: '财报', category: '官方渠道', status: 'available', updatedAt: '2024-05-19 09:15', scope: '全部研究', enabled: true },
  { id: 'src-3', name: '电话会纪要', category: '官方渠道', status: 'available', updatedAt: '2024-05-18 16:45', scope: '专业研究', enabled: true },
  { id: 'src-4', name: '卖方研报', category: '第三方分析', status: 'available', updatedAt: '2024-05-20 08:00', scope: '专业研究', enabled: true },
  { id: 'src-5', name: '行业数据', category: '第三方数据', status: 'unconfigured', updatedAt: '—', scope: '专业研究', enabled: false },
  { id: 'src-6', name: '新闻舆情', category: '公开信息', status: 'available', updatedAt: '2024-05-20 15:00', scope: '全部研究', enabled: true },
  { id: 'src-7', name: '用户上传文件', category: '自定义', status: 'unconfigured', updatedAt: '—', scope: '自定义', enabled: false },
];

export const libraryItems: LibraryItem[] = [
  { id: 'lib-1', title: '腾讯云增长逻辑研究', symbol: '00700.HK', type: '引导研究', createdAt: '2024-05-20 10:30', updatedAt: '2024-05-20 15:45', status: 'completed' },
  { id: 'lib-2', title: 'TSLA 快速风险扫描', symbol: 'TSLA', type: '快速分析', createdAt: '2024-05-19 14:20', updatedAt: '2024-05-19 14:22', status: 'completed' },
  { id: 'lib-3', title: 'NVDA 财报预期差分析', symbol: 'NVDA', type: '引导研究', createdAt: '2024-05-18 09:15', updatedAt: '2024-05-18 11:30', status: 'draft' },
  { id: 'lib-4', title: '半导体产业链研究流', symbol: 'SOX', type: '研究流', createdAt: '2024-05-17 16:00', updatedAt: '2024-05-18 10:00', status: 'running' },
  { id: 'lib-5', title: '苹果供应链风险评估', symbol: 'AAPL', type: '引导研究', createdAt: '2024-05-16 11:00', updatedAt: '2024-05-16 13:45', status: 'completed' },
  { id: 'lib-6', title: '新能源行业趋势研究', symbol: 'NIO', type: '引导研究', createdAt: '2024-05-15 08:30', updatedAt: '2024-05-15 10:00', status: 'error' },
];