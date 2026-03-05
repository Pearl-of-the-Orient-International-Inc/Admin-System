import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CookiePreferencesProps {
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onSavePreferences: () => void;
  hasChanges: boolean;
  isSaving?: boolean;
  lastSavedAt?: string | null;
}

export const CookiePreferences = ({
  onAcceptAll,
  onRejectAll,
  onSavePreferences,
  hasChanges,
  isSaving = false,
  lastSavedAt = null,
}: CookiePreferencesProps) => {
  return (
    <Card className="bg-transparent border-2">
      <CardHeader>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CardTitle className="flex items-center gap-2">
            <Settings className="size-5" />
            Cookie Preferences
          </CardTitle>
          <Badge variant={hasChanges ? "warning" : "success"}>
            {hasChanges ? "Unsaved changes" : "Saved"}
          </Badge>
        </div>
        <CardDescription>
          Choose how you want us to use cookies on your device
        </CardDescription>
        {lastSavedAt ? (
          <p className="text-xs text-muted-foreground">
            Last updated: {new Date(lastSavedAt).toLocaleString()}
          </p>
        ) : null}
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Button size="xs" onClick={onAcceptAll} disabled={isSaving}>
            <Check className="size-3.5" />
            {isSaving ? "Saving..." : "Accept All"}
          </Button>
          <Button
            size="xs"
            onClick={onRejectAll}
            variant="outline"
            disabled={isSaving}
          >
            <X className="size-3.5" />
            Reject Optional
          </Button>
          <Button
            size="xs"
            onClick={onSavePreferences}
            variant="secondary"
            disabled={!hasChanges || isSaving}
          >
            {isSaving ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
