/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlignLeft,
  ArrowLeft,
  Camera,
  Check,
  ChevronsUpDownIcon,
  Globe2,
  ImageIcon,
  Link2,
  LoaderCircle,
  MapPin,
  Save,
  Sparkles,
  Tag,
  User,
  UserPlus,
  Video,
  X,
} from "lucide-react";

import {
  EventCategory,
  EventMeetingPlatform,
  MemberStatus,
  EventType,
  EventVisibility,
} from "@/enums";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { toApiError } from "@/lib/http-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  eventCategoryOptions,
  eventTypeOptions,
  eventVisibilityOptions,
  getEventMeetingPlatformLabel,
  inferMeetingPlatform,
  type EventRecord,
} from "./events-data";
import {
  useCreateEventMutation,
  useEventByIdQuery,
  useUpdateEventMutation,
  useUploadEventThumbnailMutation,
} from "@/features/events/event.hooks";
import { useMembersQuery } from "@/features/members/member.hooks";

type EventFormMode = "create" | "update";
type EventFormProps = { mode: EventFormMode; eventId?: string };

type EventFormState = {
  name: string;
  category: EventCategory;
  type: EventType;
  location: string;
  onlineLink: string;
  meetingPlatform: EventMeetingPlatform | "";
  meetingId: string;
  meetingPassword: string;
  description: string;
  thumbnailUrl: string;
  organizer: string;
  startsAt: string;
  endsAt: string;
  visibility: EventVisibility;
};

const emptyForm: EventFormState = {
  name: "",
  category: EventCategory.CONFERENCE,
  type: EventType.ONSITE,
  location: "",
  onlineLink: "",
  meetingPlatform: "",
  meetingId: "",
  meetingPassword: "",
  description: "",
  thumbnailUrl: "",
  organizer: "",
  startsAt: "",
  endsAt: "",
  visibility: EventVisibility.PUBLIC,
};

const surfaceClass =
  "border-border/60 bg-accent/30 text-foreground shadow-none backdrop-blur-sm";
const fieldClass =
  "border-border/60 bg-background/70 text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/30";

const visibilityMeta: Record<
  EventVisibility,
  {
    label: string;
    description: string;
    icon: typeof Globe2;
  }
> = {
  [EventVisibility.PUBLIC]: {
    label: "Public",
    description: "Shown on your calendar and eligible to be featured.",
    icon: Globe2,
  },
  [EventVisibility.PRIVATE]: {
    label: "Private",
    description: "Unlisted. Only people with the link can register.",
    icon: Sparkles,
  },
};

const toDatetimeLocalValue = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
};

const mapEventToFormState = (event: EventRecord | null): EventFormState =>
  event
    ? {
        name: event.name,
        category: event.category,
        type: event.type,
        location: event.location ?? "",
        onlineLink: event.onlineLink ?? "",
        meetingPlatform: event.meetingPlatform ?? "",
        meetingId: event.meetingId ?? "",
        meetingPassword: event.meetingPassword ?? "",
        description: event.description,
        thumbnailUrl: event.thumbnailUrl,
        organizer: event.organizer,
        startsAt: toDatetimeLocalValue(event.startsAt),
        endsAt: toDatetimeLocalValue(event.endsAt),
        visibility: event.visibility,
      }
    : emptyForm;

const buildEventPayload = (form: EventFormState) => ({
  name: form.name.trim(),
  category: form.category,
  type: form.type,
  location:
    form.type === EventType.ONSITE ? form.location.trim() || undefined : undefined,
  onlineLink:
    form.type === EventType.ONLINE ? form.onlineLink.trim() || undefined : undefined,
  meetingId:
    form.type === EventType.ONLINE ? form.meetingId.trim() || undefined : undefined,
  meetingPassword:
    form.type === EventType.ONLINE
      ? form.meetingPassword.trim() || undefined
      : undefined,
  description: form.description.trim(),
  thumbnailUrl: form.thumbnailUrl.trim(),
  organizer: form.organizer.trim(),
  startsAt: new Date(form.startsAt).toISOString(),
  endsAt: new Date(form.endsAt).toISOString(),
  visibility: form.visibility,
});

const getTimezoneOffsetLabel = () => {
  const minutes = new Date().getTimezoneOffset();
  const absolute = Math.abs(minutes);
  const sign = minutes <= 0 ? "+" : "-";
  return `GMT${sign}${String(Math.floor(absolute / 60)).padStart(2, "0")}:${String(absolute % 60).padStart(2, "0")}`;
};

