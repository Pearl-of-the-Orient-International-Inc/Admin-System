"use client";

import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RegisterAccountButton() {
  return (
    <Button asChild>
      <Link href="/accounts/new">
        <PlusCircle className="size-4" />
        Register Account
      </Link>
    </Button>
  );
}
