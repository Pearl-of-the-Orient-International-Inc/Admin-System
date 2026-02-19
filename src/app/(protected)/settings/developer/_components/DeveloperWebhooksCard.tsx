"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { IconWebhook } from "@tabler/icons-react";
import { Plus, Save, Trash2 } from "lucide-react";

export type WebhookEndpoint = {
  id: string;
  url: string;
  events: string[];
  createdAt: string;
  enabled: boolean;
};

const EVENT_OPTIONS = [
  "user.created",
  "user.updated",
  "user.approved",
  "user.registered",
  "event.completed",
  "service.listed",
  "service.unlisted",
];

export const DeveloperWebhooksCard = () => {
  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newEvents, setNewEvents] = useState<string[]>(["user.created"]);

  const toggleEvent = (event: string) => {
    setNewEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event],
    );
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;
    setEndpoints((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        url: newUrl.trim(),
        events: [...newEvents],
        createdAt: new Date().toISOString().slice(0, 10),
        enabled: true,
      },
    ]);
    setNewUrl("");
    setNewEvents(["user.created"]);
    setDialogOpen(false);
  };

  const handleRemove = (id: string) => {
    setEndpoints((prev) => prev.filter((ep) => ep.id !== id));
  };

  return (
    <div>
      <p>Webhooks</p>
      <Card className="bg-transparent mt-4">
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <p className="text-sm text-muted-foreground flex-1">
              Receive HTTP callbacks when events occur in your platform (e.g.
              new users, service listed, events, announcements). Use them to sync with
              external systems or trigger automations.
            </p>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="xs">
                  <Plus className="size-3.5" />
                  Add endpoint
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add webhook endpoint</DialogTitle>
                  <DialogDescription className="text-xs">
                    Enter the URL that will receive POST requests when selected
                    events occur. We recommend using HTTPS and verifying the
                    signature header.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAdd} className="space-y-4 mt-3">
                  <div className="space-y-2">
                    <Label htmlFor="webhook-url">Endpoint URL</Label>
                    <Input
                      id="webhook-url"
                      type="url"
                      placeholder="https://your-server.com/webhooks/market"
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Events</Label>
                    <div className="flex flex-wrap gap-2">
                      {EVENT_OPTIONS.map((event) => (
                        <Badge
                          key={event}
                          variant={
                            newEvents.includes(event) ? "default" : "outline"
                          }
                          className="cursor-pointer"
                          onClick={() => toggleEvent(event)}
                        >
                          {event}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setDialogOpen(false)}
                      size="xs"
                    >
                      Cancel
                    </Button>
                    <Button size="xs" type="submit" disabled={!newUrl.trim()}>
                      <Save className="size-3.5" />
                      Add endpoint
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="rounded-lg border overflow-hidden">
            {endpoints.length === 0 ? (
              <Empty className="py-12">
                <EmptyHeader className="max-w-xl">
                  <EmptyMedia variant="icon">
                    <IconWebhook className="size-6 text-muted-foreground" />
                  </EmptyMedia>
                  <EmptyTitle>No webhook endpoints</EmptyTitle>
                  <EmptyDescription className="text-xs">
                    Add an endpoint to receive events like new users, service
                    listing, and events. Payloads are signed so you can
                    verify authenticity.
                  </EmptyDescription>
                  <Button
                    variant="outline"
                    size="xs"
                    className="mt-2"
                    onClick={() => setDialogOpen(true)}
                  >
                    <Plus className="size-3.5" />
                    Add endpoint
                  </Button>
                </EmptyHeader>
              </Empty>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="p-4">URL</TableHead>
                    <TableHead className="p-4">Events</TableHead>
                    <TableHead className="p-4">Status</TableHead>
                    <TableHead className="w-0 p-4" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {endpoints.map((ep) => (
                    <TableRow key={ep.id}>
                      <TableCell className="p-4 font-mono max-w-60 truncate">
                        {ep.url}
                      </TableCell>
                      <TableCell className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {ep.events.slice(0, 2).map((ev) => (
                            <Badge
                              key={ev}
                              variant="secondary"
                              className="font-normal"
                            >
                              {ev}
                            </Badge>
                          ))}
                          {ep.events.length > 2 && (
                            <Badge variant="outline">
                              +{ep.events.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="p-4">
                        <Badge
                          variant={ep.enabled ? "success" : "secondary"}
                          className="text-xs"
                        >
                          {ep.enabled ? "Active" : "Paused"}
                        </Badge>
                      </TableCell>
                      <TableCell className="p-4">
                        <Button
                          onClick={() => handleRemove(ep.id)}
                          variant="destructive"
                          size="xs"
                        >
                          <Trash2 className="size-3.5" />
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