const eventErrorFieldLabels: Record<string, string> = {
  startsAt: "Start schedule",
  endsAt: "End schedule",
};

const getEventApiErrorMessage = (error: unknown) => {
  const apiError = toApiError(error);
  const issueMessage = apiError.errors
    ?.map((issue) => {
      const label = eventErrorFieldLabels[issue.path] ?? issue.path;
      return label ? `${label}: ${issue.message}` : issue.message;
    })
    .join(", ");

  return issueMessage || apiError.message || "Unable to process the event form right now.";
};

export function EventForm({ mode, eventId }: EventFormProps) {
  return <EventFormEditor mode={mode} eventId={eventId} />;
}

function getInitials(fullName: string) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function EventFormEditor({
  mode,
  eventId,
}: {
  mode: EventFormMode;
  eventId?: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const eventQuery = useEventByIdQuery(eventId ?? "", mode === "update");
  const membersQuery = useMembersQuery({
    limit: 100,
    status: MemberStatus.APPROVED,
  });
  const createEventMutation = useCreateEventMutation();
  const updateEventMutation = useUpdateEventMutation();
  const uploadThumbnailMutation = useUploadEventThumbnailMutation();
  const [form, setForm] = useState<EventFormState>(emptyForm);
  const [selectedTaggedMemberIds, setSelectedTaggedMemberIds] = useState<string[]>([]);
  const [taggedMemberPickerOpen, setTaggedMemberPickerOpen] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [thumbnailFileName, setThumbnailFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isSubmitting =
    createEventMutation.isPending || updateEventMutation.isPending;
  const isUploadingThumbnail = uploadThumbnailMutation.isPending;

  useEffect(() => {
    if (!eventQuery.data) return;

    const nextForm = mapEventToFormState(eventQuery.data);
    setForm(nextForm);
    setSelectedTaggedMemberIds(
      eventQuery.data.taggedMembers.map((item) => item.memberId),
    );
    setThumbnailPreview(nextForm.thumbnailUrl);
    setThumbnailFileName("");
  }, [eventQuery.data]);

  useEffect(() => {
    return () => {
      if (thumbnailPreview.startsWith("blob:")) {
        URL.revokeObjectURL(thumbnailPreview);
      }
    };
  }, [thumbnailPreview]);

  const timezoneLabel = useMemo(() => getTimezoneOffsetLabel(), []);
  const timezoneName = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    [],
  );
  const selectedVisibility = visibilityMeta[form.visibility];
  const selectableMembers = useMemo(
    () => membersQuery.data?.data ?? [],
    [membersQuery.data?.data],
  );
  const selectedTaggedMembers = useMemo(
    () =>
      selectedTaggedMemberIds
        .map((memberId) => selectableMembers.find((member) => member.id === memberId))
        .filter(Boolean),
    [selectableMembers, selectedTaggedMemberIds],
  );
  const effectiveMeetingPlatform = useMemo(() => {
    if (form.type !== EventType.ONLINE) return null;
    return (
      inferMeetingPlatform(form.onlineLink) ?? (form.meetingPlatform || null)
    );
  }, [form.meetingPlatform, form.onlineLink, form.type]);
  const supportsMeetingCredentials =
    effectiveMeetingPlatform === EventMeetingPlatform.ZOOM ||
    effectiveMeetingPlatform === EventMeetingPlatform.GOOGLE_MEET ||
    effectiveMeetingPlatform === EventMeetingPlatform.MICROSOFT_TEAMS;
  const scheduleError = useMemo(() => {
    if (!form.startsAt && !form.endsAt) return "";
    if (!form.startsAt || !form.endsAt) {
      return "Start and end schedule are required.";
    }

    const startsAt = new Date(form.startsAt);
    const endsAt = new Date(form.endsAt);

    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
      return "Enter a valid start and end schedule.";
    }

    if (endsAt <= startsAt) {
      return "End schedule must be after the start schedule.";
    }

    return "";
  }, [form.endsAt, form.startsAt]);

  const setField = <K extends keyof EventFormState>(
    key: K,
    value: EventFormState[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleTypeChange = (value: EventType) =>
    setForm((prev) => ({
      ...prev,
      type: value,
      location: value === EventType.ONSITE ? prev.location : "",
      onlineLink: value === EventType.ONLINE ? prev.onlineLink : "",
      meetingPlatform: value === EventType.ONLINE ? prev.meetingPlatform : "",
      meetingId: value === EventType.ONLINE ? prev.meetingId : "",
      meetingPassword: value === EventType.ONLINE ? prev.meetingPassword : "",
    }));

  const handleThumbnailSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setThumbnailPreview((currentValue) => {
      if (currentValue.startsWith("blob:")) {
        URL.revokeObjectURL(currentValue);
      }
      return previewUrl;
    });
    setThumbnailFileName(file.name);
    setForm((prev) => ({ ...prev, thumbnailUrl: "" }));

    uploadThumbnailMutation.mutate(file, {
      onSuccess: (uploaded) => {
        const uploadedUrl = uploaded?.serverData.fileUrl ?? uploaded?.ufsUrl ?? "";

        if (!uploadedUrl) {
          toast({
            title: "Upload failed",
            description: "Upload completed without a usable file URL.",
            variant: "error",
          });
          return;
        }

        setThumbnailPreview((currentValue) => {
          if (currentValue.startsWith("blob:")) {
            URL.revokeObjectURL(currentValue);
          }
          return uploadedUrl;
        });
        setForm((prev) => ({ ...prev, thumbnailUrl: uploadedUrl }));
        toast({
          title: "Thumbnail uploaded",
          description: "The event cover image was uploaded successfully.",
          variant: "success",
        });
      },
      onError: (error) => {
        setThumbnailPreview((currentValue) => {
          if (currentValue.startsWith("blob:")) {
            URL.revokeObjectURL(currentValue);
          }
          return "";
        });
        setThumbnailFileName("");
        setForm((prev) => ({ ...prev, thumbnailUrl: "" }));
        toast({
          title: "Upload failed",
          description:
            toApiError(error).message ||
            "Unable to upload the event thumbnail right now.",
          variant: "error",
        });
      },
    });
  };

  const handleSubmit = async (
    submitEvent: React.FormEvent<HTMLFormElement>,
  ) => {
    submitEvent.preventDefault();

    try {
      if (scheduleError) {
        toast({
          title: "Invalid schedule",
          description: scheduleError,
          variant: "error",
        });
        return;
      }

      const payload = {
        ...buildEventPayload(form),
        taggedMemberIds: selectedTaggedMemberIds,
      };

      if (mode === "create") {
        await createEventMutation.mutateAsync(payload);
      } else if (eventId) {
        await updateEventMutation.mutateAsync({
          id: eventId,
          payload,
        });
      }

      toast({
        title: mode === "create" ? "Event created" : "Event updated",
        description:
          mode === "create"
            ? "The event was created successfully."
            : "The event changes were saved successfully.",
        variant: "success",
      });
      router.push("/events");
    } catch (error) {
      toast({
        title: mode === "create" ? "Create failed" : "Update failed",
        description: getEventApiErrorMessage(error),
        variant: "error",
      });
    }
  };

  if (mode === "update" && eventQuery.isLoading) {
    return (
      <section className="space-y-6 p-10">
        <Card>
          <CardContent className="text-muted-foreground flex min-h-40 items-center justify-center gap-2 text-sm">
            <LoaderCircle className="size-4 animate-spin" />
            Loading event details...
          </CardContent>
        </Card>
      </section>
    );
  }

  if (mode === "update" && eventQuery.isError) {
    return (
      <section className="space-y-6 p-10">
        <Card>
          <CardHeader>
            <CardTitle>Event not found</CardTitle>
            <CardDescription>
              We couldn&apos;t load the requested event record for editing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/events">
                <ArrowLeft className="size-4" />
                Back to events
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-5 p-10">
      <div className="flex items-start gap-3">
        <Button asChild variant="outline" size="icon">
          <Link href="/events">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {mode === "create" ? "Create Event" : "Update Event"}
          </h1>
          <p className="text-muted-foreground text-sm">
            Theme-aware event composer with automatic schedule status.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className={cn("p-6 md:p-8")}>
          <div className="grid gap-8 xl:grid-cols-[420px_minmax(0,1fr)]">
            <div className="space-y-5">
              <div className="relative aspect-[0.98] overflow-hidden rounded-lg border border-border/60 bg-accent/30">
                {thumbnailPreview.trim() ? (
                  <img
                    src={thumbnailPreview}
                    alt={form.name || "Event thumbnail preview"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,var(--color-accent),transparent_35%),linear-gradient(160deg,var(--color-card),var(--color-muted)_62%,var(--color-accent))]">
                    <div className="rounded-full border border-border/60 bg-background/60 p-6 backdrop-blur">
                      <ImageIcon className="size-10 text-muted-foreground" />
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute right-4 bottom-4 rounded-full border border-border/60 bg-card/90 p-3 shadow-lg transition hover:bg-accent"
                  aria-label="Upload thumbnail"
                >
                  {isUploadingThumbnail ? (
                    <LoaderCircle className="size-5 animate-spin text-foreground" />
                  ) : (
                    <Camera className="size-5 text-foreground" />
                  )}
                </button>
              </div>

              <Card className={cn(surfaceClass, "rounded-lg! py-4")}>
                <CardContent className="space-y-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-background/70 p-2">
                      <ImageIcon className="size-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Cover image
                      </p>
                      <p className="font-medium">Thumbnail upload</p>
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    id="event-thumbnail"
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingThumbnail}
                  >
                    <ImageIcon className="size-4" />
                    {isUploadingThumbnail
                      ? "Uploading thumbnail..."
                      : thumbnailFileName || "Choose thumbnail image"}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Uploads to cloud storage and saves the hosted thumbnail URL.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <Select
                  value={form.category}
                  onValueChange={(value) =>
                    setField("category", value as EventCategory)
                  }
                >
                  <SelectTrigger className="w-fit min-w-56 rounded-lg border-border/60 bg-accent/40 px-4">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {eventCategoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="ml-auto">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="min-w-40 justify-between rounded-lg border-border/60 bg-accent/40 px-4"
                      >
                        <span className="flex items-center gap-2">
                          <selectedVisibility.icon className="size-4" />
                          {selectedVisibility.label}
                        </span>
                        <ChevronsUpDownIcon className="size-4 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-72 rounded-xl bg-card p-1.5"
                    >
                      {eventVisibilityOptions.map((option) => {
                        const meta = visibilityMeta[option.value];
                        const Icon = meta.icon;
                        const isSelected = form.visibility === option.value;

                        return (
                          <DropdownMenuItem
                            key={option.value}
                            onClick={() => setField("visibility", option.value)}
                            className="rounded-lg px-3 py-3"
                          >
                            <div className="flex w-full items-start gap-3">
                              <Icon className="mt-0.5 size-4 text-muted-foreground" />
                              <div className="min-w-0 flex-1">
                                <p className="font-medium">{meta.label}</p>
                                <p className="text-xs leading-5 text-muted-foreground">
                                  {meta.description}
                                </p>
                              </div>
                              {isSelected ? (
                                <Check className="size-4 text-foreground" />
                              ) : null}
                            </div>
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <Textarea
                name="event-name"
                id="event-name"
                maxLength={150}
                placeholder="Event Name"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                className="min-h-22 resize-none border-none bg-transparent! px-0 text-4xl font-semibold tracking-tight shadow-none ring-0 focus-visible:ring-0 md:text-5xl"
              />

              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px]">
                <Card className={cn(surfaceClass, "rounded-lg! py-4")}>
                  <CardContent className="grid gap-3 px-5 md:grid-cols-[136px_minmax(0,1fr)] md:items-center">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center">
                        <span className="size-3 rounded-full bg-muted-foreground/50" />
                        <span className="h-10 w-px bg-border" />
                        <span className="size-3 rounded-full border border-muted-foreground/50" />
                      </div>
                      <div className="space-y-8 text-base font-medium">
                        <p>Start</p>
                        <p>End</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Input
                        id="event-starts-at"
                        type="datetime-local"
                        value={form.startsAt}
                        onChange={(e) => setField("startsAt", e.target.value)}
                        className={cn(fieldClass, "h-10 rounded-lg")}
                      />
                      <Input
                        id="event-ends-at"
                        type="datetime-local"
                        value={form.endsAt}
                        onChange={(e) => setField("endsAt", e.target.value)}
                        className={cn(fieldClass, "h-10 rounded-lg")}
                      />
                      {scheduleError ? (
                        <p className="text-sm font-medium text-destructive">
                          {scheduleError}
                        </p>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>

                <Card className={cn(surfaceClass, "rounded-lg! py-4")}>
                  <CardContent className="flex h-full flex-col justify-center gap-1 px-5">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Globe2 className="size-4" />
                      <span className="text-sm">Timezone</span>
                    </div>
                    <p className="text-2xl font-semibold">{timezoneLabel}</p>
                    <p className="text-sm text-muted-foreground">
                      {timezoneName}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className={cn(surfaceClass, "rounded-lg! py-4")}>
                <CardContent className="space-y-4 px-5">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full shrink-0 bg-background/70 p-2">
                      {form.type === EventType.ONLINE ? (
                        <Video className="size-4 text-muted-foreground" />
                      ) : (
                        <MapPin className="size-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xl font-semibold">Add Event Setup</p>
                      <p className="text-sm text-muted-foreground">
                        {form.type === EventType.ONLINE
                          ? "Use a virtual meeting link for online events."
                          : "Add the physical location for onsite events."}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <Select
                      value={form.type}
                      onValueChange={(value) =>
                        handleTypeChange(value as EventType)
                      }
                    >
                      <SelectTrigger className="h-12 w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {eventTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {form.type === EventType.ONLINE ? (
                      <Input
                        id="event-online-link"
                        type="url"
                        placeholder="Zoom, Google Meet, or Microsoft Teams link"
                        value={form.onlineLink}
                        onChange={(e) => {
                          const nextLink = e.target.value;
                          const nextPlatform = inferMeetingPlatform(nextLink);
                          setForm((prev) => ({
                            ...prev,
                            onlineLink: nextLink,
                            meetingPlatform:
                              nextPlatform ?? prev.meetingPlatform,
                          }));
                        }}
                        className={cn(fieldClass, "h-10 rounded-lg")}
                      />
                    ) : (
                      <Input
                        id="event-location"
                        placeholder="Event venue or physical address"
                        value={form.location}
                        onChange={(e) => setField("location", e.target.value)}
                        className={cn(fieldClass, "h-10 rounded-lg")}
                      />
                    )}
                  </div>

                  {supportsMeetingCredentials ? (
                    <div className="grid gap-3 md:grid-cols-2">
                      <Input
                        id="event-meeting-id"
                        placeholder="Meeting ID"
                        value={form.meetingId}
                        onChange={(e) => setField("meetingId", e.target.value)}
                        className={cn(fieldClass, "h-10 rounded-lg")}
                      />
                      <Input
                        id="event-meeting-password"
                        placeholder="Meeting Password"
                        value={form.meetingPassword}
                        onChange={(e) =>
                          setField("meetingPassword", e.target.value)
                        }
                        className={cn(fieldClass, "h-10 rounded-lg")}
                      />
                    </div>
                  ) : null}

                  {form.type === EventType.ONLINE ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className="border-border/60 bg-background/40"
                      >
                        <Link2 className="size-3.5" />
                        {getEventMeetingPlatformLabel(
                          effectiveMeetingPlatform,
                        ) ?? "Platform will be detected from the link"}
                      </Badge>
                      {form.visibility === EventVisibility.PRIVATE ? (
                        <Badge variant="secondary">Private link only</Badge>
                      ) : null}
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              <Card className={cn(surfaceClass, "rounded-lg! py-4")}>
                <CardContent className="space-y-3 px-5">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-background/70 p-2">
                      <AlignLeft className="size-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xl font-semibold">Add Description</p>
                      <p className="text-sm text-muted-foreground">
                        Explain what the event is about and what attendees
                        should expect.
                      </p>
                    </div>
                  </div>
                  <Textarea
                    id="event-description"
                    rows={5}
                    maxLength={4000}
                    placeholder="Write the event description here..."
                    value={form.description}
                    onChange={(e) => setField("description", e.target.value)}
                    className={cn(fieldClass, "min-h-35 rounded-lg")}
                  />
                </CardContent>
              </Card>

              <Card className={cn(surfaceClass, "rounded-lg! py-4")}>
                <CardContent className="space-y-3 px-5">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-background/70 p-2">
                      <User className="size-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xl font-semibold">
                        Organizer/Instructor
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Main owner or speaker for this event.
                      </p>
                    </div>
                  </div>
                  <Input
                    id="event-organizer"
                    placeholder="e.g. Education & Ministry"
                    value={form.organizer}
                    onChange={(e) => setField("organizer", e.target.value)}
                    className={cn(fieldClass, "h-10 rounded-lg")}
                  />
                </CardContent>
              </Card>

              <Card className={cn(surfaceClass, "rounded-lg! py-4")}>
                <CardContent className="space-y-4 px-5">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-background/70 p-2">
                      <Tag className="size-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xl font-semibold">Tag Members</p>
                      <p className="text-sm text-muted-foreground">
                        Optionally connect this event to member profiles as a
                        linked activity.
                      </p>
                    </div>
                  </div>

                  <Popover
                    open={taggedMemberPickerOpen}
                    onOpenChange={setTaggedMemberPickerOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-between rounded-lg"
                      >
                        <span className="flex items-center gap-2 truncate">
                          <UserPlus className="size-4" />
                          {selectedTaggedMemberIds.length
                            ? `${selectedTaggedMemberIds.length} member${
                                selectedTaggedMemberIds.length === 1 ? "" : "s"
                              } tagged`
                            : "Choose members to tag"}
                        </span>
                        <ChevronsUpDownIcon className="size-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-[420px] p-0">
                      <Command>
                        <CommandInput placeholder="Search approved members..." />
                        <CommandList>
                          <CommandEmpty>
                            {membersQuery.isLoading
                              ? "Loading approved members..."
                              : "No approved members found."}
                          </CommandEmpty>
                          <CommandGroup>
                            {selectableMembers.map((member) => {
                              const isSelected = selectedTaggedMemberIds.includes(
                                member.id,
                              );
                              const fullName = [
                                member.firstName,
                                member.middleInitial
                                  ? `${member.middleInitial.replace(/\.$/, "")}.`
                                  : null,
                                member.lastName,
                                member.extensionName,
                              ]
                                .filter(Boolean)
                                .join(" ");

                              return (
                                <CommandItem
                                  key={member.id}
                                  value={`${fullName} ${member.user.email}`}
                                  onSelect={() => {
                                    setSelectedTaggedMemberIds((current) =>
                                      current.includes(member.id)
                                        ? current.filter((id) => id !== member.id)
                                        : [...current, member.id],
                                    );
                                  }}
                                  className="flex items-center gap-3 py-2.5"
                                >
                                  <Avatar className="size-8">
                                    <AvatarImage
                                      src={member.user.avatar ?? undefined}
                                      alt={fullName}
                                    />
                                    <AvatarFallback>
                                      {getInitials(fullName)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate font-medium">
                                      {fullName}
                                    </p>
                                    <p className="truncate text-xs text-muted-foreground">
                                      {member.user.email}
                                    </p>
                                  </div>
                                  {isSelected ? (
                                    <Check className="size-4 shrink-0" />
                                  ) : null}
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {selectedTaggedMembers.length ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedTaggedMembers.map((member) => {
                        if (!member) return null;

                        const fullName = [
                          member.firstName,
                          member.middleInitial
                            ? `${member.middleInitial.replace(/\.$/, "")}.`
                            : null,
                          member.lastName,
                          member.extensionName,
                        ]
                          .filter(Boolean)
                          .join(" ");

                        return (
                          <Badge
                            key={member.id}
                            variant="secondary"
                            className="gap-2 rounded-full px-2 py-1"
                          >
                            <Avatar className="size-5">
                              <AvatarImage
                                src={member.user.avatar ?? undefined}
                                alt={fullName}
                              />
                              <AvatarFallback className="text-[10px]">
                                {getInitials(fullName)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="max-w-44 truncate">{fullName}</span>
                            <button
                              type="button"
                              className="rounded-full p-0.5 hover:bg-background/70"
                              onClick={() =>
                                setSelectedTaggedMemberIds((current) =>
                                  current.filter((id) => id !== member.id),
                                )
                              }
                              aria-label={`Remove ${fullName}`}
                            >
                              <X className="size-3" />
                            </button>
                          </Badge>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Leave this empty if the event should not be attached to
                      member profile activity.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-end gap-2">
            <Button
              onClick={() => router.back()}
              type="button"
              variant="outline"
              className="h-10"
            >
              <ArrowLeft className="size-4" />
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-10"
            >
              {isSubmitting ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {isSubmitting
                ? mode === "create"
                  ? "Creating..."
                  : "Saving..."
                : mode === "create"
                  ? "Create Event"
                  : "Save Changes"}
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
}
