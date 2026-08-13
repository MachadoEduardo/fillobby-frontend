import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type TooltipProps = {
  content: ReactNode;
  children: ReactNode;
  enabled?: boolean;
  className?: string;
};

export function Tooltip({
  content,
  children,
  enabled = true,
  className,
}: TooltipProps) {
  if (!enabled) return children;

  return (
    <span className={cn("group/tooltip relative flex", className)}>
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md border bg-popover px-2.5 py-1.5 text-xs font-medium text-popover-foreground opacity-0 shadow-sm transition-opacity group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100"
      >
        {content}
      </span>
    </span>
  );
}
