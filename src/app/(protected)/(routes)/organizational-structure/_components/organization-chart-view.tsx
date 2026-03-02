import { Building2 } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { OrganizationChartProfile } from "./organization-chart-data"

type OrganizationChartViewProps = {
  profile: OrganizationChartProfile
}

export function OrganizationChartView({ profile }: OrganizationChartViewProps) {
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-emerald-900/30">
        <CardHeader className="bg-emerald-900 py-6 text-center text-white">
          <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-white/10">
            <Building2 className="size-5" />
          </div>
          <CardTitle className="text-xl tracking-wide md:text-2xl">
            Organizational Structure
          </CardTitle>
          <CardDescription className="mx-auto max-w-4xl text-xs text-emerald-50 md:text-sm">
            {profile.organizationName}
          </CardDescription>
          <p className="mt-2 text-lg font-semibold">{profile.chiefChaplain}</p>
          <p className="text-emerald-100">Chief Chaplain</p>
        </CardHeader>
      </Card>

      <Card className="border-muted bg-muted/20">
        <CardContent className="space-y-8 pt-8">
          <div className="flex flex-col items-center gap-7">
            <div className="rounded-xl border-2 border-emerald-900 bg-background px-6 py-3 text-center font-semibold uppercase shadow-sm">
              Chief Chaplain
            </div>
            <div className="h-9 border-l-2 border-emerald-900" />
            <div className="grid w-full max-w-3xl gap-4 md:grid-cols-2">
              {profile.topRoles.map((role) => (
                <div
                  key={role}
                  className="rounded-xl border bg-background px-4 py-3 text-center text-sm font-semibold uppercase shadow-xs"
                >
                  {role}
                </div>
              ))}
            </div>
            <div className="h-9 border-l-2 border-emerald-900" />
          </div>

          <div className="grid gap-4 lg:grid-cols-5">
            {profile.groups.map((group) => (
              <div key={group.title} className="space-y-2">
                <div className="rounded-xl border bg-background p-3 text-center text-sm font-semibold uppercase shadow-xs">
                  {group.title}
                </div>
                <div className="space-y-2">
                  {group.items.map((item) => (
                    <div
                      key={item}
                      className="rounded-md border bg-background px-3 py-2 text-center text-sm shadow-xs"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
