import { TableCell, TableRow } from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { Monitor, Smartphone, Tablet, MapPin, Clock } from "lucide-react";
import { SessionDetailsDialog } from "./SessionDetailsDialog";
import { RevokeSessionDialog } from "./RevokeSessionDialog";
import { Badge } from "@/components/ui/badge";

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

interface SessionTableRowProps {
  session: Session;
  onRevoke: (sessionId: string) => void;
  onSelectSession: (session: Session) => void;
}

const getDeviceIcon = (device: string) => {
  if (
    device.toLowerCase().includes("iphone") ||
    device.toLowerCase().includes("android")
  ) {
    return <Smartphone className="h-5 w-5" />;
  }
  if (
    device.toLowerCase().includes("ipad") ||
    device.toLowerCase().includes("tablet")
  ) {
    return <Tablet className="h-5 w-5" />;
  }
  return <Monitor className="h-5 w-5" />;
};

export const SessionTableRow = ({
  session,
  onRevoke,
  onSelectSession,
}: SessionTableRowProps) => {
  return (
    <TableRow>
      <TableCell className="p-4">
        <div className="flex items-center gap-3">
          <div className="text-muted-foreground">
            {getDeviceIcon(session.device)}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">{session.device}</p>
              {session.isCurrent && <Badge variant="success">Current</Badge>}
            </div>
            <p className="text-xs text-muted-foreground">{session.browser}</p>
          </div>
        </div>
      </TableCell>
      <TableCell className="p-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-sm">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{session.location}</span>
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            {session.ipAddress}
          </p>
        </div>
      </TableCell>
      <TableCell className="p-4">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-sm">
            {formatDistanceToNow(new Date(session.lastActive), {
              addSuffix: true,
            })}
          </span>
        </div>
      </TableCell>
      <TableCell className="p-4">
        <div className="flex items-center gap-2">
          <SessionDetailsDialog
            session={session}
            onOpenChange={onSelectSession}
          />
          {!session.isCurrent && (
            <RevokeSessionDialog sessionId={session.id} onRevoke={onRevoke} />
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};
