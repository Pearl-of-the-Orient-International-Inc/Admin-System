import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  ExternalLink,
  Clock,
  Database,
  Shield,
  LayoutPanelLeft,
  ChartColumn,
  Megaphone,
} from "lucide-react";
import { CookieDetail } from "@/types/cookie";

interface CookieDetailsDialogProps {
  category: string;
  cookies: CookieDetail[];
}

export const CookieDetailsDialog = ({
  category,
  cookies,
}: CookieDetailsDialogProps) => {
  const getIcons = () => {
    switch (category) {
      case "Essential Cookies":
        return <Database className="size-5" />;
      case "Functional Cookies":
        return <LayoutPanelLeft className="size-5" />;
      case "Analytics Cookies":
        return <ChartColumn className="size-5" />;
      case "Marketing Cookies":
        return <Megaphone className="size-5" />;
    }
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="xs">
          <ExternalLink className="size-3.5" />
          View Details
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-xl!'>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getIcons()}
            {category}
          </DialogTitle>
          <DialogDescription>
            Detailed information about cookies in this category
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {cookies.map((cookie, index) => (
            <div key={index} className="space-y-3">
              {index > 0 && <Separator />}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm">{cookie.name}</h4>
                  <Badge variant="outline" className="text-xs">
                    {cookie.type}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground">
                  {cookie.purpose}
                </p>

                <div className="grid grid-cols-2 mt-3 gap-4 text-sm">
                  <div className="flex items-start gap-2">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="font-medium text-xs">{cookie.duration}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Provider</p>
                      <p className="font-medium text-xs">{cookie.provider}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
