import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';
import type { ResearchNode } from '@/lib/types';
import { tr } from '@/lib/lang';

interface NodeParameterPanelProps {
  node: ResearchNode | null;
  onClose: () => void;
  onSave: (nodeId: string, fields: { key: string; value: string }[]) => void;
}

export default function NodeParameterPanel({ node, onClose, onSave }: NodeParameterPanelProps) {
  if (!node) return null;

  return (
    <AnimatePresence>
      <motion.div
        key={node.id}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 30 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-[320px] shrink-0 border-l border-xing-border-subtle bg-xing-panel overflow-y-auto"
      >
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-[10px] text-xing-text-disabled font-mono mb-1">{tr('节点参数')}</div>
              <div className="text-sm font-semibold text-xing-text">{tr(node.label)}</div>
            </div>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-md text-xing-text-disabled hover:text-xing-text-2 hover:bg-xing-card transition-colors cursor-pointer">
              <X size={14} />
            </button>
          </div>

          {/* Description */}
          <div className="p-3 rounded-lg bg-xing-card border border-xing-border mb-5">
            <div className="text-[10px] text-xing-text-disabled mb-1">{tr('描述')}</div>
            <div className="text-[12px] text-xing-text-2/70">{tr(node.description)}</div>
          </div>

          {/* Fields */}
          <div className="flex flex-col gap-4 mb-6">
            {node.fields.map((f, i) => (
              <div key={i}>
                <div className="text-[10px] text-xing-text-disabled mb-1.5">{f.key}</div>
                {f.editable ? (
                  <input
                    type="text"
                    defaultValue={f.value}
                    className="w-full bg-xing-card border border-xing-border rounded-lg px-3 py-2 text-[13px] text-xing-text outline-none focus:border-xing-border-active transition-colors"
                  />
                ) : (
                  <div className="px-3 py-2 rounded-lg bg-xing-card/50 border border-xing-border-subtle text-[13px] text-xing-text-2 font-mono">
                    {tr(f.value)}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Type badge */}
          <div className="mb-5">
            <div className="text-[10px] text-xing-text-disabled mb-1.5">{tr('节点类型')}</div>
            <span className={`px-2 py-1 rounded-md text-[10px] font-mono ${
              node.type === 'target' ? 'bg-xing-green/10 text-xing-green border border-xing-green/20' :
              node.type === 'data' ? 'bg-xing-card text-xing-text-2 border border-xing-border' :
              node.type === 'audit' ? 'bg-xing-yellow/10 text-xing-yellow border border-xing-yellow/20' :
              'bg-xing-green/10 text-xing-green border border-xing-green/20'
            }`}>
              {node.type.toUpperCase()}
            </span>
          </div>

          {/* Save button */}
          <button
            onClick={() => {
              onSave(node.id, node.fields);
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-xing-green text-[#10120A] text-[13px] font-semibold hover:bg-xing-green-2 transition-all cursor-pointer active:scale-[0.97]"
          >
            <Save size={14} />
            {tr('保存参数')}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}