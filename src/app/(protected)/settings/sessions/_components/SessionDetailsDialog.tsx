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
import { ExternalLink, Globe } from "lucide-react";

interface Session {
  id: string;
  device: string;
  browser: string;
  location: string;
  ipAddress: string;
  lastActive: string;
  isCurrent: boolean;
  signedIn?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface SessionDetailsDialogProps {
  session: Session;
  onOpenChange?: (session: Session) => void;
}

const getMapUrl = (coordinates?: { lat: number; lng: number }) => {
  if (!coordinates) return null;

  const { lat, lng } = coordinates;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.1},${lat - 0.1},${lng + 0.1},${lat + 0.1}&layer=mapnik&marker=${lat},${lng}`;
};

export const SessionDetailsDialog = ({
  session,
  onOpenChange,
}: SessionDetailsDialogProps) => {
  return (
    <Dialog onOpenChange={() => onOpenChange?.(session)}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <ExternalLink className="h-4 w-4" />
          View Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {session.ipAddress}
          </DialogTitle>
          <DialogDescription>
            {session.isCurrent ? "Your current session" : "Session details"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Session Status */}
          {session.isCurrent && (
            <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-green-700 dark:text-green-500">
                Seen in PH
              </span>
            </div>
          )}

          {/* Device Information */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Device:</h4>
            <p className="text-sm">{session.browser}</p>
          </div>

          <Separator />

          {/* Last Location */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Last location:</h4>
            <p className="text-sm">{session.location}</p>
          </div>

          <Separator />

          {/* Signed In */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Signed in:</h4>
            <p className="text-sm">
              {session.signedIn}
              <br />
              {session.location}
            </p>
          </div>

          {/* Map */}
          {session.coordinates && (
            <div className="rounded-lg overflow-hidden border">
              <iframe
                src={getMapUrl(session.coordinates) || ""}
                width="100%"
                height="256"
                style={{ border: 0 }}
                loading="lazy"
                title="Session location map"
                className="w-full"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
