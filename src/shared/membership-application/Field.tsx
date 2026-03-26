import type { ReactNode } from "react";
import { HelpCircleIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5 text-xs sm:text-sm">
      <span className="flex items-center gap-2">
        <span className="font-medium text-foreground">
          {label}
          {required && <span className="ml-0.5 text-red-600">*</span>}
        </span>
        {hint ? (
          <Tooltip>
            <TooltipTrigger type="button">
              <HelpCircleIcon className="size-3 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>{hint}</TooltipContent>
          </Tooltip>
        ) : null}
      </span>
      {children}
    </label>
  );
}
