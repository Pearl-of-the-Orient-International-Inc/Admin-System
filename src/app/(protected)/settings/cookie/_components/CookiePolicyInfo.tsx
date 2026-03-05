import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PolicyDialogProps {
  title: string;
  description: string;
  triggerLabel: string;
  sections: Array<{
    heading: string;
    content: string[];
  }>;
}

const PolicyDialog = ({
  title,
  description,
  triggerLabel,
  sections,
}: PolicyDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="xs">
          <ExternalLink className="size-3.5" />
          {triggerLabel}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-3xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="border-b px-6 py-4 bg-background">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh]">
          <div className="px-6 py-5 space-y-6">
            {sections.map((section) => (
              <section key={section.heading} className="space-y-2">
                <h4 className="text-sm font-semibold">{section.heading}</h4>
                <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
                  {section.content.map((paragraph) => (
                    <p key={`${section.heading}-${paragraph.slice(0, 24)}`}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter className="border-t px-6 py-4" showCloseButton />
      </DialogContent>
    </Dialog>
  );
};

export const CookiePolicyInfo = () => {
  const cookiePolicySections = [
    {
      heading: "1. Purpose of Cookies",
      content: [
        "We use cookies to operate secure login sessions, maintain core platform stability, and support user preferences across the admin portal.",
        "Some cookies are strictly required to use protected routes, role-based modules, and account security features.",
      ],
    },
    {
      heading: "2. Types of Cookies We Use",
      content: [
        "Essential cookies: Required for authentication, CSRF protection, and secure request handling.",
        "Functional cookies: Store workspace preferences, timezone behavior, and UI personalization choices.",
        "Analytics cookies: Help us measure feature usage patterns to improve user experience and platform performance.",
      ],
    },
    {
      heading: "3. Managing Preferences",
      content: [
        "You can enable or disable optional categories at any time from this page.",
        "Essential cookies remain active because they are required for account access and platform security.",
      ],
    },
    {
      heading: "4. Retention",
      content: [
        "Cookie lifetimes vary by purpose and may persist for a session or a defined duration such as days, months, or up to one year.",
        "We periodically review cookie retention periods to keep data usage aligned with operational needs.",
      ],
    },
  ];

  const privacyPolicySections = [
    {
      heading: "1. Data We Process",
      content: [
        "We process account information, security metadata, and usage signals necessary to deliver ministry and administration features.",
        "Information may include your profile details, authentication events, and technical diagnostics related to system access.",
      ],
    },
    {
      heading: "2. Why We Process Data",
      content: [
        "To provide secure sign-in, maintain account sessions, and enforce role-based access control.",
        "To improve reliability, monitor abuse, and optimize workflows across administrative tools.",
      ],
    },
    {
      heading: "3. Security and Access",
      content: [
        "We apply safeguards including authenticated APIs, token-based session controls, and access restrictions for protected modules.",
        "Only authorized personnel and systems may access personal data needed for platform operations.",
      ],
    },
    {
      heading: "4. User Controls",
      content: [
        "You can update profile details, manage security settings, and control optional cookie categories through your account settings.",
        "For privacy requests, corrections, or account-related concerns, contact the platform administrator.",
      ],
    },
  ];

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
          <PolicyDialog
            title="Cookie Policy"
            description="How cookie technologies are used within Pearl of the Orient platform services."
            triggerLabel="Cookie Policy"
            sections={cookiePolicySections}
          />
          <PolicyDialog
            title="Privacy Policy"
            description="How we collect, use, and protect personal information across this platform."
            triggerLabel="Privacy Policy"
            sections={privacyPolicySections}
          />
        </div>
      </CardContent>
    </Card>
  );
};
