"use client";

import { type Icon } from "@tabler/icons-react";
import { ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { usePathname } from 'next/navigation';

export const NavMain = ({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
    isActive?: boolean;
    isDisabled?: boolean;
    isNew?: boolean;
    subItems?: {
      title: string;
      url: string;
      isDisabled?: boolean;
      isNew?: boolean;
    }[];
  }[];
}) => {
  const pathname = usePathname();
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => {
            // Check if item has subItems
            const hasSubItems = item.subItems && item.subItems.length > 0;

            // If no subItems, render simple menu button
            if (!hasSubItems) {
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    className={cn(
                      item.isDisabled &&
                        "cursor-not-allowed user-select-none hover:bg-transparent hover:text-foreground active:bg-transparent active:text-foreground",
                    )}
                    tooltip={item.title}
                    asChild
                    isActive={pathname === item.url}
                  >
                    <a href={item.url}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      {item.isDisabled && (
                        <Badge
                          className="text-[10px] px-1 font-semibold font-mono text-foreground"
                          variant="secondary"
                        >
                          Coming Soon
                        </Badge>
                      )}
                      {item.isNew && (
                        <span className="bg-linear-to-r from-red-500 to-red-800 text-white px-1.5 py-0.5 text-[9px] font-semibold rounded-[10px_2px_10px_2px]">
                          New
                        </span>
                      )}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            }

            // If has subItems, render collapsible
            return (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={item.subItems?.some((s) => pathname.includes(s.url))}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      className={cn(
                        item.isDisabled &&
                          "cursor-not-allowed user-select-none hover:bg-transparent hover:text-foreground active:bg-transparent active:text-foreground",
                      )}
                      tooltip={item.title}
                      isActive={pathname === item.url}
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      {item.isDisabled && (
                        <Badge
                          className="text-[10px] px-1 font-semibold font-mono text-foreground"
                          variant="secondary"
                        >
                          Coming Soon
                        </Badge>
                      )}
                      {item.isNew && (
                        <span className="bg-linear-to-r from-green-500 to-green-800 text-white px-1.5 py-0.5 text-[9px] font-semibold rounded-[10px_2px_10px_2px]">
                          New
                        </span>
                      )}
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.subItems?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            className={cn(
                              subItem.isDisabled &&
                                "cursor-not-allowed user-select-none hover:bg-transparent hover:text-foreground active:bg-transparent active:text-foreground",
                            )}
                            asChild
                            isActive={pathname === subItem.url}
                          >
                            <a href={subItem.url}>
                              <span>{subItem.title}</span>
                              {subItem.isDisabled && (
                                <Badge
                                  className="text-[10px] px-1 font-semibold font-mono text-foreground"
                                  variant="secondary"
                                >
                                  Coming Soon
                                </Badge>
                              )}
                              {subItem.isNew && (
                                <span className="bg-linear-to-r from-green-500 to-green-800 text-white px-1.5 py-0.5 text-[9px] font-semibold rounded-[10px_2px_10px_2px]">
                                  New
                                </span>
                              )}
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
