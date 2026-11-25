"use client"

import * as React from "react"
import { type Icon } from "@tabler/icons-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export const NavSecondary = ({
  items,
  ...props
}: {
  items: {
    title: string
    url: string
    icon: Icon
  }[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) => {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"
  return (
    <SidebarGroup {...props}>
       {!isCollapsed ? <SidebarGroupLabel>Technical</SidebarGroupLabel> : null}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild className="h-10 rounded-xl group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-11! group-data-[collapsible=icon]:justify-center! group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:[&>svg]:size-5!">
                <a href={item.url}>
                  <item.icon />
                  {!isCollapsed ? <span>{item.title}</span> : null}
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
