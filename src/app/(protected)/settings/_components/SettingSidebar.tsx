"use client";
import * as React from "react";
import {
  IconBan,
  IconBell,
  IconBuilding,
  IconClockEdit,
  IconCode,
  IconCookie,
  IconDeviceDesktopCog,
  IconHelpCircle,
  IconLockAccess,
  IconMail,
  IconMapPin,
  IconMasksTheater,
  IconMessage2Cog,
  IconScale,
  IconSettings,
} from "@tabler/icons-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ArrowLeftIcon } from "lucide-react";
import { NavAccounts } from "../_components/NavAccounts";
import { NavCms } from "../_components/NavCms";

const data = {
  navAccount: [
    {
      title: "General",
      url: "/settings",
      icon: IconSettings,
    },
    {
      title: "Notifications",
      url: "/settings/notification",
      icon: IconBell,
    },
    {
      title: "Sessions",
      url: "/settings/sessions",
      icon: IconDeviceDesktopCog,
      isNew: true,
    },
    {
      title: "Cookie",
      url: "/settings/cookie",
      icon: IconCookie,
      isNew: true,
    },
    {
      title: "Security & Privacy",
      url: "/settings/security",
      icon: IconLockAccess,
      isNew: true,
    },
    {
      title: "Developer",
      url: "/settings/developer",
      icon: IconCode,
      isNew: true,
    },
  ],
  navCms: [
    {
      title: "Platform",
      url: "/settings/cms/platform",
      icon: IconBuilding,
    },
    {
      title: "Contact Information",
      url: "/settings/cms/contact",
      icon: IconMapPin,
    },
    {
      title: "Policies",
      url: "/settings/cms/policies",
      icon: IconScale,
    },
    {
      title: "Branding",
      url: "/settings/cms/branding",
      icon: IconMasksTheater,
    },
    {
      title: "Email",
      url: "/settings/cms/email",
      icon: IconMail,
    },
    {
      title: "FAQs",
      url: "/settings/cms/faqs",
      icon: IconHelpCircle,
    },
    {
      title: "Office Hours",
      url: "/settings/cms/office-hours",
      icon: IconClockEdit,
    },
    {
      title: "Restricted Users",
      url: "/settings/cms/restricted-users",
      icon: IconBan,
      isNew: true,
    },
    {
      title: "Chat Configuration",
      url: "/settings/cms/chat-configuration",
      icon: IconMessage2Cog,
    },
  ],
};

export const SettingSidebar = ({
  ...props
}: React.ComponentProps<typeof Sidebar>) => {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="/dashboard">
                <ArrowLeftIcon className="size-4" />
                Back to app
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavAccounts items={data.navAccount} />
        <NavCms items={data.navCms} />
      </SidebarContent>
    </Sidebar>
  );
};
