"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { IconPercentage } from "@tabler/icons-react";
import { SaveIcon } from "lucide-react";

type CommissionCardProps = {
  commissionPercent: string;
  onCommissionChange: (value: string) => void;
};

export const CommissionCard = ({
  commissionPercent,
  onCommissionChange,
}: CommissionCardProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (v === "" || /^\d*\.?\d*$/.test(v)) {
      const num = parseFloat(v);
      if (v !== "" && (num < 0 || num > 100)) return;
      onCommissionChange(v);
    }
  };

  return (
    <div>
      <p>Commission</p>
      <Card className="bg-transparent mt-4">
        <CardContent>
          <div className="flex items-start gap-4">
            <div className="size-8 rounded-full bg-accent flex items-center justify-center shrink-0">
              <IconPercentage className="size-4.5 text-muted-foreground" />
            </div>
            <div className="flex-1 space-y-6">
              <div>
                <p className="text-sm">Commission per successful transaction</p>
                <p className="text-muted-foreground text-xs mb-2 mt-1.5">
                  Percentage taken from each successful transaction as platform
                  revenue.
                </p>
                <div className="relative">
                  <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50">
                    <IconPercentage className="size-4" />
                    <span className="sr-only">Percentage</span>
                  </div>
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={commissionPercent}
                    onChange={handleChange}
                    placeholder="e.g. 10"
                    className='peer px-9'
                  />
                </div>
                <Button className="flex justify-end ml-auto mt-4" size="xs">
                  <SaveIcon className="size-3.5" />
                  Save changes
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
