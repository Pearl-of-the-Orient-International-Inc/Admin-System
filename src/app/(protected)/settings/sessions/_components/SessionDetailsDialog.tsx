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

const getOpenStreetMapSearchUrl = (location: string) => {
  if (!location || location.toLowerCase() === "local network") return null;
  return `https://www.openstreetmap.org/search?query=${encodeURIComponent(location)}`;
};

export const SessionDetailsDialog = ({
  session,
  onOpenChange,
}: SessionDetailsDialogProps) => {
  const mapUrl = getMapUrl(session.coordinates);
  const mapSearchUrl = getOpenStreetMapSearchUrl(session.location);

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
          {mapUrl ? (
            <div className="rounded-lg overflow-hidden border">
              <iframe
                src={mapUrl}
                width="100%"
                height="256"
                style={{ border: 0 }}
                loading="lazy"
                title="Session location map"
                className="w-full"
              />
            </div>
          ) : (
            <div className="rounded-lg border p-3 text-sm text-muted-foreground space-y-2">
              <p>
                Map preview is unavailable for this session location (e.g. local/private IP).
              </p>
              {mapSearchUrl && (
                <a
                  href={mapSearchUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-primary underline underline-offset-4"
                >
                  Open in OpenStreetMap
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
