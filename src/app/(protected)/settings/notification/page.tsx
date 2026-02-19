"use client";

import { Heading } from "@/components/Heading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Info } from "lucide-react";
import { useState } from "react";

interface NotificationSetting {
  id: string;
  category: string;
  description: string;
  email: boolean;
  inApp: boolean;
  info?: string;
}

const Page = () => {
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: "1",
      category: "Membership",
      description: "New membership application submitted",
      email: true,
      inApp: true,
      info: "Get notified when someone submits a new membership application",
    },
    {
      id: "2",
      category: "Membership",
      description: "Application status updated",
      email: true,
      inApp: true,
      info: "Alerts when an application moves to a new status (e.g. under review, approved)",
    },
    {
      id: "3",
      category: "Membership",
      description: "Document or requirement uploaded",
      email: true,
      inApp: true,
      info: "Notification when an applicant uploads a required document",
    },
    {
      id: "4",
      category: "Members",
      description: "New member registered",
      email: true,
      inApp: true,
      info: "Get notified when a new member completes registration",
    },
    {
      id: "5",
      category: "Members",
      description: "Member profile updated",
      email: false,
      inApp: true,
      info: "Alerts when a member updates their profile or contact information",
    },
    {
      id: "6",
      category: "Announcements & Events",
      description: "New announcement published",
      email: true,
      inApp: true,
      info: "Notification when a new announcement or notice is published",
    },
    {
      id: "7",
      category: "Announcements & Events",
      description: "Event or activity scheduled",
      email: true,
      inApp: true,
      info: "Reminders when new events or activities are scheduled",
    },
    {
      id: "8",
      category: "System",
      description: "System maintenance scheduled",
      email: true,
      inApp: true,
      info: "Updates about scheduled maintenance windows",
    },
    {
      id: "9",
      category: "System",
      description: "Security or account alerts",
      email: true,
      inApp: true,
      info: "Important security notifications (e.g. login from new device, password change)",
    },
  ]);

  const toggleSetting = (id: string, type: "email" | "inApp") => {
    setSettings((prev) =>
      prev.map((setting) =>
        setting.id === id
          ? { ...setting, [type]: !setting[type] }
          : setting
      )
    );
  };

  const groupedSettings = settings.reduce(
    (acc, setting) => {
      acc[setting.category] ??= [];
      acc[setting.category].push(setting);
      return acc;
    },
    {} as Record<string, NotificationSetting[]>
  );

  return (
    <div>
      <Heading
        title="Notification Settings"
        description="Manage the types of notifications you receive."
      />

      <div className="space-y-10 mt-10">
        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50%] p-4">Notification</TableHead>
                <TableHead className="text-center p-4 w-[25%]">Email</TableHead>
                <TableHead className="text-center p-4 w-[25%]">In app</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {Object.entries(groupedSettings).map(
                ([category, categorySettings]) =>
                  categorySettings.map((setting, index) => (
                    <TableRow key={setting.id}>
                      <TableCell className="p-4">
                        <div className="flex flex-col gap-1">
                          {index === 0 && (
                            <div className="text-sm font-semibold mb-1">
                              {category}
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <span className="text-sm">
                              {setting.description}
                            </span>

                            {setting.info && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                                    <Info className="h-4 w-4" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent className='w-fit'>
                                  <p>{setting.info}</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Email Switch */}
                      <TableCell className="p-4 text-center">
                        <Switch
                          checked={setting.email}
                          onCheckedChange={() =>
                            toggleSetting(setting.id, "email")
                          }
                          aria-label={`Toggle email notifications for ${setting.description}`}
                        />
                      </TableCell>

                      {/* In-App Switch */}
                      <TableCell className="p-4 text-center">
                        <Switch
                          checked={setting.inApp}
                          onCheckedChange={() =>
                            toggleSetting(setting.id, "inApp")
                          }
                          aria-label={`Toggle in-app notifications for ${setting.description}`}
                        />
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Page;
