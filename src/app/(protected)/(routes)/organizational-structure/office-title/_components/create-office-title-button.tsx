"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

export function CreateOfficeTitleButton() {
  return (
    <Button asChild>
      <Link href="/organizational-structure/office-title/create">
        <Plus className="size-4" />
        Create office title
      </Link>
    </Button>
  );
}
