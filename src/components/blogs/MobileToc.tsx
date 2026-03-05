"use client";

import { List } from "lucide-react";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
} from "@/components/ui/drawer";
import { TableOfContents } from "./TableOfContents";

export function MobileTableOfContents() {
  return (
    <Drawer>
      <DrawerTrigger className="lg:hidden fixed bottom-6 right-6 z-50 bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:bg-primary/90 transition-colors">
        <List size={20} />
      </DrawerTrigger>

      <DrawerContent className="lg:hidden bg-card px-5 pb-5">
        <DrawerHeader>
          <h3 className="font-semibold">Table of Contents</h3>
        </DrawerHeader>

        <TableOfContents />
      </DrawerContent>
    </Drawer>
  );
}
