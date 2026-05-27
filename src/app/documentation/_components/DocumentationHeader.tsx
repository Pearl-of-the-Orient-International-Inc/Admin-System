"use client";

import Link from "next/link";
import { Search, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";

export function DocumentationHeader() {
  return (
    <header className="z-10 flex h-16 shrink-0 items-center gap-4 border-b border-gray-200 bg-white px-6">
      <div className="flex w-[260px] shrink-0 items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#032a0d] text-white">
          <FileText className="h-4 w-4" />
        </div>
        <span className="text-sm font-semibold text-gray-900">
          Admin User Guide
        </span>
      </div>

      <div className="mx-auto w-full max-w-[640px]">
        <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2 text-gray-400 transition-colors hover:border-gray-300">
          <Search className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-sm">Ask or search...</span>
          <kbd className="rounded-md border border-gray-200 bg-white px-2 py-0.5 font-mono text-xs text-gray-400">
            Ctrl K
          </kbd>
        </div>
      </div>

      <Button
        asChild
        variant="outline"
        className="rounded-xl border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50"
      >
        <Link href="/dashboard">Back to Dashboard</Link>
      </Button>
    </header>
  );
}
