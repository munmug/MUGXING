import { tr } from '@/lib/lang';
interface StatusBadgeProps {
  status: string;
  type?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
}

const statusColors: Record<string, string> = {
  success: 'bg-xing-green/10 text-xing-green border-xing-green/25',
  warning: 'bg-xing-yellow/10 text-xing-yellow border-xing-yellow/25',
  error: 'bg-xing-red/10 text-xing-red border-xing-red/25',
  info: 'bg-xing-card text-xing-text-2 border-xing-border',
  neutral: 'bg-xing-card text-xing-text-2 border-xing-border',
};

export default function StatusBadge({ status, type = 'neutral' }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border ${statusColors[type]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${type === 'success' ? 'bg-xing-green' : type === 'warning' ? 'bg-xing-yellow' : type === 'error' ? 'bg-xing-red' : 'bg-xing-text-2'}`} />
      {tr(status)}
    </span>
  );
}