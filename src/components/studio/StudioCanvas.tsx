import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Play, ArrowLeft } from 'lucide-react';
import ResearchNodeCard from './ResearchNodeCard';
import NodeParameterPanel from './NodeParameterPanel';
import type { ResearchNode, ResearchConnection, CopilotMessage, ResearchContext } from '@/lib/types';
import { defaultStudioNodes, defaultStudioConnections, defaultCopilotMessages } from '@/data/mockStudio';
import { tr } from '@/lib/lang';

interface StudioCanvasProps {
  strategyName: string;
  nodes: ResearchNode[];
  connections: ResearchConnection[];
  copilotInitial: CopilotMessage[];
  context?: ResearchContext | null;
  onBack: () => void;
  onRun: () => void;
  onReturnToReport: (() => void) | null;
  showToast: (msg: string) => void;
}

export default function StudioCanvas({
  strategyName, nodes: initialNodes, connections, copilotInitial,
  context, onBack, onRun, onReturnToReport, showToast,
}: StudioCanvasProps) {
  const [nodes, setNodes] = useState(initialNodes);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<ResearchNode | null>(null);
  const [copilotMessages, setCopilotMessages] = useState<CopilotMessage[]>(copilotInitial);
  const [copilotInput, setCopilotInput] = useState('');

  useEffect(() => {
    setNodes(initialNodes);
    setCopilotMessages(copilotInitial);
    setSelectedNodeId(null);
    setEditingNode(null);
  }, [initialNodes, copilotInitial]);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;

  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedNodeId((prev) => (prev === nodeId ? null : nodeId));
    setEditingNode(null);
  }, []);

  const handleEditNode = useCallback((nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (node) setEditingNode(node);
  }, [nodes]);

  const handleSaveParams = useCallback((nodeId: string, fields: { key: string; value: string }[]) => {
    setNodes((prev) => prev.map((n) => (n.id === nodeId ? { ...n, fields, edited: true } : n)));
    showToast('节点参数已保存');
  }, [showToast]);

  const handleCopilotSubmit = useCallback(() => {
    if (!copilotInput.trim()) return;
    const input = copilotInput.trim();
    setCopilotMessages((prev) => [...prev, { role: 'user', text: input }]);

    // Simple NLP simulation
    if (input.includes('阈值') && selectedNodeId === 'conflict-review') {
      const match = input.match(/(\d+)%/);
      if (match) {
        setNodes((prev) => prev.map((n) => {
          if (n.id === 'conflict-review') {
            return {
              ...n,
              edited: true,
              fields: n.fields.map((f) => (f.key === '优先口径' ? { ...f, value: `阈值 ${match[1]}%` } : f)),
            };
          }
          return n;
        }));
        setCopilotMessages((prev) => [...prev, { role: 'action', text: `已将冲突审查阈值更新为 ${match[1]}%` }]);
        showToast('阈值已更新');
      }
    } else {
      setCopilotMessages((prev) => [...prev, { role: 'action', text: '已接收指令，正在分析...当前研究流结构稳定，可手动编辑节点参数。' }]);
    }

    setCopilotInput('');
  }, [copilotInput, selectedNodeId, showToast]);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Top bar */}
      <div className="h-14 border-b border-xing-border-subtle flex items-center px-5 bg-xing-panel shrink-0">
        <button onClick={onBack} className="text-xing-text-disabled hover:text-xing-text-2 transition-colors cursor-pointer mr-4">
          <ChevronLeft size={16} />
        </button>
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-semibold text-xing-text">XING</span>
          <span className="text-xing-border-subtle text-sm">|</span>
          <span className="text-[12px] text-xing-text-2 font-mono">Research Studio</span>
          <span className="text-xing-border-subtle text-sm">|</span>
          <span className="text-[11px] text-xing-text-3 font-mono">{strategyName}</span>
        </div>

        <div className="ml-auto flex items-center gap-3">
          {onReturnToReport && (
            <button
              onClick={onReturnToReport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-xing-border text-xing-text-2/60 hover:text-xing-text-2 text-[12px] transition-all cursor-pointer whitespace-nowrap"
            >
              <ArrowLeft size={13} />
              返回报告
            </button>
          )}
          <button
            onClick={onRun}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-xing-green text-[#10120A] text-[12px] font-semibold hover:bg-xing-green-2 transition-all cursor-pointer whitespace-nowrap active:scale-[0.97]"
          >
            <Play size={13} />
            运行分析
          </button>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex min-h-0">
        {/* Left: Module drawer */}
        <div className="w-[220px] shrink-0 border-r border-xing-border-subtle bg-xing-panel p-3 overflow-y-auto">
          <div className="text-[10px] text-xing-text-disabled font-mono mb-3">{tr('研究模块')}</div>
          <div className="flex flex-col gap-1">
            {['目标定义', '数据抓取', '指标对齐', '冲突审查', '结论生成', '报告导出'].map((mod) => (
              <div
                key={mod}
                className="px-3 py-2 rounded-lg text-[11px] text-xing-text-3 hover:text-xing-text-2 hover:bg-xing-card transition-colors cursor-pointer flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-xing-green/30" />
                {mod}
              </div>
            ))}
          </div>
        </div>

        {/* Center: Canvas */}
        <div className="flex-1 relative bg-grid overflow-hidden">
          {/* Connection lines (simplified SVG) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {connections.map((conn, i) => {
              const fromNode = nodes.find((n) => n.id === conn.from);
              const toNode = nodes.find((n) => n.id === conn.to);
              if (!fromNode || !toNode) return null;

              const x1 = fromNode.x + 240;
              const y1 = fromNode.y + 60;
              const x2 = toNode.x;
              const y2 = toNode.y + 60;
              const mx = (x1 + x2) / 2;

              return (
                <g key={i}>
                  <path
                    d={`M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`}
                    fill="none"
                    stroke={selectedNodeId === conn.from || selectedNodeId === conn.to ? 'rgba(222,255,154,0.5)' : 'rgba(222,255,154,0.18)'}
                    strokeWidth={1.5}
                    strokeDasharray="6 4"
                    className="flow-line"
                  />
                  <polygon
                    points={`${x2 - 6},${y2 - 4} ${x2},${y2} ${x2 - 6},${y2 + 4}`}
                    fill={selectedNodeId === conn.from || selectedNodeId === conn.to ? 'rgba(222,255,154,0.5)' : 'rgba(222,255,154,0.18)'}
                  />
                </g>
              );
            })}
          </svg>

          {/* Nodes */}
          <div className="relative w-full h-full min-h-[700px]">
            {nodes.map((node) => (
              <ResearchNodeCard
                key={node.id}
                node={node}
                selected={selectedNodeId === node.id}
                onClick={() => handleNodeClick(node.id)}
                onEdit={() => handleEditNode(node.id)}
              />
            ))}
          </div>
        </div>

        {/* Right: Copilot or Parameter Panel */}
        <AnimatePresence mode="wait">
          {editingNode ? (
            <NodeParameterPanel
              key="params"
              node={editingNode}
              onClose={() => setEditingNode(null)}
              onSave={handleSaveParams}
            />
          ) : (
            <motion.div
              key="copilot"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-[300px] shrink-0 border-l border-xing-border-subtle bg-xing-panel flex flex-col"
            >
              {/* Copilot header */}
              <div className="px-4 py-3 border-b border-xing-border-subtle">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-xing-green animate-pulse" />
                  <span className="text-[12px] font-medium text-xing-text">Xing Co-pilot</span>
                </div>
                <div className="text-[10px] text-xing-text-disabled mt-0.5">{tr('研究流指令台')}</div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
                {copilotMessages.map((msg, i) => (
                  <div key={i} className={`${
                    msg.role === 'user'
                      ? 'self-end max-w-[85%]'
                      : 'self-start max-w-[90%]'
                  }`}>
                    {msg.role === 'assistant' && (
                      <div className="p-2.5 rounded-lg bg-xing-card border-l-2 border-xing-green/40">
                        <div className="text-[11px] text-xing-text-2/80 leading-relaxed">{msg.text}</div>
                      </div>
                    )}
                    {msg.role === 'user' && (
                      <div className="px-3 py-2 rounded-full bg-xing-green/10 border border-xing-green/20">
                        <div className="text-[11px] text-xing-text">{msg.text}</div>
                      </div>
                    )}
                    {msg.role === 'action' && (
                      <div className="p-2 rounded-lg bg-xing-card border border-xing-green/15">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[10px] text-xing-green/60 font-mono">Action Log</span>
                        </div>
                        <div className="text-[11px] text-xing-text-2/70">{msg.text}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="p-3 border-t border-xing-border-subtle">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={copilotInput}
                    onChange={(e) => setCopilotInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleCopilotSubmit(); }}
                    placeholder={tr('下达下一步指令...')}
                    className="flex-1 bg-xing-card border border-xing-border rounded-lg px-3 py-2 text-[12px] text-xing-text placeholder:text-xing-text-disabled outline-none focus:border-xing-border-active transition-colors"
                  />
                  <button
                    onClick={handleCopilotSubmit}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-xing-green/15 text-xing-green hover:bg-xing-green/20 transition-colors cursor-pointer shrink-0"
                  >
                    <i className="ri-send-plane-fill text-xs" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}