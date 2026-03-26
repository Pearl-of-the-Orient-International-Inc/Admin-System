"use client";

import { CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field } from "../Field";
import type { ApplicationFormState, BranchOfService } from "../types";

const BRANCH_OPTIONS: BranchOfService[] = [
  "Humanitarian",
  "Hospital and Care",
  "Military/PNP",
  "School",
  "Corporate",
  "Disaster & Rescue Operations",
  "Prison",
  "Security",
  "Government",
  "DSWD",
  "Others",
];

export function StepChurchBackground({
  form,
  updateFieldAction,
}: {
  form: ApplicationFormState;
  updateFieldAction: <K extends keyof ApplicationFormState>(
    key: K,
    value: ApplicationFormState[K],
  ) => void;
}) {
  return (
    <div className="space-y-4">
      <Field label="Church / Organization affiliation">
        <Input
          value={form.churchOrganizationAffiliation}
          onChange={(event) =>
            updateFieldAction("churchOrganizationAffiliation", event.target.value)
          }
          placeholder="Name of church or organization"
        />
      </Field>

      <Field label="Church address">
        <Input
          value={form.churchAddress}
          onChange={(event) => updateFieldAction("churchAddress", event.target.value)}
          placeholder="Street, barangay, city / municipality"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Current position / role">
          <Select
            value={form.position}
            onValueChange={(value) =>
              updateFieldAction("position", value as ApplicationFormState["position"])
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Church Worker">Church Worker</SelectItem>
              <SelectItem value="Pastor">Pastor</SelectItem>
              <SelectItem value="Rev.">Rev.</SelectItem>
              <SelectItem value="Bishop">Bishop</SelectItem>
              <SelectItem value="Others">Others</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field label="If Others, please specify">
          <Input
            value={form.positionOthers}
            onChange={(event) =>
              updateFieldAction("positionOthers", event.target.value)
            }
            placeholder="Specify position or role"
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Height (optional)">
          <Input
            value={form.height}
            onChange={(event) => updateFieldAction("height", event.target.value)}
            placeholder="e.g. 170 cm"
          />
        </Field>
        <Field label="Weight (optional)">
          <Input
            value={form.weight}
            onChange={(event) => updateFieldAction("weight", event.target.value)}
            placeholder="e.g. 70 kg"
          />
        </Field>
        <Field label="Blood type (optional)">
          <Input
            value={form.bloodType}
            onChange={(event) => updateFieldAction("bloodType", event.target.value)}
            placeholder="e.g. O+"
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Color of eyes (optional)">
          <Input
            value={form.colorOfEyes}
            onChange={(event) =>
              updateFieldAction("colorOfEyes", event.target.value)
            }
          />
        </Field>
        <Field label="Color of skin (optional)">
          <Input
            value={form.colorOfSkin}
            onChange={(event) =>
              updateFieldAction("colorOfSkin", event.target.value)
            }
          />
        </Field>
        <Field label="SSS number (optional)">
          <Input
            value={form.sssNumber}
            onChange={(event) => updateFieldAction("sssNumber", event.target.value)}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="TIN number (optional)">
          <Input
            value={form.tinNumber}
            onChange={(event) => updateFieldAction("tinNumber", event.target.value)}
          />
        </Field>
        <Field label="Skills / talents (optional)">
          <Input
            value={form.skillsTalents}
            onChange={(event) =>
              updateFieldAction("skillsTalents", event.target.value)
            }
            placeholder="e.g. counseling, teaching, music"
          />
        </Field>
      </div>

      <div className="space-y-2">
        <Field
          label="Preferred branch/es of service (optional)"
          hint="You may select multiple options that best describe where you feel called to serve."
        >
          <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
            {BRANCH_OPTIONS.map((branch) => {
              const isSelected = form.branchOfService.includes(branch);
              return (
                <button
                  key={branch}
                  type="button"
                  onClick={() =>
                    updateFieldAction(
                      "branchOfService",
                      isSelected
                        ? form.branchOfService.filter((item) => item !== branch)
                        : [...form.branchOfService, branch],
                    )
                  }
                  className={[
                    "flex items-center justify-between rounded-full border px-3 py-1.5 transition-colors",
                    isSelected
                      ? "border-primary bg-primary text-white"
                      : "border border-foreground text-foreground/60",
                  ].join(" ")}
                >
                  <span className="truncate">{branch}</span>
                  {isSelected ? <CheckCircle2 className="ml-1 size-3.5 shrink-0" /> : null}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="If Others, please specify (optional)">
          <Input
            value={form.branchOfServiceOthers}
            onChange={(event) =>
              updateFieldAction("branchOfServiceOthers", event.target.value)
            }
            placeholder="Specify other branch of service"
          />
        </Field>
      </div>
    </div>
  );
}
