"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "../Field";
import type { ApplicationFormState } from "../types";

export function StepEducationMinistry({
  form,
  updateFieldAction,
}: {
  form: ApplicationFormState;
  updateFieldAction: <K extends keyof ApplicationFormState>(
    key: K,
    value: ApplicationFormState[K],
  ) => void;
}) {
  const updateTertiaryEntry = (index: number, value: string) => {
    const copy = [...form.tertiarySchool];
    copy[index] = value;
    updateFieldAction("tertiarySchool", copy);
  };

  const addTertiaryEntry = () => {
    updateFieldAction("tertiarySchool", [...form.tertiarySchool, ""]);
  };

  const removeTertiaryEntry = (index: number) => {
    const copy = form.tertiarySchool.filter((_, itemIndex) => itemIndex !== index);
    updateFieldAction("tertiarySchool", copy.length > 0 ? copy : [""]);
  };

  const updatePostGraduateEntry = (index: number, value: string) => {
    const copy = [...form.postGraduateStudies];
    copy[index] = value;
    updateFieldAction("postGraduateStudies", copy);
  };

  const addPostGraduateEntry = () => {
    updateFieldAction("postGraduateStudies", [...form.postGraduateStudies, ""]);
  };

  const removePostGraduateEntry = (index: number) => {
    const copy = form.postGraduateStudies.filter(
      (_, itemIndex) => itemIndex !== index,
    );
    updateFieldAction("postGraduateStudies", copy.length > 0 ? copy : [""]);
  };

  const updateMinisterialEntry = (
    index: number,
    key: "rolePosition" | "institution" | "years",
    value: string,
  ) => {
    const copy = [...form.ministerialWorkExperience];
    copy[index] = { ...copy[index], [key]: value };
    updateFieldAction("ministerialWorkExperience", copy);
  };

  const addMinisterialEntry = () => {
    updateFieldAction("ministerialWorkExperience", [
      ...form.ministerialWorkExperience,
      { rolePosition: "", institution: "", years: "" },
    ]);
  };

  const removeMinisterialEntry = (index: number) => {
    const copy = form.ministerialWorkExperience.filter(
      (_, itemIndex) => itemIndex !== index,
    );
    updateFieldAction(
      "ministerialWorkExperience",
      copy.length > 0 ? copy : [{ rolePosition: "", institution: "", years: "" }],
    );
  };

  return (
    <div className="space-y-5">
      <div className="space-y-4">
        <h3 className="font-serif text-base text-foreground sm:text-lg">
          Educational background
        </h3>
        <p className="text-xs text-foreground/70 sm:text-sm">
          Format for all levels: Name of School / Course / Year Graduated
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Elementary (optional)">
            <Input
              value={form.elementarySchool}
              onChange={(event) =>
                updateFieldAction("elementarySchool", event.target.value)
              }
              placeholder="Name of School / Course / Year Graduated"
            />
          </Field>
          <Field label="Secondary (optional)">
            <Input
              value={form.secondarySchool}
              onChange={(event) =>
                updateFieldAction("secondarySchool", event.target.value)
              }
              placeholder="Name of School / Course / Year Graduated"
            />
          </Field>
          <Field label="Tertiary / College (optional)">
            <div className="space-y-2">
              {form.tertiarySchool.map((entry, index) => (
                <div key={`${index}-${entry}`} className="flex items-center gap-2">
                  <Input
                    value={entry}
                    onChange={(event) =>
                      updateTertiaryEntry(index, event.target.value)
                    }
                    placeholder="Name of School / Course / Year Graduated"
                  />
                  {form.tertiarySchool.length > 1 ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeTertiaryEntry(index)}
                      className="shrink-0"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  ) : null}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addTertiaryEntry}
                className="border-foreground/30 text-foreground hover:bg-primary/5"
              >
                <Plus className="size-4" />
                Add tertiary/college
              </Button>
            </div>
          </Field>
          <Field label="Post-graduate studies (optional)">
            <div className="space-y-2">
              {form.postGraduateStudies.map((entry, index) => (
                <div key={`${index}-${entry}`} className="flex items-center gap-2">
                  <Input
                    value={entry}
                    onChange={(event) =>
                      updatePostGraduateEntry(index, event.target.value)
                    }
                    placeholder="Name of School / Course / Year Graduated"
                  />
                  {form.postGraduateStudies.length > 1 ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removePostGraduateEntry(index)}
                      className="shrink-0"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  ) : null}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addPostGraduateEntry}
                className="border-foreground/30 text-foreground hover:bg-primary/5"
              >
                <Plus className="size-4" />
                Add post-graduate
              </Button>
            </div>
          </Field>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-serif text-base text-foreground sm:text-lg">
          Ministerial/Work experience (optional)
        </h3>
        <p className="text-xs text-foreground/70 sm:text-sm">
          Format: Role/Position | Institution | Years
        </p>
        <div className="space-y-3">
          {form.ministerialWorkExperience.map((experience, index) => (
            <div
              key={index}
              className="rounded-lg border border-dashed border-primary/20 px-3 py-3"
            >
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1.7fr)_minmax(0,1.7fr)_minmax(0,1fr)_auto]">
                <Field label={`Role/Position #${index + 1}`}>
                  <Input
                    value={experience.rolePosition}
                    onChange={(event) =>
                      updateMinisterialEntry(
                        index,
                        "rolePosition",
                        event.target.value,
                      )
                    }
                    placeholder="e.g. Hospital Chaplain"
                  />
                </Field>
                <Field label="Institution">
                  <Input
                    value={experience.institution}
                    onChange={(event) =>
                      updateMinisterialEntry(index, "institution", event.target.value)
                    }
                    placeholder="e.g. St. Luke Hospital"
                  />
                </Field>
                <Field label="Years">
                  <Input
                    value={experience.years}
                    onChange={(event) =>
                      updateMinisterialEntry(index, "years", event.target.value)
                    }
                    placeholder="e.g. 2 years"
                  />
                </Field>
                <div className="flex items-end pb-0.5">
                  {form.ministerialWorkExperience.length > 1 ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeMinisterialEntry(index)}
                      className="shrink-0"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={addMinisterialEntry}
            className="border-foreground/30 text-foreground hover:bg-primary/5"
          >
            <Plus className="size-4" />
            Add ministerial/work experience
          </Button>
        </div>
      </div>
    </div>
  );
}
