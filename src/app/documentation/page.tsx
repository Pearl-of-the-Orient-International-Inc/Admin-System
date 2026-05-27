"use client";

import {
  ChevronDown,
  Copy,
  ExternalLink,
  MonitorSmartphone,
} from "lucide-react";

import { AiOutlineFilePdf, AiOutlineOpenAI } from "react-icons/ai";
import { RiClaudeFill } from "react-icons/ri";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const featureSections = [
  {
    id: "welcome",
    title: "Introduction",
    heading: "Welcome to the Admin User Guide",
    description:
      "This guide helps admin users understand the system, follow proper steps, and use each feature with clarity and confidence.",
    body: [
      "The admin system is designed to help your team manage records, publish updates, respond to ministry needs, and keep internal work organized.",
      "Use this page as a training companion when onboarding new staff members or reviewing how to perform a specific task properly.",
    ],
    imageTitle: "Introduction Screenshot",
    imageDescription:
      "Add a screenshot of the admin dashboard or main landing page here.",
  },
  {
    id: "getting-around",
    title: "Overview",
    heading: "Getting Around the System",
    description:
      "Learn where to find major work areas, how to move between sections, and how to review information before saving changes.",
    body: [
      "The system is organized into clear work areas such as members, content, events, reports, and records.",
      "Most pages include search, filtering, action menus, and forms for viewing or updating information. Always review entries carefully before confirming an action.",
    ],
    imageTitle: "Navigation Screenshot",
    imageDescription:
      "Add a screenshot of the navigation, content area, or common page tools here.",
  },
  {
    id: "dashboard-guide",
    title: "Dashboard",
    heading: "Dashboard and Daily Overview",
    description:
      "Use the dashboard to quickly see what needs attention, review summaries, and stay aware of current activity.",
    body: [
      "The dashboard gives a quick picture of the most important information at a glance.",
      "Check it at the start of the day to identify urgent tasks, pending items, or updates that need attention.",
    ],
    imageTitle: "Dashboard Screenshot",
    imageDescription:
      "Add a screenshot of the dashboard summary cards and overview panels here.",
  },
  {
    id: "members-guide",
    title: "Members",
    heading: "Managing Member Records",
    description:
      "Review applications, update member profiles, and keep records accurate and complete.",
    body: [
      "Use the members area to manage approved members, pending applications, and renewal-related records.",
      "Before approving or editing a record, verify names, contact details, and supporting information carefully.",
    ],
    imageTitle: "Members Screenshot",
    imageDescription:
      "Add a screenshot of the member list or member details page here.",
  },
  {
    id: "branch-services-guide",
    title: "Branch of Services",
    heading: "Working with Branch of Services",
    description:
      "Organize service-related entries clearly so ministry assignments remain accurate and easy to track.",
    body: [
      "Keep branch and service information updated so staff can refer to the correct ministry structure.",
      "Review naming, category placement, and related records before making edits public.",
    ],
    imageTitle: "Branch of Services Screenshot",
    imageDescription:
      "Add a screenshot of the branch of services page here.",
  },
  {
    id: "organizational-structure-guide",
    title: "Organizational Structure",
    heading: "Maintaining Organizational Structure",
    description:
      "Use this area to keep offices, titles, and leadership structure organized and easy to understand.",
    body: [
      "Update office titles and related information carefully so the structure stays consistent across the system.",
      "Review role names and placement before saving changes that may affect reporting or presentation.",
    ],
    imageTitle: "Organizational Structure Screenshot",
    imageDescription:
      "Add a screenshot of the organizational structure or office titles page here.",
  },
  {
    id: "news-and-blogs-guide",
    title: "News and Blogs",
    heading: "Creating News and Blog Posts",
    description:
      "Prepare public updates clearly, attach the right media, and review the preview before publishing or syncing.",
    body: [
      "Use short, readable paragraphs and a clear title so the message is easy for readers to understand.",
      "Check the media, hashtags, and Facebook sync preview before posting important announcements.",
    ],
    imageTitle: "News and Blogs Screenshot",
    imageDescription:
      "Add a screenshot of the news editor, preview, or content list here.",
  },
  {
    id: "events-guide",
    title: "Events",
    heading: "Managing Events",
    description:
      "Create schedules carefully and confirm dates, times, locations, and visibility before publishing.",
    body: [
      "Events are used for seminars, meetings, outreach, and official ministry activities.",
      "Review every event detail before publishing to avoid confusion for attendees and staff.",
    ],
    imageTitle: "Events Screenshot",
    imageDescription:
      "Add a screenshot of the events calendar or event form here.",
  },
  {
    id: "prayer-requests-guide",
    title: "Prayer Requests",
    heading: "Handling Prayer Requests",
    description:
      "Treat prayer requests with care, respect, and proper follow-up.",
    body: [
      "Prayer requests often contain personal concerns, so they should be reviewed with sensitivity.",
      "Update request records promptly so the team knows what has already been acknowledged or acted on.",
    ],
    imageTitle: "Prayer Requests Screenshot",
    imageDescription:
      "Add a screenshot of the prayer requests page here.",
  },
  {
    id: "pastoral-care-guide",
    title: "Pastoral Care",
    heading: "Managing Pastoral Care",
    description:
      "Track counseling and visitation needs in an organized and respectful way.",
    body: [
      "Use this area to follow up on visits, counseling sessions, and other ministry care needs.",
      "Keep statuses updated so no important request is overlooked.",
    ],
    imageTitle: "Pastoral Care Screenshot",
    imageDescription:
      "Add a screenshot of the pastoral care pages here.",
  },
  {
    id: "memo-guide",
    title: "Memo and Announcements",
    heading: "Preparing Memos and Announcements",
    description:
      "Share internal notices clearly and review message details before distribution.",
    body: [
      "This area is for official communication inside the system.",
      "Make sure dates, names, and instructions are correct before saving or sending a memo.",
    ],
    imageTitle: "Memo Screenshot",
    imageDescription:
      "Add a screenshot of the memo and announcements area here.",
  },
  {
    id: "reports-guide",
    title: "Reports and Analytics",
    heading: "Using Reports and Analytics",
    description:
      "Review trends, summaries, and activity records to support better decisions.",
    body: [
      "Reports help staff understand membership movement, ministry activity, and operational patterns.",
      "Check report filters carefully so the information shown matches the period or area you need.",
    ],
    imageTitle: "Reports Screenshot",
    imageDescription:
      "Add a screenshot of the reports or analytics page here.",
  },
  {
    id: "system-logs-guide",
    title: "System Logs",
    heading: "Reviewing System Logs",
    description:
      "Use logs to understand what actions were taken and when they happened.",
    body: [
      "System logs are helpful when reviewing activity, checking changes, or confirming who performed an action.",
      "Use them carefully when investigating missing records, unexpected edits, or other issues.",
    ],
    imageTitle: "System Logs Screenshot",
    imageDescription:
      "Add a screenshot of the system logs page here.",
  },
  {
    id: "admin-accounts-guide",
    title: "Admin Accounts",
    heading: "Managing Admin Accounts",
    description:
      "Keep admin access organized and make sure only the right people can manage the system.",
    body: [
      "Admin accounts should only be given to trusted users with proper responsibilities.",
      "Review account roles and access needs carefully before creating or changing admin access.",
    ],
    imageTitle: "Admin Accounts Screenshot",
    imageDescription:
      "Add a screenshot of the admin accounts page here.",
  },
  {
    id: "backup-guide",
    title: "Backup Database",
    heading: "Backup and Recovery Awareness",
    description:
      "Understand the backup area so important records remain protected and recoverable when needed.",
    body: [
      "Backups help protect important data in case of unexpected problems.",
      "Only authorized staff should manage backup-related actions, and changes should be handled carefully.",
    ],
    imageTitle: "Backup Screenshot",
    imageDescription:
      "Add a screenshot of the backup database page here.",
  },
];

