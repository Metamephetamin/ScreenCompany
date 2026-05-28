import { cn } from "@/lib/utils";

export function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-2 overflow-hidden rounded-full bg-zinc-100", className)}>
      <div className="h-full rounded-full bg-zinc-900" style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  );
}
