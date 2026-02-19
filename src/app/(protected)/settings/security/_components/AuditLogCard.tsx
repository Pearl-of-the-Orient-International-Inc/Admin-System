"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, ExternalLink, FileSpreadsheet } from "lucide-react";
import { format, subDays } from "date-fns";
import { cn } from "@/lib/utils";

export const AuditLogCard = () => {
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: subDays(new Date(), 90),
    to: new Date(),
  });
  const [exporting, setExporting] = useState(false);

  const handleExportCsv = () => {
    setExporting(true);
    setTimeout(() => setExporting(false), 1500);
  };

  return (
    <div>
      <p>Audit log</p>
      <Card className="bg-transparent mt-4">
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Track admin and user actions for security and compliance. Export
            activity for the last 90 days or a custom range.
          </p>

          <div className="space-y-2">
            <Label className="text-sm">Export audit log</Label>
            <p className="text-xs text-muted-foreground">
              Export your workspace activity for a selected date range (up to 90
              days).
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "min-w-60 justify-start text-left font-normal"
                    )}
                  >
                    <CalendarIcon className="size-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "MMM d, yyyy")} –{" "}
                          {format(dateRange.to, "MMM d, yyyy")}
                        </>
                      ) : (
                        format(dateRange.from, "MMM d, yyyy")
                      )
                    ) : (
                      "Pick a date range"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={(range) =>
                      range?.from &&
                      setDateRange({
                        from: range.from,
                        to: range.to ?? range.from,
                      })
                    }
                    numberOfMonths={2}
                    disabled={(date) =>
                      date > new Date() || date < subDays(new Date(), 90)
                    }
                  />
                </PopoverContent>
              </Popover>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExportCsv}
                disabled={exporting}
              >
                <FileSpreadsheet className="size-4" />
                {exporting ? "Exporting…" : "Export CSV"}
              </Button>
            </div>
          </div>

          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <Label className="text-sm font-medium">SIEM integration</Label>
            <p className="text-xs text-muted-foreground">
              Setting up a log stream for audit logs (e.g. to your SIEM) is
              currently under development.
            </p>
            <Button variant="secondary" size="xs" disabled>
              <ExternalLink className="size-3.5" />
              Configure
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