export default function DocumentationPage() {
  return (
    <div className="min-h-screen">
      <div className="min-w-0">
        {featureSections.map((section, index) => (
          <section
            key={section.id}
            id={section.id}
            className={`${index === 0 ? "" : "mt-16"} scroll-mt-28`}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h1
                className={`font-sans text-slate-900 ${
                  index === 0 ? "text-5xl font-semibold" : "text-4xl font-semibold"
                }`}
              >
                {section.title}
              </h1>

              <div className="flex items-center gap-2 self-start">
                <Button
                  variant="outline"
                  className="h-10 rounded-xl border-slate-200 bg-white text-slate-700 shadow-sm"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/documentation#${section.id}`,
                    );
                  }}
                >
                  <Copy className="size-4" />
                  Copy
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-10 rounded-xl border-slate-200 bg-white text-slate-500 shadow-sm"
                    >
                      <ChevronDown className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-88 rounded-2xl border-slate-200 p-2 shadow-xl"
                  >
                    <DropdownMenuItem
                      className="items-start rounded-xl px-3 py-3"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${window.location.origin}/documentation#${section.id}`,
                        );
                      }}
                    >
                      <Copy className="mt-0.5 size-5 shrink-0" />
                      <div className="space-y-1">
                        <p className="font-medium text-slate-900">Copy page</p>
                        <p className="text-sm text-slate-500">
                          Copy the direct section link
                        </p>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="my-2" />

                    <DropdownMenuItem
                      className="items-start rounded-xl px-3 py-3"
                      onClick={() => {
                        openAiPrompt("ChatGPT", section);
                      }}
                    >
                      <AiOutlineOpenAI className="mt-0.5 size-6 shrink-0" />
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <p className="font-medium text-slate-900">
                            Open in ChatGPT
                          </p>
                          <ExternalLink className="size-3.5 text-slate-400" />
                        </div>
                        <p className="text-sm text-slate-500">
                          Ask ChatGPT about this page
                        </p>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="items-start rounded-xl px-3 py-3"
                      onClick={() => {
                        openAiPrompt("Claude", section);
                      }}
                    >
                      <RiClaudeFill className="mt-0.5 size-5 shrink-0" />
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <p className="font-medium text-slate-900">
                            Open in Claude
                          </p>
                          <ExternalLink className="size-3.5 text-slate-400" />
                        </div>
                        <p className="text-sm text-slate-500">
                          Ask Claude about this page
                        </p>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="my-2" />

                    <DropdownMenuItem
                      className="items-start rounded-xl px-3 py-3"
                      onClick={() => {
                        window.print();
                      }}
                    >
                      <AiOutlineFilePdf className="mt-0.5 size-5 shrink-0" />
                      <div className="space-y-1">
                        <p className="font-medium text-slate-900">
                          Export as PDF
                        </p>
                        <p className="text-sm text-slate-500">
                          Use the print dialog to save as PDF
                        </p>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white shadow-sm">
              <ImagePlaceholder
                title={section.imageTitle}
                description={section.imageDescription}
              />
            </div>

            <div className="mt-6 max-w-4xl space-y-5">
              <p className="text-lg leading-9 text-slate-700">
                {section.description}
              </p>
              {section.body.map((paragraph) => (
                <p
                  key={paragraph}
                  className="text-lg leading-9 text-slate-700"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function ImagePlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="aspect-video bg-linear-to-br from-slate-50 via-slate-100 to-[#032a0d]/6">
      <div className="flex h-full flex-col items-center justify-center px-8 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm">
          <MonitorSmartphone className="size-7" />
        </div>
        <p className="mt-5 text-2xl font-semibold text-slate-900">{title}</p>
        <p className="mt-3 max-w-2xl text-base leading-8 text-slate-500">
          {description}
        </p>
        <div className="mt-5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500 shadow-sm">
          Replace this area with your screenshot later
        </div>
      </div>
    </div>
  );
}

function openAiPrompt(provider: "ChatGPT" | "Claude", section: (typeof featureSections)[number]) {
  const pageUrl = `${window.location.origin}/documentation#${section.id}`;
  const prompt = encodeURIComponent(
    `Please help me understand this admin guide section: ${section.title}\n\nReference: ${pageUrl}`,
  );

  const targetUrl =
    provider === "ChatGPT"
      ? `https://chatgpt.com/?q=${prompt}`
      : `https://claude.ai/new?q=${prompt}`;

  window.open(targetUrl, "_blank", "noopener,noreferrer");
}
