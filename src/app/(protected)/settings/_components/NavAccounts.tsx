"use client";

import { type Icon } from "@tabler/icons-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { usePathname, useRouter } from 'next/navigation';

export const NavAccounts = ({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
    isNew?: boolean;
  }[];
}) => {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Accounts</SidebarGroupLabel>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton onClick={() => router.push(item.url)} tooltip={item.title} isActive={pathname === item.url}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
                {item.isNew && (
                  <span className="bg-linear-to-r from-green-500 to-green-800 text-white px-1.5 py-0.5 text-[9px] font-semibold rounded-[10px_2px_10px_2px]">
                    New
                  </span>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
