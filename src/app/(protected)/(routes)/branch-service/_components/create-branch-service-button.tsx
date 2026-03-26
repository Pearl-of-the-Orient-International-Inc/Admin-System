"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CreateBranchServiceButton() {
  return (
    <Button asChild>
      <Link href="/branch-service/create">
        <Plus className="size-4" />
        Create Branch Service
      </Link>
    </Button>
  );
}
