"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { IconClockHour4 } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { SaveIcon } from "lucide-react";
import { TimePicker } from "@/components/TimePicker";
import { Badge } from "@/components/ui/badge";

export type OfficeHour = {
  day: string;
  timeStart: string | null;
  timeEnd: string | null;
  isOpen: boolean;
};

const defaultDays: OfficeHour[] = [
  { day: "Monday", timeStart: "08:00", timeEnd: "17:00", isOpen: true },
  { day: "Tuesday", timeStart: "08:00", timeEnd: "17:00", isOpen: true },
  { day: "Wednesday", timeStart: "08:00", timeEnd: "17:00", isOpen: true },
  { day: "Thursday", timeStart: "08:00", timeEnd: "17:00", isOpen: true },
  { day: "Friday", timeStart: "08:00", timeEnd: "17:00", isOpen: true },
  { day: "Saturday", timeStart: "08:00", timeEnd: "13:00", isOpen: true },
  { day: "Sunday", timeStart: "08:00", timeEnd: "13:00", isOpen: false },
];

export const OfficeHoursCard = () => {
  const [hours, setHours] = useState<OfficeHour[]>(defaultDays);

  const handleToggle = (index: number, value: boolean) => {
    setHours((prev) =>
      prev.map((h, i) =>
        i === index
          ? {
              ...h,
              isOpen: value,
            }
          : h,
      ),
    );
  };

  const handleTimeChange = (
    index: number,
    field: "timeStart" | "timeEnd",
    value: string,
  ) => {
    setHours((prev) =>
      prev.map((h, i) =>
        i === index
          ? {
              ...h,
              [field]: value || null,
            }
          : h,
      ),
    );
  };

  const anyWeekendOpen = hours.some(
    (h) => (h.day === "Saturday" || h.day === "Sunday") && h.isOpen,
  );

  return (
    <div>
      <p>General details</p>
      <Card className="bg-transparent mt-4">
        <CardContent>
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-start gap-4 flex-1">
              <div className="size-8 rounded-full bg-accent flex items-center justify-center shrink-0">
                <IconClockHour4 className="size-4.5 text-muted-foreground" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm">Business schedule</p>
                <p className="text-xs text-muted-foreground">
                  Configure when your office is open so people know when to
                  expect a response.
                </p>
              </div>
            </div>
            {anyWeekendOpen && (
              <Badge variant="success">Weekend support enabled</Badge>
            )}
          </div>

          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Day</TableHead>
                  <TableHead className="w-32">Open</TableHead>
                  <TableHead className="w-32">Start time</TableHead>
                  <TableHead className="w-32">End time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hours.map((h, index) => (
                  <TableRow key={h.day}>
                    <TableCell className="font-medium">{h.day}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={h.isOpen}
                          onCheckedChange={(v) => handleToggle(index, v)}
                        />
                        <span className="text-xs text-muted-foreground">
                          {h.isOpen ? "Open" : "Closed"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <TimePicker
                        value={h.timeStart ?? ""}
                        onChange={(val) =>
                          handleTimeChange(index, "timeStart", val)
                        }
                        disabled={!h.isOpen}
                        wrapperClassName="w-full"
                        step={60}
                      />
                    </TableCell>
                    <TableCell>
                      <TimePicker
                        value={h.timeEnd ?? ""}
                        onChange={(val) =>
                          handleTimeChange(index, "timeEnd", val)
                        }
                        disabled={!h.isOpen}
                        wrapperClassName="w-full"
                        step={60}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Button className="flex justify-end ml-auto mt-4" size="xs">
            <SaveIcon className="size-3.5" />
            Save changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
