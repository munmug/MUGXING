import StatusBadge from './StatusBadge';

interface SourceCardProps {
  id: string;
  name: string;
  domain: string;
  status: 'fetched' | 'processing' | 'pending' | 'failed';
  progress: number;
  count: string;
  onToggle?: (id: string) => void;
  enabled?: boolean;
}

const statusLabelMap: Record<string, { label: string; type: 'success' | 'warning' | 'error' | 'info' }> = {
  fetched: { label: '已抓取', type: 'success' },
  processing: { label: '处理中', type: 'warning' },
  pending: { label: '待校验', type: 'info' },
  failed: { label: '失败', type: 'error' },
};

export default function SourceCard({ id, name, domain, status, progress, count, onToggle, enabled = true }: SourceCardProps) {
  const statusInfo = statusLabelMap[status];

  return (
    <div className={`p-3 rounded-lg border transition-all ${enabled ? 'bg-xing-card border-xing-border hover:border-xing-border-hover' : 'bg-xing-card/30 border-xing-border-subtle opacity-60'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-medium text-xing-text truncate">{name}</div>
          <div className="text-[11px] text-xing-text-3 truncate">{domain}</div>
        </div>
        <div className="flex items-center gap-2 ml-3">
          {onToggle && (
            <button
              onClick={() => onToggle(id)}
              className={`w-8 h-5 rounded-full transition-colors cursor-pointer relative ${enabled ? 'bg-xing-green/40' : 'bg-xing-card-hover'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${enabled ? 'left-[14px]' : 'left-[2px]'}`} />
            </button>
          )}
          <StatusBadge status={statusInfo.label} type={statusInfo.type} />
        </div>
      </div>
      <div className="w-full h-1 bg-xing-card-hover/70 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${status === 'failed' ? 'bg-xing-red/50' : status === 'fetched' ? 'bg-xing-green' : 'bg-xing-green/50'}`}
          style={{ width: `${status === 'pending' ? 0 : status === 'failed' ? 25 : progress}%` }}
        />
      </div>
      <div className="mt-1.5 flex items-center justify-between">
        <span className={`text-[10px] font-mono ${status === 'failed' ? 'text-xing-red/70' : status === 'fetched' ? 'text-xing-green/70' : 'text-xing-text-2/50'}`}>
          {count}
        </span>
      </div>
    </div>
  );
}