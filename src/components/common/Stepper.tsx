import { tr } from '@/lib/lang';
interface StepperProps {
  steps: { label: string; status: 'completed' | 'active' | 'pending' }[];
}

export default function Stepper({ steps }: StepperProps) {
  return (
    <div className="flex flex-col gap-1">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="flex flex-col items-center">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold border transition-colors ${
                step.status === 'completed'
                  ? 'bg-xing-green/15 border-xing-green text-xing-green'
                  : step.status === 'active'
                  ? 'bg-xing-green/10 border-xing-green/60 text-xing-green'
                  : 'bg-transparent border-xing-border text-xing-text-3'
              }`}
            >
              {step.status === 'completed' ? <i className="ri-check-line text-xs" /> : step.status === 'active' ? '··' : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div className={`w-px h-5 my-1 ${step.status === 'completed' ? 'bg-xing-green/30' : 'bg-xing-border-subtle'}`} />
            )}
          </div>
          <span
            className={`text-sm whitespace-nowrap ${
              step.status === 'active' ? 'text-xing-text font-medium' : step.status === 'completed' ? 'text-xing-text-2' : 'text-xing-text-3'
            }`}
          >
            {tr(step.label)}
            {step.status === 'active' && <span className="ml-1.5 text-[10px] text-xing-green/70 font-mono">{tr('执行中')}</span>}
            {step.status === 'completed' && <span className="ml-1.5 text-[10px] text-xing-green/50 font-mono">{tr('已完成')}</span>}
          </span>
        </div>
      ))}
    </div>
  );
}