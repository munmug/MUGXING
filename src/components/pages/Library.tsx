import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Search, Eye, Edit3, Trash2 } from 'lucide-react';
import StatusBadge from '@/components/common/StatusBadge';
import { tr } from '@/lib/lang';

interface LibraryProps {
  onBack: () => void;
  onViewReport: (id: string) => void;
  onEditInStudio: (id: string) => void;
  onDelete: (id: string) => void;
  showToast: (msg: string) => void;
  items: import('@/lib/types').LibraryItem[];
}

export default function Library({ onBack, onViewReport, onEditInStudio, onDelete, showToast, items }: LibraryProps) {
  const [search, setSearch] = useState('');

  const filtered = items.filter((item) =>
    !search || item.title.includes(search) || item.symbol.includes(search)
  );

  const handleDelete = (id: string) => {
    onDelete(id);
  };

  const statusTypeMap: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
    completed: 'success',
    draft: 'warning',
    running: 'info',
    error: 'error',
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-[900px] mx-auto p-8"
      >
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="text-xing-text-disabled hover:text-xing-text-2 transition-colors cursor-pointer">
            <ChevronLeft size={18} />
          </button>
          <span className="text-xs text-xing-text-disabled font-mono">Research Library</span>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-xing-text-disabled/60" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tr('搜索研究报告...')}
            className="w-full bg-xing-card border border-xing-border rounded-lg pl-9 pr-4 py-2.5 text-[13px] text-xing-text placeholder:text-xing-text-disabled outline-none focus:border-xing-border-active transition-colors"
          />
        </div>

        {/* Table */}
        <div className="rounded-xl border border-xing-border overflow-hidden">
          <div className="grid grid-cols-[1fr_100px_120px_100px_100px_100px] gap-4 px-4 py-2.5 bg-xing-card border-b border-xing-border-subtle text-[10px] text-xing-text-disabled font-mono">
            <span>{tr('标题')}</span>
            <span>{tr('标的')}</span>
            <span>{tr('类型')}</span>
            <span>{tr('创建时间')}</span>
            <span>{tr('状态')}</span>
            <span>{tr('操作')}</span>
          </div>

          {filtered.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-[1fr_100px_120px_100px_100px_100px] gap-4 px-4 py-3 border-b border-xing-border-subtle hover:bg-xing-card/50 transition-colors items-center"
            >
              <span className="text-[13px] text-xing-text truncate font-medium">{item.title}</span>
              <span className="text-[12px] text-xing-text-2 font-mono">{item.symbol}</span>
              <span className="text-[12px] text-xing-text-2/60">{item.type}</span>
              <span className="text-[11px] text-xing-text-disabled font-mono">{item.createdAt}</span>
              <span><StatusBadge status={item.status === 'completed' ? '已完成' : item.status === 'draft' ? '草稿' : item.status === 'running' ? '运行中' : '异常'} type={statusTypeMap[item.status]} /></span>
              <span className="flex items-center gap-2">
                <button onClick={() => onViewReport(item.id)} className="w-7 h-7 flex items-center justify-center rounded-md text-xing-text-disabled hover:text-xing-green hover:bg-xing-green/5 transition-colors cursor-pointer" title={tr('查看')}>
                  <Eye size={13} />
                </button>
                <button onClick={() => onEditInStudio(item.id)} className="w-7 h-7 flex items-center justify-center rounded-md text-xing-text-disabled hover:text-xing-text-2 hover:bg-xing-card transition-colors cursor-pointer" title={tr('编辑')}>
                  <Edit3 size={12} />
                </button>
                <button onClick={() => handleDelete(item.id)} className="w-7 h-7 flex items-center justify-center rounded-md text-xing-text-disabled/60 hover:text-xing-red hover:bg-xing-red/5 transition-colors cursor-pointer" title={tr('删除')}>
                  <Trash2 size={12} />
                </button>
              </span>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="px-4 py-10 text-center text-[13px] text-xing-text-disabled">{tr('没有找到匹配的研究记录')}</div>
          )}
        </div>
      </motion.div>
    </div>
  );
}