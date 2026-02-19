import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Settings } from "lucide-react";

interface CookiePreferencesProps {
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onSavePreferences: () => void;
  hasChanges: boolean;
}

export const CookiePreferences = ({
  onAcceptAll,
  onRejectAll,
  onSavePreferences,
  hasChanges,
}: CookiePreferencesProps) => {
  return (
    <Card className="bg-transparent border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="size-5" />
          Cookie Preferences
        </CardTitle>
        <CardDescription>
          Choose how you want us to use cookies on your device
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Button size="xs" onClick={onAcceptAll}>
            <Check className="size-3.5" />
            Accept All
          </Button>
          <Button size="xs" onClick={onRejectAll} variant="outline">
            <X className="size-3.5" />
            Reject Optional
          </Button>
          <Button size="xs"
            onClick={onSavePreferences}
            variant="secondary"
            disabled={!hasChanges}
          >
            Save Preferences
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
