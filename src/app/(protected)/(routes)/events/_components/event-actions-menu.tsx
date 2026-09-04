"use client";

import Link from "next/link";
import { MoreHorizontal, SquarePen, Ban, Copy, Eye, Trash2 } from "lucide-react";

import { EventStatus } from "@/enums";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { resolveEventStatus, type EventRecord } from "./events-data";

type EventActionsMenuProps = {
  event: EventRecord;
  onViewEvent?: (event: EventRecord) => void;
  onCancelEvent?: (event: EventRecord) => void;
  onDeleteEvent?: (event: EventRecord) => void;
  align?: "start" | "center" | "end";
};

export function EventActionsMenu({
  event,
  onViewEvent,
  onCancelEvent,
  onDeleteEvent,
  align = "end",
}: EventActionsMenuProps) {
  const { toast } = useToast();
  const status = resolveEventStatus(event);
  const isCancelled = status === EventStatus.CANCELLED;

  const handleCopyLink = async () => {
    try {
      const url = `${window.location.origin}/events/${event.id}`;
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied",
        description: "The event link has been copied to your clipboard.",
        variant: "success",
      });
    } catch {
      toast({
        title: "Copy failed",
        description: "Unable to copy the event link right now.",
        variant: "error",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${event.name}`}>
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-44">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        {onViewEvent ? (
          <DropdownMenuItem onClick={() => onViewEvent(event)}>
            <Eye className="size-4" />
            View details
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem onClick={handleCopyLink}>
          <Copy className="size-4" />
          Copy link
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/events/${event.id}`}>
            <SquarePen className="size-4" />
            Edit event
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onDeleteEvent?.(event)}
          disabled={!onDeleteEvent}
          variant="destructive"
        >
          <Trash2 className="size-4" />
          Delete event
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onCancelEvent?.(event)}
          disabled={isCancelled || !onCancelEvent}
          variant="destructive"
        >
          <Ban className="size-4" />
          {isCancelled ? "Cancelled" : "Cancel event"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
