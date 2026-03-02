import {
  Building2,
  CheckCircle2,
  ShieldCheck,
  UserRoundCheck,
  XCircle,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Office } from "./office-data"

type OfficeStatsOverviewProps = {
  offices: Office[]
}

export function OfficeStatsOverview({ offices }: OfficeStatsOverviewProps) {
  const totalOffices = offices.length
  const activeOffices = offices.filter((office) => office.status === "Active").length
  const inactiveOffices = totalOffices - activeOffices
  const officesWithHead = offices.filter((office) => office.head.trim().length > 0).length
  const activeRate =
    totalOffices > 0 ? Math.round((activeOffices / totalOffices) * 100) : 0

  const items = [
    {
      title: "Total Offices",
      value: totalOffices,
      subtitle: "Defined office posts",
      icon: Building2,
      tone: "text-blue-700 bg-blue-700/10 dark:text-blue-300 dark:bg-blue-300/10",
    },
    {
      title: "Active Offices",
      value: activeOffices,
      subtitle: `${activeRate}% currently active`,
      icon: CheckCircle2,
      tone: "text-emerald-700 bg-emerald-700/10 dark:text-emerald-300 dark:bg-emerald-300/10",
    },
    {
      title: "Inactive Offices",
      value: inactiveOffices,
      subtitle: "Needs follow-up and reassignment",
      icon: XCircle,
      tone: "text-amber-700 bg-amber-700/10 dark:text-amber-300 dark:bg-amber-300/10",
    },
    {
      title: "Heads Assigned",
      value: officesWithHead,
      subtitle: "Offices with designated leaders",
      icon: UserRoundCheck,
      tone: "text-violet-700 bg-violet-700/10 dark:text-violet-300 dark:bg-violet-300/10",
    },
  ]

  return (
    <Card className="overflow-hidden bg-transparent">
      <CardHeader className="border-b bg-muted/20 pb-4">
        <CardTitle>Office Summary</CardTitle>
        <CardDescription>
          Quick snapshot of your organizational structure health.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon

          return (
            <div
              key={item.title}
              className="rounded-lg border bg-card p-4 shadow-xs transition-colors hover:border-primary"
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="text-muted-foreground text-xs font-medium uppercase">
                  {item.title}
                </p>
                <span className={`rounded-md p-1.5 ${item.tone}`}>
                  <Icon className="size-4" />
                </span>
              </div>
              <p className="text-2xl font-semibold tracking-tight">{item.value}</p>
              <p className="text-muted-foreground mt-1 text-xs">{item.subtitle}</p>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
