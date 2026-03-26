"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

type PageErrorStateProps = {
  title: string;
  description: string;
  backUrl: string;
  backLabel?: string;
  className?: string;
};

export function PageErrorState({
  title,
  description,
  backUrl,
  backLabel = "Go back",
  className,
}: PageErrorStateProps) {
  return (
    <div
      className={cn(
        "text-muted-foreground flex min-h-60 flex-col items-center justify-center rounded-xl border border-dashed bg-card/40 p-6 text-center",
        className,
      )}
    >
      <Image
        src="/svg-vector/error-state.svg"
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

      <Button asChild className="mt-6" size="sm">
        <Link href={backUrl}>
          <ArrowLeft className="size-4" />
          {backLabel}
        </Link>
      </Button>
    </div>
  );
}
