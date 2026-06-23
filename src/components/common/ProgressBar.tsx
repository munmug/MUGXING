interface ProgressBarProps {
  progress: number;
  label?: string;
  count?: string;
  status?: 'running' | 'done' | 'pending' | 'failed';
  className?: string;
}

const statusStyles: Record<string, { bar: string; text: string }> = {
  running: { bar: 'bg-xing-green/60', text: 'text-xing-green/70' },
  done: { bar: 'bg-xing-green', text: 'text-xing-green' },
  pending: { bar: 'bg-xing-card-hover', text: 'text-xing-text-3' },
  failed: { bar: 'bg-xing-red/50', text: 'text-xing-red/70' },
};

export default function ProgressBar({ progress, label, count, status = 'running', className = '' }: ProgressBarProps) {
  const style = statusStyles[status];
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {(label || count) && (
        <div className="flex items-center justify-between">
          {label && <span className="text-[11px] text-xing-text-2 truncate">{label}</span>}
          {count && <span className={`text-[10px] font-mono ${style.text}`}>{count}</span>}
        </div>
      )}
      <div className="w-full h-1 bg-xing-card-hover/70 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${style.bar}`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
}