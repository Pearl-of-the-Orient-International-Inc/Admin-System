"use client";

import { Frown, List, Meh, SmilePlus } from "lucide-react";

const anchors = [
  { label: "Introduction", id: "welcome" },
  { label: "Getting Around", id: "getting-around" },
  { label: "Dashboard", id: "dashboard-guide" },
  { label: "Members", id: "members-guide" },
  { label: "News and Blogs", id: "news-and-blogs-guide" },
  { label: "Events", id: "events-guide" },
  { label: "Admin Accounts", id: "admin-accounts-guide" },
];

export function DocumentationRightPanel() {
  return (
    <aside className="hidden w-56 shrink-0 py-2 lg:block">
      <div className="sticky top-10">
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
            <List className="h-3.5 w-3.5" />
            On This Page
          </div>
          <ul className="space-y-1">
            {anchors.map((anchor, index) => (
              <li key={anchor.id}>
                <a
                  href={`#${anchor.id}`}
                  className={`block rounded px-2 py-1 text-sm transition-colors ${
                    index === 0
                      ? "bg-[#032a0d]/8 text-[#032a0d]"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {anchor.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-3 text-sm text-gray-500">Was this helpful?</p>
          <div className="flex gap-1.5">
            {[SmilePlus, Meh, Frown].map((Icon, index) => (
              <button
                key={index}
                type="button"
                className="rounded-md border border-gray-200 p-1.5 text-gray-400 transition-colors hover:border-gray-300 hover:text-gray-600"
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
