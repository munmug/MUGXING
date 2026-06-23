import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';
import type { ResearchNode } from '@/lib/types';
import { tr } from '@/lib/lang';

interface ResearchNodeCardProps {
  node: ResearchNode;
  selected: boolean;
  onClick: () => void;
  onEdit: () => void;
}

const typeStyles: Record<string, string> = {
  target: 'border-xing-border-active/50',
  data: 'border-xing-border-hover',
  audit: 'border-xing-yellow/20',
  output: 'border-xing-green/20',
};

const typeLabels: Record<string, string> = {
  target: '目标',
  data: '数据',
  audit: '审计',
  output: '输出',
};

export default function ResearchNodeCard({ node, selected, onClick, onEdit }: ResearchNodeCardProps) {
  return (
    <motion.div
      className={`absolute w-[240px] rounded-xl border transition-all cursor-pointer ${
        selected
          ? 'border-xing-border-active bg-xing-card-active shadow-[0_0_24px_rgba(222,255,154,0.08)] z-20'
          : `${typeStyles[node.type]} bg-xing-panel/90 hover:border-xing-border-hover z-10`
      }`}
      style={{ left: node.x, top: node.y }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      onClick={onClick}
    >
      {/* Header */}
      <div className="p-3 pb-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[12px] font-medium text-xing-text truncate">{node.label}</span>
          <span className="text-[9px] text-xing-text-2/40 font-mono">{typeLabels[node.type]}</span>
        </div>
        <p className="text-[10px] text-xing-text-3 leading-relaxed">{node.description}</p>
      </div>

      {/* Fields */}
      <div className="px-3 pb-2 flex flex-col gap-1">
        {node.fields.map((f, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-[10px] text-xing-text-disabled">{f.key}</span>
            <div className="flex items-center gap-1">
              <span className={`text-[10px] font-mono ${f.editable ? 'text-xing-green/80' : 'text-xing-text-2/70'}`}>
                {f.value}
              </span>
              {f.editable && <Settings size={9} className="text-xing-green/40" />}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-xing-border-subtle flex items-center justify-between">
        {node.edited ? (
          <span className="px-1.5 py-0.5 rounded bg-xing-green/8 border border-xing-green/15 text-[9px] text-xing-green/80 font-mono">{tr('已微调')}</span>
        ) : (
          <span />
        )}
        {selected && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="px-2 py-1 rounded-md bg-xing-green/15 text-xing-green text-[10px] hover:bg-xing-green/20 transition-colors cursor-pointer whitespace-nowrap"
          >
            编辑参数
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}