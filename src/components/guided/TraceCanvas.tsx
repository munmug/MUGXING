import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, ChevronDown, Link2 } from 'lucide-react';
import type { TraceNodeWithSections } from '@/lib/types';
import { tr } from '@/lib/lang';

interface TraceCanvasProps {
  nodes: TraceNodeWithSections[];
  onNodeClick: (nodeId: string) => void;
  activeNode: string | null;
  onNodeHover: (nodeId: string | null) => void;
}

export default function TraceCanvas({ nodes, onNodeClick, activeNode, onNodeHover }: TraceCanvasProps) {
  const [expandedNode, setExpandedNode] = useState<string | null>(null);

  if (!nodes || nodes.length === 0) {
    return (
      <div className="w-[320px] shrink-0 border-l border-background-200/70 bg-background-50 overflow-y-auto sticky top-0 h-screen">
        <div className="p-4">
          <div className="text-[10px] text-foreground-400 font-mono mb-3">{tr('来源追踪')}</div>
          <div className="text-[11px] text-foreground-500">{tr('暂无来源节点')}</div>
        </div>
      </div>
    );
  }

  const pathColors: Record<string, string> = {
    'cold-path': 'bg-accent-500/10 text-accent-600',
    'type-safe': 'bg-accent-500/15 text-accent-600',
    'hot-path': 'bg-amber-500/10 text-amber-600',
  };

  const pathBorderColors: Record<string, string> = {
    'cold-path': 'border-accent-500/30',
    'type-safe': 'border-accent-500/50',
    'hot-path': 'border-amber-500/30',
  };

  return (
    <div className="w-[320px] shrink-0 border-l border-background-200/70 bg-background-50 overflow-y-auto sticky top-0 h-screen">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] text-foreground-400 font-mono">{tr('来源追踪')}</span>
          <span className="text-[9px] text-foreground-400 font-mono">{nodes.length} 个节点</span>
        </div>
        <div className="flex flex-col gap-1.5">
          {nodes.map((node, i) => {
            const isActive = activeNode === node.id;
            const isExpanded = expandedNode === node.id;

            return (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.06 * i, duration: 0.3 }}
                onMouseEnter={() => onNodeHover(node.id)}
                onMouseLeave={() => onNodeHover(null)}
                onClick={() => {
                  onNodeClick(node.id);
                  if (!isExpanded) setExpandedNode(null);
                }}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  isActive
                    ? `${pathBorderColors[node.pathType] || 'border-accent-500/30'} bg-accent-500/[0.04]`
                    : 'border-background-200/70 bg-background-50 hover:border-background-200'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[12px] font-medium ${isActive ? 'text-accent-600' : 'text-foreground-900'}`}>
                    {tr(node.label)}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono ${pathColors[node.pathType] || 'bg-background-200 text-foreground-500'}`}>
                    {node.pathType}
                  </span>
                </div>

                {/* Source info */}
                <div className="text-[10px] text-foreground-500 mb-1.5">
                  {node.sourceType} · {node.publisher}
                </div>

                <div className="flex items-center justify-between text-[9px] text-foreground-400">
                  <span>{node.date}</span>
                </div>

                {/* Related sections */}
                <AnimatePresence>
                  {isActive && node.relatedSections.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 pt-2 border-t border-accent-500/10 overflow-hidden"
                    >
                      <div className="flex items-center gap-1 text-[10px] text-accent-600 font-mono mb-1.5">
                        <Link2 size={9} />
                        {tr('支持段落')}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {node.relatedSections.map((sec) => (
                          <span key={sec} className="px-1.5 py-0.5 rounded bg-accent-500/10 text-accent-600 text-[10px] whitespace-nowrap">
                            {sec}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Expand button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedNode(isExpanded ? null : node.id);
                  }}
                  className="mt-2 flex items-center gap-1 text-[9px] text-foreground-400 hover:text-foreground-600 transition-colors cursor-pointer w-full"
                >
                  <ChevronDown
                    size={10}
                    className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  />
                  {isExpanded ? '收起详情' : '展开详情'}
                </button>

                {/* Expanded signal details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 pt-2 border-t border-background-200/60 overflow-hidden"
                    >
                      <div className="text-[10px] text-foreground-400 font-mono mb-2">{tr('提取信号')}</div>
                      <div className="flex flex-col gap-1.5">
                        {node.extractedSignals.map((signal, si) => (
                          <div key={si} className="flex items-start gap-1.5">
                            <ExternalLink size={9} className="text-accent-500/60 mt-0.5 shrink-0" />
                            <span className="text-[10px] text-foreground-600 leading-relaxed">{signal}</span>
                          </div>
                        ))}
                      </div>
                      {node.relatedSections.length > 0 && (
                        <div className="mt-2.5 flex items-center gap-2">
                          <span className="text-[9px] text-foreground-400 font-mono">{tr('点击节点定位报告段落')}</span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}

          {/* Connection indicator */}
          <div className="mt-3 flex items-center justify-center">
            <div className="flex items-center gap-1 text-[9px] text-foreground-400 font-mono">
              <div className="w-3 h-px bg-accent-500/20" />
              <span>{tr('来源 → 段落关联链')}</span>
              <div className="w-3 h-px bg-accent-500/20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}