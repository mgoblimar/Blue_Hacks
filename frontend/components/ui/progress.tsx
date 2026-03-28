import { cn } from "@/lib/utils";

type ProgressProps = {
  value?: number;
  className?: string;
  indicatorClassName?: string;
};

export function Progress({ value = 0, className, indicatorClassName }: ProgressProps) {
  return (
    <div
      data-slot="progress"
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-slate-700/40", className)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      role="progressbar"
    >
      <div
        data-slot="progress-indicator"
        className={cn("h-full w-full flex-1 bg-slate-200 transition-all", indicatorClassName)}
        style={{ transform: `translateX(-${100 - Math.max(0, Math.min(value, 100))}%)` }}
      />
    </div>
  );
}
