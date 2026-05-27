"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen } from "lucide-react";

const quickLinks = [
  { label: "Introduction", href: "/documentation#welcome" },
  { label: "Getting Around", href: "/documentation#getting-around" },
];

const guideLinks = [
  { label: "Dashboard", href: "/documentation#dashboard-guide" },
  { label: "Members", href: "/documentation#members-guide" },
  { label: "Branch of Services", href: "/documentation#branch-services-guide" },
  {
    label: "Organizational Structure",
    href: "/documentation#organizational-structure-guide",
  },
  { label: "News and Blogs", href: "/documentation#news-and-blogs-guide" },
  { label: "Events", href: "/documentation#events-guide" },
  { label: "Prayer Requests", href: "/documentation#prayer-requests-guide" },
  { label: "Pastoral Care", href: "/documentation#pastoral-care-guide" },
  { label: "Memo and Announcements", href: "/documentation#memo-guide" },
  { label: "Reports and Analytics", href: "/documentation#reports-guide" },
  { label: "System Logs", href: "/documentation#system-logs-guide" },
  { label: "Admin Accounts", href: "/documentation#admin-accounts-guide" },
  { label: "Backup Database", href: "/documentation#backup-guide" },
];

export function DocumentationSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-65 shrink-0 flex-col overflow-y-auto border-r border-gray-200 bg-[#F8F9FB]">
      <nav className="flex-1 p-3 pt-6">
        {quickLinks.map((item, index) => {
          const isActive = pathname === "/documentation" && index === 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mb-0.5 block rounded-md px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-[#032a0d]/8 font-medium text-[#032a0d]"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {item.label}
            </Link>
          );
        })}

        <div className="mb-2 mt-6 px-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Guides
          </span>
        </div>

        {guideLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="mb-0.5 block rounded-md px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-gray-200 p-3">
        <div className="flex items-center gap-2 px-2 py-2">
          <BookOpen className="h-4 w-4 text-gray-400" />
          <span className="text-xs text-gray-400">Developed by Kyle Andre Lim</span>
        </div>
      </div>
    </aside>
  );
}
