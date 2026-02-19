import { Clock8Icon } from "lucide-react";
import * as React from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type TimePickerProps = {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  step?: number | string;
  className?: string;
  wrapperClassName?: string;
};

export const TimePicker = ({
  value,
  defaultValue,
  onChange,
  disabled,
  step = 60,
  className,
  wrapperClassName,
}: TimePickerProps) => {
  return (
    <div className={cn("w-full max-w-xs", wrapperClassName)}>
      <div className="relative">
        <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50">
          <Clock8Icon className="size-4" />
          <span className="sr-only">Clock</span>
        </div>
        <Input
          type="time"
          step={step}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          disabled={disabled}
          className={cn(
            "peer bg-background appearance-none pl-9 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none",
            className,
          )}
        />
      </div>
    </div>
  );
};

export default TimePicker;

