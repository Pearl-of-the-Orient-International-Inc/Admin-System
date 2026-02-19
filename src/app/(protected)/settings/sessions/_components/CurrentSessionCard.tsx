import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

interface SessionInfo {
  id?: string;
  ipAddress?: string;
  createdAt?: string;
  expiredAt?: string;
}

interface CurrentSessionCardProps {
  session: SessionInfo | null | undefined;
}

export const CurrentSessionCard = ({ session }: CurrentSessionCardProps) => {
  return (
    <Card className="bg-transparent">
      <CardHeader>
        <CardTitle>Current Session</CardTitle>
        <CardDescription>Information about your active session</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Session ID</p>
            <p className="font-mono text-sm break-all">
              {session?.id || "N/A"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">IP Address</p>
            <p className="font-mono text-sm">{session?.ipAddress || "N/A"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Started</p>
            <p className="text-sm">
              {session?.createdAt
                ? new Date(session.createdAt).toLocaleString()
                : "N/A"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Expires</p>
            <p className="text-sm">
              {session?.expiredAt ? (
                <>
                  {new Date(session.expiredAt).toLocaleString()}{" "}
                  <span className="text-muted-foreground">
                    (
                    {formatDistanceToNow(new Date(session.expiredAt), {
                      addSuffix: true,
                    })}
                    )
                  </span>
                </>
              ) : (
                "N/A"
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
