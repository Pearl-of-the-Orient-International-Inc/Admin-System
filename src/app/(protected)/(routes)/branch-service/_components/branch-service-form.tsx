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
import { Textarea } from "@/components/ui/textarea";
import { toApiError } from "@/features/auth/auth.hooks";
import {
  useBranchServiceByIdQuery,
  useCreateBranchServiceMutation,
  useUpdateBranchServiceMutation,
} from "@/features/branch-service/branch-service.hooks";
import type {
  BranchSection,
  BranchSectionType,
} from "@/features/branch-service/branch-service.types";
import { useToast } from "@/hooks/use-toast";

type BranchServiceFormMode = "create" | "update";

type BranchServiceFormProps = {
  mode: BranchServiceFormMode;
  branchServiceId?: string;
};

type BranchServiceSectionForm = {
  id?: string;
  title: string;
  type: BranchSectionType;
  items: { id?: string; content: string }[];
  content: string;
};

type BranchServiceFormState = {
  title: string;
  description: string;
  sections: BranchServiceSectionForm[];
};

const defaultSection = (): BranchServiceSectionForm => ({
  title: "",
  type: "richtext",
  items: [{ content: "" }],
  content: "",
});

const emptyForm: BranchServiceFormState = {
  title: "",
  description: "",
  sections: [defaultSection()],
};

const sectionTypeOptions: Array<{
  value: BranchSectionType;
  label: string;
  icon: LucideIcon;
}> = [
  { value: "list", label: "List", icon: PlusCircle },
  { value: "richtext", label: "Rich Text", icon: Save },
];

const mapBranchServiceToFormState = (
  data: {
    title: string;
    description: string;
    sections: BranchSection[];
  } | null,
): BranchServiceFormState => {
  if (!data) return emptyForm;

  return {
    title: data.title,
    description: data.description,
    sections: data.sections.map((section) => ({
      id: section.id,
      title: section.title,
      type: section.type,
      items: section.items?.length ? section.items : [{ content: "" }],
      content: section.content ?? "",
    })),
  };
};

export function BranchServiceForm({
  mode,
  branchServiceId,
}: BranchServiceFormProps) {
  const branchServiceQuery = useBranchServiceByIdQuery(
    branchServiceId ?? "",
    mode === "update",
  );

  if (mode === "update" && branchServiceQuery.isLoading) {
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
      ? mapBranchServiceToFormState(branchServiceQuery.data ?? null)
      : emptyForm;

  const formKey =
    mode === "update" && branchServiceQuery.data
      ? `${branchServiceQuery.data.id}:${branchServiceQuery.data.updatedAt}`
      : "create";

  return (
    <BranchServiceFormEditor
      key={formKey}
      mode={mode}
      branchServiceId={branchServiceId}
      initialForm={initialForm}
    />
  );
}

type BranchServiceFormEditorProps = {
  mode: BranchServiceFormMode;
  branchServiceId?: string;
  initialForm: BranchServiceFormState;
};

function BranchServiceFormEditor({
  mode,
  branchServiceId,
  initialForm,
}: BranchServiceFormEditorProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState<BranchServiceFormState>(initialForm);

  const createBranchServiceMutation = useCreateBranchServiceMutation();
  const updateBranchServiceMutation = useUpdateBranchServiceMutation();

  const isSubmitting =
    createBranchServiceMutation.isPending || updateBranchServiceMutation.isPending;

  const isInvalid = useMemo(() => {
    if (!form.title.trim() || !form.description.trim()) return true;
    if (!form.sections.length) return true;

    for (const section of form.sections) {
      if (!section.title.trim()) return true;
      if (section.type === "list") {
        const hasContent = section.items.some((item) => item.content.trim());
        if (!hasContent) return true;
      }
      if (section.type === "richtext" && !section.content.trim()) return true;
    }

    return false;
  }, [form]);

  const setField = <K extends keyof BranchServiceFormState>(
    key: K,
    value: BranchServiceFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setSectionField = <K extends keyof BranchServiceSectionForm>(
    index: number,
    key: K,
    value: BranchServiceSectionForm[K],
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

  const toPayloadSections = (sections: BranchServiceSectionForm[]): BranchSection[] =>
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
        content:
          section.type === "richtext" ? section.content.trim() : undefined,
      }))
      .filter((section) => Boolean(section.title));

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        sections: toPayloadSections(form.sections),
      };

      if (mode === "create") {
        await createBranchServiceMutation.mutateAsync(payload);
        toast({
          title: "Branch service created",
          description: "Branch service has been created successfully.",
          variant: "success",
        });
      } else {
        if (!branchServiceId) return;

        await updateBranchServiceMutation.mutateAsync({
          id: branchServiceId,
          payload,
        });
        toast({
          title: "Branch service updated",
          description: "Branch service changes have been saved successfully.",
          variant: "success",
        });
      }

      router.push("/branch-service");
    } catch (error: unknown) {
      const apiError = toApiError(error);
      toast({
        title: mode === "create" ? "Create failed" : "Update failed",
        description:
          apiError.message ?? "Unable to save branch service right now.",
        variant: "error",
      });
    }
  };

  return (
    <section className="space-y-5 p-10">
      <div className="flex items-start gap-3">
        <Button asChild variant="outline" size="icon">
          <Link href="/branch-service">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {mode === "create" ? "Create Branch Service" : "Update Branch Service"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {mode === "create"
              ? "Create a new branch service with sections."
              : "Update branch service content and sections."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <Textarea
          name="branch-service-title"
          id="branch-service-title"
          maxLength={100}
          className="text-4xl! font-semibold tracking-tight border-none ring-0! bg-transparent! px-0 resize-none shadow-none"
          placeholder="e.g. Humanitarian Service"
          value={form.title}
          onChange={(event) => setField("title", event.target.value)}
        />

        <div className="space-y-2">
          <Label htmlFor="branch-service-description">Description</Label>
          <Textarea
            id="branch-service-description"
            maxLength={1000}
            placeholder="Describe this branch service."
            value={form.description}
            onChange={(event) => setField("description", event.target.value)}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Sections</p>
              <p className="text-muted-foreground text-xs">
                Add list or rich text sections for this branch service.
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
                            value as BranchSectionType,
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
            onClick={() => router.push("/branch-service")}
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
                ? "Create Branch Service"
                : "Save Changes"}
          </Button>
        </div>
      </form>
    </section>
  );
}
