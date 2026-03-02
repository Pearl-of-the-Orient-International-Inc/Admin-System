"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, ChevronsUpDown, Save, User } from "lucide-react";

import { RichTextEditor } from "@/components/rich-text-editor/Editor";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Office, OfficeStatus } from "./office-data";
import { organizationUsers } from "./office-users";
import { Textarea } from "@/components/ui/textarea";

type OfficeFormMode = "create" | "update";

type OfficeFormProps = {
  mode: OfficeFormMode;
  initialOffice?: Office;
  officeId?: string;
};

type OfficeFormState = {
  officeTitle: string;
  head: string;
  department: string;
  status: OfficeStatus;
  jobDescription: string;
  qualifications: string;
  dutiesAndResponsibilities: string;
};

const emptyForm: OfficeFormState = {
  officeTitle: "",
  head: "",
  department: "",
  status: "Active",
  jobDescription: "",
  qualifications: "",
  dutiesAndResponsibilities: "",
};

export function OfficeForm({ mode, initialOffice, officeId }: OfficeFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [userPickerOpen, setUserPickerOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(() => {
    if (!initialOffice) return "";
    return (
      organizationUsers.find((user) => user.name === initialOffice.head)?.id ??
      ""
    );
  });
  const [form, setForm] = useState<OfficeFormState>(() => {
    if (!initialOffice) return emptyForm;

    return {
      officeTitle: initialOffice.officeTitle,
      head: initialOffice.head,
      department: initialOffice.department,
      status: initialOffice.status,
      jobDescription: initialOffice.jobDescription,
      qualifications:
        (initialOffice as Office & { qualifications?: string })
          .qualifications ?? initialOffice.obligations,
      dutiesAndResponsibilities: initialOffice.dutiesAndResponsibilities,
    };
  });

  const selectedUser = useMemo(
    () => organizationUsers.find((user) => user.id === selectedUserId) ?? null,
    [selectedUserId],
  );

  const setField = <K extends keyof OfficeFormState>(
    key: K,
    value: OfficeFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const isInvalid = useMemo(
    () =>
      !form.officeTitle.trim() ||
      !form.head.trim() ||
      !form.jobDescription.trim() ||
      !form.qualifications.trim() ||
      !form.dutiesAndResponsibilities.trim(),
    [form],
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    toast({
      variant: "success",
      title: mode === "create" ? "Office created" : "Office updated",
      description:
        mode === "create"
          ? "The office form has been submitted."
          : `Updates for ${officeId ?? "this office"} have been submitted.`,
    });

    router.push("/organizational-structure");
  };

  return (
    <section className="space-y-5">
      <div className="flex items-start gap-3">
        <Button asChild variant="outline" size="icon">
          <Link href="/organizational-structure">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {mode === "create" ? "Create Office" : "Update Office"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {mode === "create"
              ? "Register a new office under Pearl of the Orient."
              : "Update office title, leadership, and role details."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-10 relative space-y-5">
        <div className="relative min-h-9 isolate">
          <Popover open={userPickerOpen} onOpenChange={setUserPickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="absolute top-0.5 left-0.5 overflow-hidden"
                aria-expanded={userPickerOpen}
              >
                <User className="size-4" />
                {selectedUser
                  ? `${selectedUser.name} (${selectedUser.role})`
                  : form.head || "Select user"}
                <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-[--radix-popover-trigger-width] p-0"
            >
              <Command>
                <CommandInput placeholder="Search users..." />
                <CommandList>
                  <CommandEmpty>No users found.</CommandEmpty>
                  <CommandGroup>
                    {organizationUsers.map((user) => (
                      <CommandItem
                        key={user.id}
                        value={`${user.name} ${user.email} ${user.role}`}
                        onSelect={() => {
                          setSelectedUserId(user.id);
                          setField("head", user.name);
                          setUserPickerOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "size-4",
                            selectedUserId === user.id
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        <div className="flex flex-col">
                          <span>{user.name}</span>
                          <span className="text-muted-foreground text-xs">
                            {user.email} - {user.role}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <Textarea
          name="office-title"
          id="office-title"
          maxLength={180}
          className="text-4xl! font-semibold tracking-tight border-none ring-0! bg-transparent! px-0 resize-none shadow-none"
          placeholder="e.g. Provincial Chaplain Director"
          onChange={(event) => setField("officeTitle", event.target.value)}
          value={form.officeTitle}
        />

        <div className="space-y-2">
          <Label>Job Description</Label>
          <RichTextEditor
            value={form.jobDescription}
            onChange={(value) => setField("jobDescription", value)}
            placeholder="Describe this office role."
          />
        </div>

        <div className="space-y-2">
          <Label>Duties and Responsibilities</Label>
          <RichTextEditor
            value={form.dutiesAndResponsibilities}
            onChange={(value) => setField("dutiesAndResponsibilities", value)}
            placeholder="List duties and responsibilities."
          />
        </div>

        <div className="space-y-2">
          <Label>Qualifications</Label>
          <RichTextEditor
            value={form.qualifications}
            onChange={(value) => setField("qualifications", value)}
            placeholder="Define qualifications."
          />
        </div>

        <div className="flex justify-end items-center gap-2 sticky bottom0 py-4 bg-background isolate after:absolute after:bottom-full after:w-full after:h-10 after:bg-linear-to-t after:from-background after:to-transparent after:-z-10 after:pointer-events-none">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/organizational-structure")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isInvalid}>
            <Save className="size-4" />
            {mode === "create" ? "Create Office" : "Save Changes"}
          </Button>
        </div>
      </form>
    </section>
  );
}
