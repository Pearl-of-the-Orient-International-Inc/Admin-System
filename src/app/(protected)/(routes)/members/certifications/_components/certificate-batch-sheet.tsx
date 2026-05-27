"use client";

import {
  Award,
  Check,
  ChevronsUpDownIcon,
  Download,
  Save,
  UserPlus,
  X,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { CertificatePreviewCard } from "./certificate-preview-card";
import { getInitials } from "./certifications.utils";
import type { CertificatePreviewItem, UploadedCertificateLayout } from "./certifications.types";

type MemberRecord = {
  id: string;
  firstName: string;
  middleInitial: string | null;
  lastName: string;
  extensionName: string | null;
  user: {
    email: string;
    avatar: string | null;
  };
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participantPickerOpen: boolean;
  onParticipantPickerOpenChange: (open: boolean) => void;
  selectedParticipantIds: string[];
  checkedParticipantIds: string[];
  selectableMembers: MemberRecord[];
  selectedParticipants: MemberRecord[];
  onToggleParticipant: (memberId: string) => void;
  onRemoveParticipant: (memberId: string) => void;
  onToggleCheckedParticipant: (memberId: string) => void;
  onSetAllCheckedParticipants: (checked: boolean) => void;
  isMembersLoading: boolean;
  uploadedLayouts: UploadedCertificateLayout[];
  selectedLayoutId: string;
  onSelectLayout: (layoutId: string) => void;
  onPrepareBatch: () => void;
  onDownloadBatch: () => void;
  isInvalid: boolean;
  isExportingPdf: boolean;
  previewItems: CertificatePreviewItem[];
};

export function CertificateBatchSheet({
  open,
  onOpenChange,
  participantPickerOpen,
  onParticipantPickerOpenChange,
  selectedParticipantIds,
  checkedParticipantIds,
  selectableMembers,
  selectedParticipants,
  onToggleParticipant,
  onRemoveParticipant,
  onToggleCheckedParticipant,
  onSetAllCheckedParticipants,
  isMembersLoading,
  uploadedLayouts,
  selectedLayoutId,
  onSelectLayout,
  onPrepareBatch,
  onDownloadBatch,
  isInvalid,
  isExportingPdf,
  previewItems,
}: Props) {
  const allSelectedParticipantsChecked =
    selectedParticipants.length > 0 &&
    selectedParticipants.every((member) => checkedParticipantIds.includes(member.id));
  const someSelectedParticipantsChecked =
    selectedParticipants.some((member) => checkedParticipantIds.includes(member.id));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-y-auto p-0 no-scrollbar max-w-full!"
      >
        <SheetHeader className="border-b px-6 py-5">
          <SheetTitle>Generate Certificate Batch</SheetTitle>
          <SheetDescription>
            Choose participants and select one uploaded certificate layout for this
            batch.
          </SheetDescription>
        </SheetHeader>

        <div className="grid gap-6 p-6 xl:grid-cols-[450px_minmax(0,1fr)]">
          <div className="space-y-5">
            <Card>
              <CardHeader>
                <CardTitle>Attendees / Participants</CardTitle>
                <CardDescription>
                  Select multiple approved members for this certificate run.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Popover
                  open={participantPickerOpen}
                  onOpenChange={onParticipantPickerOpenChange}
                >
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-between"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <UserPlus className="size-4" />
                        {selectedParticipantIds.length
                          ? `${selectedParticipantIds.length} participant${
                              selectedParticipantIds.length === 1 ? "" : "s"
                            } selected`
                          : "Choose participants"}
                      </span>
                      <ChevronsUpDownIcon className="size-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-105 p-0">
                    <Command>
                      <CommandInput placeholder="Search approved members..." />
                      <CommandList>
                        <CommandEmpty>
                          {isMembersLoading
                            ? "Loading approved members..."
                            : "No approved members found."}
                        </CommandEmpty>
                        <CommandGroup>
                          {selectableMembers.map((member) => {
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
                            const isSelected = selectedParticipantIds.includes(member.id);

                            return (
                              <CommandItem
                                key={member.id}
                                value={`${fullName} ${member.user.email}`}
                                onSelect={() => onToggleParticipant(member.id)}
                                className="flex items-center gap-3 py-2.5"
                              >
                                <Avatar className="size-8">
                                  <AvatarImage
                                    src={member.user.avatar ?? undefined}
                                    alt={fullName}
                                  />
                                  <AvatarFallback>{getInitials(fullName)}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate font-medium">{fullName}</p>
                                  <p className="truncate text-xs text-muted-foreground">
                                    {member.user.email}
                                  </p>
                                </div>
                                {isSelected ? <Check className="size-4 shrink-0" /> : null}
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {selectedParticipants.length ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3 rounded-2xl border bg-accent/10 px-3 py-2">
                      <label className="flex items-center gap-3 text-sm font-medium">
                        <Checkbox
                          checked={
                            allSelectedParticipantsChecked
                              ? true
                              : someSelectedParticipantsChecked
                                ? "indeterminate"
                                : false
                          }
                          onCheckedChange={(checked) =>
                            onSetAllCheckedParticipants(Boolean(checked))
                          }
                        />
                        Include all selected participants in this batch
                      </label>
                      <span className="text-xs text-muted-foreground">
                        {checkedParticipantIds.length} checked
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {selectedParticipants.map((member) => {
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
                            <Checkbox
                              checked={checkedParticipantIds.includes(member.id)}
                              onCheckedChange={() => onToggleCheckedParticipant(member.id)}
                              className="border-muted-foreground/50"
                            />
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
                              onClick={() => onRemoveParticipant(member.id)}
                              aria-label={`Remove ${fullName}`}
                            >
                              <X className="size-3" />
                            </button>
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No participants selected yet.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Choose Uploaded Layout</CardTitle>
                <CardDescription>
                  Select one of the uploaded certificate PDF templates.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                {uploadedLayouts.map((layout) => (
                  <button
                    key={layout.id}
                    type="button"
                    onClick={() => onSelectLayout(layout.id)}
                    className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition-all ${
                      selectedLayoutId === layout.id
                        ? "border-[#032a0d] bg-[#032a0d]/5"
                        : "border-border hover:bg-accent/20"
                    }`}
                  >
                    <div
                      className="w-24 shrink-0 overflow-hidden rounded-xl border bg-white"
                      style={{ aspectRatio: `${layout.pageWidth} / ${layout.pageHeight}` }}
                    >
                      <iframe
                        title={`${layout.name} preview`}
                        src={`${layout.previewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                        className="pointer-events-none h-full w-full bg-white"
                        tabIndex={-1}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{layout.name}</p>
                      <p className="text-xs text-muted-foreground">
                        PDF layout • {layout.namePlacement.centerXPercent.toFixed(0)}%/
                        {layout.namePlacement.centerYPercent.toFixed(0)}%
                      </p>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            <Button className="mr-2" onClick={onPrepareBatch} disabled={isInvalid}>
              <Save className="size-4" />
              Prepare certificate batch
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={onDownloadBatch}
              disabled={isInvalid || isExportingPdf}
            >
              <Download className="size-4" />
              {isExportingPdf ? "Generating PDF..." : "Download batch PDF"}
            </Button>
          </div>

          <div className="space-y-5">
            <Card className="overflow-hidden">
              <CardHeader className="border-b bg-accent/30">
                <CardTitle>Certificate Grid Preview</CardTitle>
                <CardDescription>
                  Each selected participant is shown using the actual generated certificate PDF.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {previewItems.length ? (
                  <div className="grid gap-5 md:grid-cols-2">
                    {previewItems.map((preview) => (
                      <CertificatePreviewCard key={preview.memberId} preview={preview} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-4xl border border-dashed border-[#d7cfb7] bg-[#fffdf7] px-6 py-12 text-center">
                    <Award className="mx-auto size-10 text-[#9a916f]" />
                    <p className="mt-4 text-lg font-medium text-[#3c3728]">
                      Generated PDF preview will appear here
                    </p>
                    <p className="mt-2 text-sm text-[#6b6653]">
                      Select a PDF layout and participants to preview the final generated
                      output.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
