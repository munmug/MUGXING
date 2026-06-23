import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Save } from 'lucide-react';
import StatusBadge from '@/components/common/StatusBadge';
import SourceCard from '@/components/common/SourceCard';
import { dataSourceSettings } from '@/data/mockSources';

interface DataSourceSettingsProps {
  onBack: () => void;
  showToast: (msg: string) => void;
}

export default function DataSourceSettings({ onBack, showToast }: DataSourceSettingsProps) {
  const [sources, setSources] = useState(dataSourceSettings);

  const toggleSource = (id: string) => {
    setSources((prev) => prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)));
  };

  const handleSave = () => {
    showToast('数据源设置已保存');
  };

  const statusTypeMap: Record<string, 'success' | 'error' | 'info'> = {
    available: 'success',
    unconfigured: 'info',
    error: 'error',
  };

  const statusLabelMap: Record<string, string> = {
    available: '可用',
    unconfigured: '未配置',
    error: '异常',
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-[800px] mx-auto p-8"
      >
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="text-xing-text-disabled hover:text-xing-text-2 transition-colors cursor-pointer">
            <ChevronLeft size={18} />
          </button>
          <span className="text-xs text-xing-text-disabled font-mono">Data Source Settings</span>
        </div>

        <div className="flex flex-col gap-4">
          {sources.map((src) => (
            <SourceCard
              key={src.id}
              id={src.id}
              name={src.name}
              domain={src.category}
              status="fetched"
              progress={100}
              count={src.updatedAt}
              onToggle={toggleSource}
              enabled={src.enabled}
            />
          ))}
        </div>

        <div className="mt-8 flex justify-center border-t border-xing-border-subtle pt-6">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-xing-green text-[#10120A] text-sm font-semibold hover:bg-xing-green-2 transition-all cursor-pointer whitespace-nowrap active:scale-[0.97]"
          >
            <Save size={14} />
            保存数据源设置
          </button>
        </div>
      </motion.div>
    </div>
  );
}