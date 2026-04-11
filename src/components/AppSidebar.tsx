"use client";
import * as React from "react";
import {
  IconBuildingChurch,
  IconBuildingWarehouse,
  IconCalendarEvent,
  IconChartBar,
  IconDatabase,
  IconHeartHandshake,
  IconLayoutDashboard,
  IconLogs,
  IconMessageCircle,
  IconPray,
  IconUserCog,
  IconUsersGroup,
} from "@tabler/icons-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavMain } from "@/components/NavMain";
import { NavSecondary } from "@/components/NavSecondary";
import { HeaderToolbar } from "@/components/HeaderToolbar";
import Image from "next/image";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconLayoutDashboard,
    },
    {
      title: "Members",
      url: "#",
      icon: IconUsersGroup,
      subItems: [
        {
          title: "All Members",
          url: "/members",
        },
        {
          title: "Pending Applications",
          url: "/members/pending",
        },
        {
          title: "Renewal Members",
          url: "/members/renewal",
        },
      ],
    },
    {
      title: "Branch of Services",
      url: "/branch-service",
      icon: IconBuildingChurch,
    },
    {
      title: "Organizational Structure",
      url: "#",
      icon: IconBuildingWarehouse,
      subItems: [
        {
          title: "Overview",
          url: "/organizational-structure",
        },
        {
          title: "Office Titles",
          url: "/organizational-structure/office-title",
        },
      ],
    },
    {
      title: "Events",
      url: "/events",
      icon: IconCalendarEvent,
    },
    {
      title: "Prayer Requests",
      url: "/prayer-requests",
      icon: IconPray,
    },
    {
      title: "Pastoral Care",
      url: "#",
      icon: IconHeartHandshake,
      subItems: [
        {
          title: "Visit Requests",
          url: "/pastoral/visits",
        },
        {
          title: "Counseling Sessions",
          url: "/pastoral/counseling",
        },
      ],
    },
    {
      title: "Memo & Announcements",
      url: "/memo-announcements",
      icon: IconMessageCircle,
    },
    {
      title: "Reports & Analytics",
      url: "#",
      icon: IconChartBar,
      subItems: [
        {
          title: "Membership Overview",
          url: "/reports/membership",
        },
        {
          title: "Ministry Activity",
          url: "/reports/ministry",
        },
      ],
    },
    {
      title: "System Logs",
      url: "/system-logs",
      icon: IconLogs,
    },
  ],
  navSecondary: [
    {
      title: "Admin Accounts",
      url: "/accounts",
      icon: IconUserCog,
    },
    {
      title: "Backup Database",
      url: "/backup-database",
      icon: IconDatabase,
    },
  ],
};

export const AppSidebar = ({
  ...props
}: React.ComponentProps<typeof Sidebar>) => {
  const { state } = useSidebar();
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {state !== "collapsed" ? (
          <HeaderToolbar />
        ) : (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="/dashboard">
                  <Image
                    src="/main/logo.png"
                    alt="Pearl of the Orient"
                    width={20}
                    height={20}
                  />
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} />
      </SidebarContent>
      <SidebarFooter>
        {/* {state !== "collapsed" ? (
          <Subscription />
        ) : (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <SparklesIcon />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )} */}
      </SidebarFooter>
    </Sidebar>
  );
};
