import { motion } from 'framer-motion';
import { ChevronLeft, Search, ClipboardList, Layers } from 'lucide-react';
import { tr } from '@/lib/lang';

interface UnknownIntentProps {
  input: string;
  onBack: () => void;
  onQuickAnalysis: () => void;
  onGuidedResearch: () => void;
  onStudio: () => void;
}

export default function UnknownIntent({ input, onBack, onQuickAnalysis, onGuidedResearch, onStudio }: UnknownIntentProps) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-[500px] text-center"
      >
        <div className="w-16 h-16 rounded-full bg-xing-card border border-xing-border flex items-center justify-center mx-auto mb-6">
          <Search size={24} className="text-xing-text-3" />
        </div>

        <h2 className="text-lg font-semibold text-xing-text mb-3">{tr('我需要再确认你的研究对象')}</h2>
        <p className="text-sm text-xing-text-3 mb-2">
          {`你的输入 "${input}" 范围较宽泛`}
        </p>
        <p className="text-[12px] text-xing-text-disabled mb-8">{tr('请选择一个任务类型，或重新输入更具体的研究问题')}</p>

        <div className="flex flex-col gap-3 mb-8">
          <button
            onClick={onQuickAnalysis}
            className="flex items-center gap-3 p-4 rounded-xl border border-xing-border bg-xing-card hover:border-xing-border-hover transition-all cursor-pointer text-left"
          >
            <div className="w-9 h-9 rounded-lg bg-xing-green/10 flex items-center justify-center shrink-0">
              <ClipboardList size={16} className="text-xing-green" />
            </div>
            <div>
              <div className="text-sm font-medium text-xing-text">{tr('快速分析')}</div>
              <div className="text-[11px] text-xing-text-3">{`输入股票代码进行快速风险评估`}</div>
            </div>
          </button>

          <button
            onClick={onGuidedResearch}
            className="flex items-center gap-3 p-4 rounded-xl border border-xing-border bg-xing-card hover:border-xing-border-hover transition-all cursor-pointer text-left"
          >
            <div className="w-9 h-9 rounded-lg bg-xing-green/10 flex items-center justify-center shrink-0">
              <Search size={16} className="text-xing-green" />
            </div>
            <div>
              <div className="text-sm font-medium text-xing-text">{tr('引导研究')}</div>
              <div className="text-[11px] text-xing-text-3">{`选择分析框架和数据源进行深入研究`}</div>
            </div>
          </button>

          <button
            onClick={onStudio}
            className="flex items-center gap-3 p-4 rounded-xl border border-xing-border bg-xing-card hover:border-xing-border-hover transition-all cursor-pointer text-left"
          >
            <div className="w-9 h-9 rounded-lg bg-xing-green/10 flex items-center justify-center shrink-0">
              <Layers size={16} className="text-xing-green" />
            </div>
            <div>
              <div className="text-sm font-medium text-xing-text">Research Studio</div>
              <div className="text-[11px] text-xing-text-3">{`自定义研究流与节点编辑`}</div>
            </div>
          </button>
        </div>

        <button
          onClick={onBack}
          className="flex items-center gap-1.5 mx-auto text-xs text-xing-text-disabled hover:text-xing-text-2/70 transition-colors cursor-pointer"
        >
          <ChevronLeft size={14} />
          返回星轴重新输入
        </button>
      </motion.div>
    </div>
  );
}