import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export const CookiePolicyInfo = () => {
  return (
    <Card className="bg-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="size-5" />
          About Cookies
        </CardTitle>
        <CardDescription>Learn more about how we use cookies</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-2 p-4 bg-muted/50 rounded-lg">
          <AlertCircle className="size-4 text-muted-foreground mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="font-medium text-sm">What are cookies?</p>
            <p className="text-muted-foreground text-xs">
              Cookies are small text files that are placed on your device when
              you visit a website. They help us provide you with a better
              experience by remembering your preferences and understanding how
              you use our service.
            </p>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <p className="font-medium">How we use cookies:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li>To keep pastoral and admin sessions secure</li>
            <li>To remember worship and ministry workspace preferences</li>
            <li>To understand usage of seminary and chaplaincy features</li>
            <li>To improve accessibility, workflows, and member support tools</li>
          </ul>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="xs">
            <ExternalLink className="size-3.5" />
            Cookie Policy
          </Button>
          <Button variant="outline" size="xs">
            <ExternalLink className="size-3.5" />
            Privacy Policy
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
