import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ExternalLink, X } from 'lucide-react';
import Modal from '@/components/common/Modal';
import { tr } from '@/lib/lang';

interface IntentRoutingProps {
  input: string;
  detectedIntent: string;
  recommendation: string;
  onBack: () => void;
}

export default function IntentRouting({ input, detectedIntent, recommendation, onBack }: IntentRoutingProps) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="max-w-[480px] w-full"
      >
        <div className="p-8 rounded-2xl bg-xing-panel border border-xing-border">
          <div className="text-[11px] text-xing-text-disabled font-mono mb-6 text-center">Intent Routing</div>

          {/* Input preview */}
          <div className="mb-6">
            <div className="text-[10px] text-xing-text-disabled mb-1.5">{tr('输入内容')}</div>
            <div className="p-3 rounded-lg bg-xing-card border border-xing-border text-[13px] text-xing-text font-medium">
              {input}
            </div>
          </div>

          {/* Detected intent */}
          <div className="mb-6">
            <div className="text-[10px] text-xing-text-disabled mb-1.5">{tr('识别结果')}</div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-xing-green/5 border border-xing-green/20">
              <span className="w-2 h-2 rounded-full bg-xing-green animate-pulse" />
              <span className="text-[13px] text-xing-text font-medium">{detectedIntent}</span>
            </div>
          </div>

          {/* Recommendation */}
          <div className="mb-6">
            <div className="text-[10px] text-xing-text-disabled mb-1.5">{tr('推荐进入')}</div>
            <div className="p-3 rounded-lg bg-xing-card border border-xing-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ExternalLink size={13} className="text-xing-green/70" />
                <span className="text-[13px] text-xing-green font-medium">{recommendation}</span>
              </div>
              <ChevronRight size={14} className="text-xing-text-3" />
            </div>
          </div>

          {/* Auto proceed indicator */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex gap-1">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="w-1 h-1 rounded-full bg-xing-green/60 animate-pulse" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
            <span className="text-[10px] text-xing-text-disabled font-mono">{tr('即将自动进入...')}</span>
          </div>

          <button
            onClick={onBack}
            className="w-full flex items-center justify-center gap-1.5 py-2 text-[11px] text-xing-text-disabled hover:text-xing-text-2/60 transition-colors cursor-pointer"
          >
            <ChevronLeft size={12} />
            返回星轴
          </button>
        </div>
      </motion.div>
    </div>
  );
}