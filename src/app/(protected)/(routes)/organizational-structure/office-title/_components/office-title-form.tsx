"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  PlusCircle,
  Save,
  Trash2,
  type LucideIcon,
} from "lucide-react";

import { RichTextEditor } from "@/components/rich-text-editor/Editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { OfficeTitleLevel } from "@/enums";
import { toApiError } from "@/features/auth/auth.hooks";
import {
  useCreateOfficeTitleMutation,
  useOfficeTitleByIdQuery,
  useOfficeTitlesQuery,
  useUpdateOfficeTitleMutation,
} from "@/features/office-title/office-title.hooks";
import type {
  OfficeTitleResource,
  OfficeTitleSection,
  OfficeTitleSectionType,
} from "@/features/office-title/office-title.types";
import { useToast } from "@/hooks/use-toast";

type OfficeTitleFormMode = "create" | "update";

type OfficeTitleFormProps = {
  mode: OfficeTitleFormMode;
  officeTitleId?: string;
};

type OfficeTitleSectionForm = {
  id?: string;
  title: string;
  type: OfficeTitleSectionType;
  items: { id?: string; content: string }[];
  content: string;
};

type OfficeTitleFormState = {
  name: string;
  level: OfficeTitleLevel;
  description: string;
  maxSlots: string;
  isPublic: boolean;
  sortOrder: string;
  reportsToId: string;
  sections: OfficeTitleSectionForm[];
};

const defaultSection = (): OfficeTitleSectionForm => ({
  title: "",
  type: "richtext",
  items: [{ content: "" }],
  content: "",
});

const emptyForm: OfficeTitleFormState = {
  name: "",
  level: OfficeTitleLevel.NATIONAL_CHAPLAIN_DIRECTOR,
  description: "",
  maxSlots: "",
  isPublic: false,
  sortOrder: "0",
  reportsToId: "",
  sections: [defaultSection()],
};

const sectionTypeOptions: Array<{
  value: OfficeTitleSectionType;
  label: string;
  icon: LucideIcon;
}> = [
  { value: "list", label: "List", icon: PlusCircle },
  { value: "richtext", label: "Rich Text", icon: Save },
];

const officeTitleLevelOptions: Array<{
  value: OfficeTitleLevel;
  label: string;
}> = [
  { value: OfficeTitleLevel.CHIEF_CHAPLAIN, label: "Chief Chaplain" },
  {
    value: OfficeTitleLevel.NATIONAL_CHAPLAIN_DIRECTOR,
    label: "National Chaplain Director",
  },
  {
    value: OfficeTitleLevel.REGIONAL_CHAPLAIN_DIRECTOR,
    label: "Regional Chaplain Director",
  },
  {
    value: OfficeTitleLevel.REGIONAL_DEPUTY_CHAPLAIN_DIRECTOR,
    label: "Regional Deputy Chaplain Director",
  },
  {
    value: OfficeTitleLevel.PROVINCIAL_CHAPLAIN_DIRECTOR,
    label: "Provincial Chaplain Director",
  },
  {
    value: OfficeTitleLevel.PROVINCIAL_DEPUTY_CHAPLAIN_DIRECTOR,
    label: "Provincial Deputy Chaplain Director",
  },
  { value: OfficeTitleLevel.CITY_CHAPLAIN, label: "City Chaplain" },
  { value: OfficeTitleLevel.MUNICIPAL_CHAPLAIN, label: "Municipal Chaplain" },
  {
    value: OfficeTitleLevel.CITY_MUNICIPAL_DEPUTY_CHAPLAIN,
    label: "City / Municipal Deputy Chaplain",
  },
  { value: OfficeTitleLevel.BARANGAY_CHAPLAIN, label: "Barangay Chaplain" },
  {
    value: OfficeTitleLevel.BARANGAY_DEPUTY_CHAPLAIN,
    label: "Barangay Deputy Chaplain",
  },
];

