import { motion } from 'framer-motion';
import { ChevronLeft, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { tr } from '@/lib/lang';

interface ErrorPageProps {
  type: 'source' | 'analysis';
  onBack: () => void;
  onRetry?: () => void;
  onReturnToSetup?: () => void;
}

export default function ErrorPage({ type, onBack, onRetry, onReturnToSetup }: ErrorPageProps) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-[460px] text-center"
      >
        <div className="w-16 h-16 rounded-full bg-xing-red/10 border border-xing-red/20 flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={24} className="text-xing-red/70" />
        </div>

        <h2 className="text-lg font-semibold text-xing-text mb-3">
          {type === 'source' ? '部分数据源暂不可用' : '分析任务未完成'}
        </h2>
        <p className="text-[13px] text-xing-text-2/60 mb-8 leading-relaxed">
          {type === 'source'
            ? '部分数据源暂不可用，已使用缓存快照继续分析。你可以调整数据源配置后重试。'
            : '分析任务未完成，请检查研究目标或数据源配置。'}
        </p>

        <div className="flex items-center justify-center gap-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-xing-green text-[#10120A] text-sm font-semibold hover:bg-xing-green-2 transition-all cursor-pointer whitespace-nowrap active:scale-[0.97]"
            >
              <RefreshCw size={14} />
              {tr('重试')}
            </button>
          )}
          {onReturnToSetup && (
            <button
              onClick={onReturnToSetup}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-xing-border-hover text-sm text-xing-text-2 hover:text-xing-text transition-all cursor-pointer whitespace-nowrap"
            >
              <ArrowLeft size={14} />
              {tr('返回编辑研究计划')}
            </button>
          )}
          {!onRetry && !onReturnToSetup && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-xing-border-hover text-sm text-xing-text-2 hover:text-xing-text transition-all cursor-pointer whitespace-nowrap"
            >
              <ChevronLeft size={14} />
              {tr('返回星轴')}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}