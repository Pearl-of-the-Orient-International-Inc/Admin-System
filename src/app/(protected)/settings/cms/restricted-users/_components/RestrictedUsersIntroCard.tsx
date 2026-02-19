"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { IconBan } from "@tabler/icons-react";
import { ExternalLinkIcon } from "lucide-react";
import { useState } from "react";

export const RestrictedUsersIntroCard = () => {
  const [warnPriorActivity, setWarnPriorActivity] = useState(true);
  return (
    <div>
      <p>Warning preference</p>
      <Card className="bg-transparent mt-4">
        <CardContent>
          <div className="flex items-start gap-4">
            <div className="size-8 rounded-full bg-accent flex items-center justify-center shrink-0">
              <IconBan className="size-4.5 text-muted-foreground" />
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-sm">
                You can restrict a user to deny them access to stores, orders,
                listings, and other platform features in this workspace.
              </p>
              <Button variant="outline" size="xs">
                <ExternalLinkIcon className="size-3.5" />
                Learn more about restricting users
              </Button>
            </div>
          </div>
          <div className="flex items-start gap-3 mt-5">
            <Checkbox
              id="restrict-warn-prior"
              checked={warnPriorActivity}
              onCheckedChange={(checked) =>
                setWarnPriorActivity(checked === true)
              }
              className="mt-0.5"
            />
            <div className="space-y-1">
              <Label
                htmlFor="restrict-warn-prior"
                className="text-sm font-normal cursor-pointer"
              >
                Warn me when a restricted user is found to have prior activity on this workspace
              </Label>
              <p className="text-xs text-muted-foreground">
                Before you restrict someone, we’ll warn you if they have
                previously had a role in this workspace. This can help you avoid restricting someone who may have important access. You can turn this warning off, but we recommend keeping it on to prevent mistakes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