const mapOfficeTitleToFormState = (
  data: OfficeTitleResource | null,
): OfficeTitleFormState => {
  if (!data) return emptyForm;

  return {
    name: data.name,
    level: data.level,
    description: data.description ?? "",
    maxSlots: data.maxSlots === null ? "" : String(data.maxSlots),
    isPublic: data.isPublic,
    sortOrder: String(data.sortOrder),
    reportsToId: data.reportsToId ?? "",
    sections:
      data.sections?.length > 0
        ? data.sections.map((section) => ({
            id: section.id,
            title: section.title,
            type: section.type,
            items: section.items?.length ? section.items : [{ content: "" }],
            content: section.content ?? "",
          }))
        : [defaultSection()],
  };
};

export function OfficeTitleForm({ mode, officeTitleId }: OfficeTitleFormProps) {
  const officeTitleQuery = useOfficeTitleByIdQuery(
    officeTitleId ?? "",
    mode === "update",
  );

  if (mode === "update" && officeTitleQuery.isLoading) {
    return (
      <section className="space-y-5 p-10">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-36 w-full" />
      </section>
    );
  }

  const initialForm =
    mode === "update"
      ? mapOfficeTitleToFormState(officeTitleQuery.data ?? null)
      : emptyForm;

  const formKey =
    mode === "update" && officeTitleQuery.data
      ? `${officeTitleQuery.data.id}:${officeTitleQuery.data.updatedAt}`
      : "create";

  return (
    <OfficeTitleFormEditor
      key={formKey}
      mode={mode}
      officeTitleId={officeTitleId}
      initialForm={initialForm}
    />
  );
}

type OfficeTitleFormEditorProps = {
  mode: OfficeTitleFormMode;
  officeTitleId?: string;
  initialForm: OfficeTitleFormState;
};

