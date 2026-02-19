import { Card, CardContent } from "@/components/ui/card";
import { MonitorIcon } from "lucide-react";
import { ThemeSwitcher } from '@/components/ThemeSwitcher';

export const PreferenceCard = () => {
  return (
    <div>
      <p>Preferences</p>
      <Card className="bg-transparent mt-4">
        <CardContent>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className="size-8 rounded-full bg-accent flex items-center justify-center">
                <MonitorIcon className="size-4.5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm">Appearance</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Select how you&apos;d like the application to appear on this device. Choose from light or dark themes, or opt to sync with your operating system&apos;s settings.
                </p>
              </div>
            </div>
            <ThemeSwitcher />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
