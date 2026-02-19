import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RevokeAllSessionsDialog } from "./RevokeAllSessionDialog";
import { SessionTableRow } from "./SessionTableRow";

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

interface ActiveSessionsCardProps {
  sessions: Session[];
  onRevokeSession: (sessionId: string) => void;
  onRevokeAllOthers: () => void;
  onSelectSession: (session: Session) => void;
}

export const ActiveSessionsCard = ({
  sessions,
  onRevokeSession,
  onRevokeAllOthers,
  onSelectSession,
}: ActiveSessionsCardProps) => {
  return (
    <Card className="bg-transparent">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Active Sessions</CardTitle>
            <CardDescription>
              Manage devices and locations where you&apos;re currently signed in
            </CardDescription>
          </div>
          <RevokeAllSessionsDialog onRevokeAll={onRevokeAllOthers} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[25%] p-4">
                  <div className="flex flex-col gap-1">
                    <span>Device & Browser</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      Device type and browser information
                    </span>
                  </div>
                </TableHead>
                <TableHead className="w-[25%] p-4">
                  <div className="flex flex-col gap-1">
                    <span>Location</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      Geographic location and IP address
                    </span>
                  </div>
                </TableHead>
                <TableHead className="w-[20%] p-4">
                  <div className="flex flex-col gap-1">
                    <span>Last Active</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      Most recent activity timestamp
                    </span>
                  </div>
                </TableHead>
                <TableHead className="w-[30%] p-4">
                  <div className="flex flex-col gap-1">
                    <span>Actions</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      View details or manage session
                    </span>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => (
                <SessionTableRow
                  key={session.id}
                  session={session}
                  onRevoke={onRevokeSession}
                  onSelectSession={onSelectSession}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
