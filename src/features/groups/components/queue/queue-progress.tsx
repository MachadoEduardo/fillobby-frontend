import { QUEUE_STATUS_LABEL } from "@/lib/api";
import type { QueueStatus } from "@/lib/api-types";
import { QUEUE_FLOW } from "@/features/groups/constants/queue";
import { cn } from "@/lib/utils";

export function QueueProgress({ status }: { status: QueueStatus }) {
  const currentIndex = QUEUE_FLOW.findIndex((step) => step.status === status);

  if (status === "COMPLETED" || status === "CANCELLED") return null;

  return (
    <div className="grid grid-cols-5" aria-label={`Etapa atual: ${QUEUE_STATUS_LABEL[status]}`}>
      {QUEUE_FLOW.map((step, index) => {
        const reached = index <= currentIndex;
        const current = index === currentIndex;

        return (
          <div key={step.status} className="relative pt-5 text-center">
            {index > 0 && (
              <span
                className={cn(
                  "absolute left-0 top-[0.45rem] h-px w-1/2",
                  reached ? "bg-brand/45" : "bg-border",
                )}
              />
            )}
            {index < QUEUE_FLOW.length - 1 && (
              <span
                className={cn(
                  "absolute right-0 top-[0.45rem] h-px w-1/2",
                  index < currentIndex ? "bg-brand/45" : "bg-border",
                )}
              />
            )}
            <span
              className={cn(
                "absolute left-1/2 top-0 z-10 h-4 w-4 -translate-x-1/2 rounded-full border-4 border-card",
                current ? "bg-signal ring-2 ring-signal/20" : reached ? "bg-brand" : "bg-border",
              )}
            />
            <span
              className={cn(
                "hidden text-[0.65rem] font-medium sm:block",
                current ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
