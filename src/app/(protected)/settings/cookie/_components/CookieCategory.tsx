import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { CookieDetailsDialog } from "./CookieDetailsDialog";
import { CookieDetail } from "@/types/cookie";

interface CookieCategoryProps {
  title: string;
  description: string;
  isRequired?: boolean;
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  cookieCount: number;
  cookies: CookieDetail[];
}

export const CookieCategory = ({
  title,
  description,
  isRequired = false,
  isEnabled,
  onToggle,
  cookieCount,
  cookies,
}: CookieCategoryProps) => {
  return (
    <Card className="bg-transparent">
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{title}</CardTitle>
              {isRequired && (
                <Badge variant="secondary" className="text-xs">
                  Required
                </Badge>
              )}
              <span className="px-2 py-1 text-xs rounded-full dark:bg-green-500/10 dark:text-green-500 bg-green-700/10 text-green-700">
                {cookieCount} {cookieCount === 1 ? "cookie" : "cookies"}
              </span>
            </div>
            <CardDescription>{description}</CardDescription>
          </div>
          <Switch
            checked={isEnabled}
            onCheckedChange={onToggle}
            disabled={isRequired}
            className="ml-4"
          />
        </div>
        <CookieDetailsDialog category={title} cookies={cookies} />
      </CardContent>
    </Card>
  );
};
