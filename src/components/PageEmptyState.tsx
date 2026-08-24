"use client";

import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PageEmptyStateProps = {
  title: string;
  description: string;
  createUrl?: string;
  createLabel?: string;
  createAction?: () => void;
  className?: string;
};

export function PageEmptyState({
  title,
  description,
  createUrl,
  createLabel = "Create new",
  createAction,
  className,
}: PageEmptyStateProps) {
  return (
    <div
      className={cn(
        "text-muted-foreground flex min-h-60 flex-col items-center justify-center rounded-xl border border-dashed bg-card/40 p-6 text-center",
        className,
      )}
    >
      <Image
        src="/svg-vector/empty-state.svg"
        alt="No data found"
        width={200}
        height={200}
      />

      <div className="mt-8 space-y-2">
        <p className="text-foreground text-lg font-semibold">{title}</p>
        <p className="mx-auto max-w-xl text-sm leading-relaxed">
          {description}
        </p>
      </div>

      {createAction && createLabel ? (
        <Button className="mt-6" onClick={createAction}>
          <Plus className="size-4" />
          {createLabel}
        </Button>
      ) : createUrl && createLabel ? (
        <Button asChild className="mt-6">
          <Link href={createUrl}>
            <Plus className="size-4" />
            {createLabel}
          </Link>
        </Button>
      ) : null}
    </div>
  );
}
