import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SmartphoneIcon } from "lucide-react";

export const MFACard = () => {
  return (
    <div>
      <p>Two-step authentication</p>
      <Card className="bg-transparent mt-4">
        <CardContent>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className="size-8 rounded-full bg-accent flex items-center justify-center">
                <SmartphoneIcon className="size-4.5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm">Authenticator app</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Increase security for your account by using multiple authentication methods. Use an authentication app to get two-factor authentication codes when prompted.
                </p>
              </div>
            </div>
            <Button variant="outline" size="xs">
              Configure
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