function OfficeTitleFormEditor({
  mode,
  officeTitleId,
  initialForm,
}: OfficeTitleFormEditorProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState<OfficeTitleFormState>(initialForm);
  const officeTitlesQuery = useOfficeTitlesQuery({ page: 1, limit: 100, sortBy: "name", sortOrder: "asc" });

  const createOfficeTitleMutation = useCreateOfficeTitleMutation();
  const updateOfficeTitleMutation = useUpdateOfficeTitleMutation();

  const isSubmitting =
    createOfficeTitleMutation.isPending || updateOfficeTitleMutation.isPending;

  const isInvalid = useMemo(() => {
    if (!form.name.trim()) return true;
    if (!form.description.trim()) return true;
    if (!form.sections.length) return true;

    for (const section of form.sections) {
      if (!section.title.trim()) return true;
      if (section.type === "list") {
        const hasContent = section.items.some((item) => item.content.trim());
        if (!hasContent) return true;
      }
      if (section.type === "richtext" && !section.content.trim()) return true;
    }

    const normalizedMaxSlots = form.maxSlots.trim();
    if (normalizedMaxSlots && Number(normalizedMaxSlots) <= 0) return true;

    return false;
  }, [form]);

  const setField = <K extends keyof OfficeTitleFormState>(
    key: K,
    value: OfficeTitleFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setSectionField = <K extends keyof OfficeTitleSectionForm>(
    index: number,
    key: K,
    value: OfficeTitleSectionForm[K],
  ) => {
    setForm((prev) => {
      const nextSections = [...prev.sections];
      const current = nextSections[index];
      if (!current) return prev;

      nextSections[index] = { ...current, [key]: value };
      return { ...prev, sections: nextSections };
    });
  };

  const addSection = () => {
    setForm((prev) => ({
      ...prev,
      sections: [...prev.sections, defaultSection()],
    }));
  };

  const removeSection = (index: number) => {
    setForm((prev) => ({
      ...prev,
      sections:
        prev.sections.length <= 1
          ? prev.sections
          : prev.sections.filter((_, currentIndex) => currentIndex !== index),
    }));
  };

  const addSectionItem = (sectionIndex: number) => {
    setForm((prev) => {
      const nextSections = [...prev.sections];
      const current = nextSections[sectionIndex];
      if (!current) return prev;

      nextSections[sectionIndex] = {
        ...current,
        items: [...current.items, { content: "" }],
      };

      return { ...prev, sections: nextSections };
    });
  };

  const removeSectionItem = (sectionIndex: number, itemIndex: number) => {
    setForm((prev) => {
      const nextSections = [...prev.sections];
      const current = nextSections[sectionIndex];
      if (!current) return prev;

      if (current.items.length <= 1) return prev;

      nextSections[sectionIndex] = {
        ...current,
        items: current.items.filter(
          (_item, currentItemIndex) => currentItemIndex !== itemIndex,
        ),
      };

      return { ...prev, sections: nextSections };
    });
  };

  const setSectionItemValue = (
    sectionIndex: number,
    itemIndex: number,
    value: string,
  ) => {
    setForm((prev) => {
      const nextSections = [...prev.sections];
      const currentSection = nextSections[sectionIndex];
      if (!currentSection) return prev;

      const nextItems = [...currentSection.items];
      const currentItem = nextItems[itemIndex];
      if (!currentItem) return prev;

      nextItems[itemIndex] = { ...currentItem, content: value };
      nextSections[sectionIndex] = { ...currentSection, items: nextItems };

      return { ...prev, sections: nextSections };
    });
  };

  const toPayloadSections = (
    sections: OfficeTitleSectionForm[],
  ): OfficeTitleSection[] =>
    sections
      .map((section) => ({
        id: section.id,
        title: section.title.trim(),
        type: section.type,
        items:
          section.type === "list"
            ? section.items
                .map((item) => ({
                  id: item.id,
                  content: item.content.trim(),
                }))
                .filter((item) => Boolean(item.content))
            : undefined,
        content: section.type === "richtext" ? section.content.trim() : undefined,
      }))
      .filter((section) => Boolean(section.title));

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const normalizedMaxSlots = form.maxSlots.trim();
      const payload = {
        name: form.name.trim(),
        level: form.level,
        description: form.description.trim(),
        maxSlots: normalizedMaxSlots ? Number(normalizedMaxSlots) : null,
        sections: toPayloadSections(form.sections),
        isPublic: form.isPublic,
        sortOrder: Number(form.sortOrder || 0),
        reportsToId: form.reportsToId || null,
      };

      if (mode === "create") {
        await createOfficeTitleMutation.mutateAsync(payload);
        toast({
          title: "Office title created",
          description: "Office title has been created successfully.",
          variant: "success",
        });
      } else {
        if (!officeTitleId) return;

        await updateOfficeTitleMutation.mutateAsync({
          id: officeTitleId,
          payload,
        });
        toast({
          title: "Office title updated",
          description: "Office title changes have been saved successfully.",
          variant: "success",
        });
      }

      router.push("/organizational-structure/office-title");
    } catch (error: unknown) {
      const apiError = toApiError(error);
      toast({
        title: mode === "create" ? "Create failed" : "Update failed",
        description: apiError.message ?? "Unable to save office title right now.",
        variant: "error",
      });
    }
  };

  return (
    <section className="space-y-5 p-10">
      <div className="flex items-start gap-3">
        <Button asChild variant="outline" size="icon">
          <Link href="/organizational-structure/office-title">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {mode === "create" ? "Create Office Title" : "Update Office Title"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {mode === "create"
              ? "Create a reusable office title that can later be assigned to a member."
              : "Update office title details, limits, and reusable content sections."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <Textarea
          name="office-title-name"
          id="office-title-name"
          maxLength={100}
          className="text-4xl! font-semibold tracking-tight border-none ring-0! bg-transparent! px-0 resize-none shadow-none"
          placeholder="e.g. Humanitarian, Training & Development, Political Affairs, etc."
          value={form.name}
          onChange={(event) => setField("name", event.target.value)}
        />

        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
          <div className="space-y-2">
            <Label htmlFor="office-title-level">Office level</Label>
            <Select
              value={form.level}
              onValueChange={(value) => setField("level", value as OfficeTitleLevel)}
            >
              <SelectTrigger id="office-title-level" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {officeTitleLevelOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="office-title-max-slots">Max slots</Label>
            <Input
              id="office-title-max-slots"
              inputMode="numeric"
              placeholder="Leave blank for unlimited"
              value={form.maxSlots}
              onChange={(event) =>
                setField("maxSlots", event.target.value.replace(/[^\d]/g, ""))
              }
            />
          </div>
        </div>

        <div className="grid gap-4 rounded-xl border p-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="office-title-reports-to">Reports to</Label>
            <Select
              value={form.reportsToId || "none"}
              onValueChange={(value) => setField("reportsToId", value === "none" ? "" : value)}
            >
              <SelectTrigger id="office-title-reports-to" className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No parent office</SelectItem>
                {(officeTitlesQuery.data?.items ?? [])
                  .filter((office) => office.id !== officeTitleId)
                  .map((office) => <SelectItem key={office.id} value={office.id}>{office.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <p className="text-muted-foreground text-xs">Defines the reporting line shown on the public structure.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="office-title-sort-order">Display order</Label>
            <Input
              id="office-title-sort-order"
              inputMode="numeric"
              value={form.sortOrder}
              onChange={(event) => setField("sortOrder", event.target.value.replace(/[^\d]/g, ""))}
            />
          </div>
          <div className="flex items-center justify-between gap-4 rounded-lg bg-muted/40 px-4 py-3">
            <div>
              <Label htmlFor="office-title-public">Publish office</Label>
              <p className="text-muted-foreground text-xs">Allow this position and its approved details on the website.</p>
            </div>
            <Switch id="office-title-public" checked={form.isPublic} onCheckedChange={(value) => setField("isPublic", value)} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="office-title-description">Description</Label>
          <Textarea
            id="office-title-description"
            maxLength={1000}
            placeholder="Describe this office title and where it fits in the structure."
            value={form.description}
            onChange={(event) => setField("description", event.target.value)}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Sections</p>
              <p className="text-muted-foreground text-xs">
                Add reusable office-title sections such as qualifications, duties,
                or appointment notes.
              </p>
            </div>
            <Button type="button" variant="outline" onClick={addSection}>
              <PlusCircle className="size-4" />
              Add Section
            </Button>
          </div>

          <div className="space-y-4">
            {form.sections.map((section, sectionIndex) => (
              <div key={`section-${sectionIndex}`} className="rounded-xl border p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="grid flex-1 gap-3 md:grid-cols-[1fr_220px]">
                    <div className="space-y-1">
                      <Label>Section title</Label>
                      <Input
                        value={section.title}
                        onChange={(event) =>
                          setSectionField(sectionIndex, "title", event.target.value)
                        }
                        placeholder="e.g. Duties and Responsibilities"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label>Section type</Label>
                      <Select
                        value={section.type}
                        onValueChange={(value) =>
                          setSectionField(
                            sectionIndex,
                            "type",
                            value as OfficeTitleSectionType,
                          )
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {sectionTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <span className="inline-flex items-center gap-2">
                                <option.icon className="size-3.5" />
                                {option.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    type="button"
                    size="icon-sm"
                    variant="destructive"
                    className="mt-3"
                    onClick={() => removeSection(sectionIndex)}
                    disabled={form.sections.length <= 1}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>

                {section.type === "list" ? (
                  <div className="space-y-2">
                    <Label>Items</Label>
                    {section.items.map((item, itemIndex) => (
                      <div
                        key={`section-${sectionIndex}-item-${itemIndex}`}
                        className="flex items-center gap-2"
                      >
                        <Input
                          value={item.content}
                          placeholder="List item content"
                          onChange={(event) =>
                            setSectionItemValue(
                              sectionIndex,
                              itemIndex,
                              event.target.value,
                            )
                          }
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => removeSectionItem(sectionIndex, itemIndex)}
                          disabled={section.items.length <= 1}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addSectionItem(sectionIndex)}
                    >
                      <PlusCircle className="size-4" />
                      Add Item
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Rich text content</Label>
                    <RichTextEditor
                      value={section.content}
                      onChange={(value) =>
                        setSectionField(sectionIndex, "content", value)
                      }
                      placeholder="Write rich text content for this section."
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="sticky bottom-0 isolate flex items-center justify-end gap-2 bg-background py-4 after:pointer-events-none after:absolute after:bottom-full after:-z-10 after:h-10 after:w-full after:bg-linear-to-t after:from-background after:to-transparent">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/organizational-structure/office-title")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isInvalid || isSubmitting}>
            <Save className="size-4" />
            {isSubmitting
              ? mode === "create"
                ? "Creating..."
                : "Saving..."
              : mode === "create"
                ? "Create Office Title"
                : "Save Changes"}
          </Button>
        </div>
      </form>
    </section>
  );
}
