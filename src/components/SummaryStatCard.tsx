"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SummaryStatCardProps = {
  label: string;
  value: string | number;
  description?: string;
  icon: ReactNode;
  accentClassName?: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
};

export function SummaryStatCard({
  label,
  value,
  description,
  icon,
  accentClassName,
  active = false,
  onClick,
  className,
}: SummaryStatCardProps) {
  const isInteractive = Boolean(onClick);
  const Component = isInteractive ? "button" : "div";

  return (
    <Component
      type={isInteractive ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "rounded-lg border bg-card p-4 text-left shadow-xs transition-colors",
        isInteractive &&
          "hover:border-primary focus-visible:border-primary focus-visible:ring-primary/30 focus-visible:ring-2 focus-visible:outline-none",
        active && "border-primary ring-primary/20 ring-2",
        className,
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <p className="text-muted-foreground text-xs font-medium uppercase">
          {label}
        </p>
        <span
          className={cn(
            "rounded-md p-1.5",
            accentClassName ??
              "bg-muted text-muted-foreground dark:bg-muted/60 dark:text-muted-foreground",
          )}
        >
          {icon}
        </span>
      </div>
      <p className="text-2xl font-semibold">{value}</p>
      {description ? (
        <p className="text-muted-foreground mt-1 text-xs">{description}</p>
      ) : null}
    </Component>
  );
}
