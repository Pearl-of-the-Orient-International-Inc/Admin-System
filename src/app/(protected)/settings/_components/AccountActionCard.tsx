import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOutIcon } from "lucide-react";

export const AccountActionCard = () => {
  return (
    <div>
      <p>Account actions</p>
      <Card className="bg-transparent border-destructive mt-4">
        <CardContent className="space-y-8">
          {/* Sign out Section */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className="flex-1">
                <p className="text-sm">Sign out</p>
                <p className="text-xs text-muted-foreground">
                  You can safely sign out from the current session and choose to
                  sign back in later.
                </p>
              </div>
            </div>
            <Button variant="outline" size="xs">
              <LogOutIcon className="size-3" />
              Sign out
            </Button>
          </div>

          {/* Delete Section */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className="flex-1">
                <p className="text-sm">Delete account</p>
                <p className="text-xs text-muted-foreground">
                  By deleting your personal account, you delete all associated
                  data. Think before acting, there&apos;s no turning back!
                </p>
              </div>
            </div>
            <Button variant="destructive" size="xs">
              Delete account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
