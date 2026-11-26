"use client";

import { useId, useMemo, useState } from "react";
import { ImagePlus, LoaderCircle, X } from "lucide-react";
import { MemberType } from "@/enums";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field } from "../Field";
import type { ApplicationFormState, LocationCatalog } from "../types";
import { sanitizeMobileNumber } from "../utils";
import { uploadMemberIdPhoto } from "@/features/members/member-photo-upload.api";
import { useToast } from "@/hooks/use-toast";

type LocationSelection = {
  regionId: number | null;
  provinceId: number | null;
  municipalityId: number | null;
  barangayId: number | null;
};

const EMPTY_LOCATION_SELECTION: LocationSelection = {
  regionId: null,
  provinceId: null,
  municipalityId: null,
  barangayId: null,
};

const PHONE_PATTERN = "09[0-9]{9}";

const MEMBER_TYPE_OPTIONS: {
  value: ApplicationFormState["memberType"];
  label: string;
  description: string;
}[] = [
  {
    value: MemberType.ASSOCIATE_CHAPLAIN,
    label: "Associate Chaplain",
    description: "Default starting level for newly encoded members.",
  },
  {
    value: MemberType.PROFESSIONAL_CHAPLAIN,
    label: "Professional Chaplain",
    description: "For members who have progressed beyond the associate level.",
  },
  {
    value: MemberType.ORDAINED_AND_COMMISSIONED_PRACTITIONER,
    label: "Ordained and Commissioned Practitioner",
    description:
      "Tracks members who reached ordained and commissioned standing.",
  },
  {
    value: MemberType.CERTIFIED_SPECIALIST_TRAINING_OFFICER_INSTRUCTOR,
    label: "Certified Specialist Training Officer/Instructor",
    description:
      "For members qualified to lead or facilitate specialist training.",
  },
];

const normalize = (value: string) => value.trim().toLowerCase();

function parseLocationSummary(
  summary: string,
  locationCatalog: LocationCatalog,
): LocationSelection {
  const parts = summary
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) return EMPTY_LOCATION_SELECTION;

  const regions = locationCatalog.getRegions();
  const region = regions.find(
    (item) =>
      normalize(item.region_description) ===
        normalize(parts[parts.length - 1]) ||
      normalize(item.region_name) === normalize(parts[parts.length - 1]),
  );
  if (!region) return EMPTY_LOCATION_SELECTION;

  const provincePart = parts[parts.length - 2];
  if (!provincePart) {
    return {
      regionId: region.region_id,
      provinceId: null,
      municipalityId: null,
      barangayId: null,
    };
  }

  const province = locationCatalog
    .getProvinces(region.region_id)
    .find((item) => normalize(item.province_name) === normalize(provincePart));
  if (!province) {
    return {
      regionId: region.region_id,
      provinceId: null,
      municipalityId: null,
      barangayId: null,
    };
  }

  const municipalityPart = parts[parts.length - 3];
  if (!municipalityPart) {
    return {
      regionId: region.region_id,
      provinceId: province.province_id,
      municipalityId: null,
      barangayId: null,
    };
  }

  const municipality = locationCatalog
    .getMunicipalities(province.province_id)
    .find(
      (item) =>
        normalize(item.municipality_name) === normalize(municipalityPart),
    );
  if (!municipality) {
    return {
      regionId: region.region_id,
      provinceId: province.province_id,
      municipalityId: null,
      barangayId: null,
    };
  }

  const barangayPart = parts[0]?.replace(/^Barangay\s+/i, "").trim();
  if (!barangayPart) {
    return {
      regionId: region.region_id,
      provinceId: province.province_id,
      municipalityId: municipality.municipality_id,
      barangayId: null,
    };
  }

  const barangay = locationCatalog
    .getBarangays(municipality.municipality_id)
    .find((item) => normalize(item.barangay_name) === normalize(barangayPart));

  return {
    regionId: region.region_id,
    provinceId: province.province_id,
    municipalityId: municipality.municipality_id,
    barangayId: barangay?.barangay_id ?? null,
  };
}

function buildLocationSummary(
  selection: LocationSelection,
  locationCatalog: LocationCatalog,
): string {
  if (selection.regionId === null) return "";

  const region = locationCatalog
    .getRegions()
    .find((item) => item.region_id === selection.regionId);
  if (!region) return "";

  const province =
    selection.provinceId === null
      ? null
      : (locationCatalog
          .getProvinces(selection.regionId)
          .find((item) => item.province_id === selection.provinceId) ?? null);

  const municipality =
    selection.provinceId === null || selection.municipalityId === null
      ? null
      : (locationCatalog
          .getMunicipalities(selection.provinceId)
          .find((item) => item.municipality_id === selection.municipalityId) ??
        null);

  const barangay =
    selection.municipalityId === null || selection.barangayId === null
      ? null
      : (locationCatalog
          .getBarangays(selection.municipalityId)
          .find((item) => item.barangay_id === selection.barangayId) ?? null);

  if (!province || !municipality || !barangay) return "";

  return `Barangay ${barangay.barangay_name}, ${municipality.municipality_name}, ${province.province_name}, ${region.region_description}`;
}

export function StepPersonalDetails({
  form,
  updateFieldAction,
  locationCatalog,
  emailMode = "editable",
  emailHelperText,
}: {
  form: ApplicationFormState;
  updateFieldAction: <K extends keyof ApplicationFormState>(
    key: K,
    value: ApplicationFormState[K],
  ) => void;
  locationCatalog: LocationCatalog;
  emailMode?: "editable" | "locked";
  emailHelperText?: string;
}) {
  const { toast } = useToast();
  const photoInputId = useId();
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);
  const regions = useMemo(
    () => locationCatalog.getRegions(),
    [locationCatalog],
  );
  const [selectedLocation, setSelectedLocation] = useState<LocationSelection>(
    EMPTY_LOCATION_SELECTION,
  );
  const [hasTouchedLocation, setHasTouchedLocation] = useState(false);

  const parsedLocation = useMemo(
    () => parseLocationSummary(form.regionProvince, locationCatalog),
    [form.regionProvince, locationCatalog],
  );
  const activeLocation = hasTouchedLocation ? selectedLocation : parsedLocation;

  const provinces = useMemo(
    () => locationCatalog.getProvinces(activeLocation.regionId),
    [activeLocation.regionId, locationCatalog],
  );
  const municipalities = useMemo(
    () => locationCatalog.getMunicipalities(activeLocation.provinceId),
    [activeLocation.provinceId, locationCatalog],
  );
  const barangays = useMemo(
    () => locationCatalog.getBarangays(activeLocation.municipalityId),
    [activeLocation.municipalityId, locationCatalog],
  );

  const applyLocationSelection = (next: LocationSelection) => {
    setHasTouchedLocation(true);
    setSelectedLocation(next);
    updateFieldAction(
      "regionProvince",
      buildLocationSummary(next, locationCatalog),
    );
  };

  const handleEmailChange = (value: string) => {
    // Always allow typing
    updateFieldAction("emailAddress", value);
  };

  const isInvalidDomain =
    form.emailAddress &&
    !/^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(form.emailAddress);

  const today = new Date().toISOString().split("T")[0];

  const handlePhotoChange = async (file: File | undefined) => {
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      toast({
        variant: "error",
        title: "Unsupported picture format",
        description: "Use a JPG, JPEG, or PNG file for the 2x2 ID picture.",
      });
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      toast({
        variant: "error",
        title: "Picture is too large",
        description: "The 2x2 ID picture must be 4 MB or smaller.",
      });
      return;
    }

    try {
      setIsPhotoUploading(true);
      const uploaded = await uploadMemberIdPhoto(file);
      const photoUrl = uploaded?.ufsUrl ?? uploaded?.url;
      if (!photoUrl) throw new Error("The picture upload did not return a file URL.");
      updateFieldAction("photoUrl", photoUrl);
      toast({
        variant: "success",
        title: "2x2 ID picture uploaded",
        description: "This image will be used for the member profile and physical ID.",
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Picture upload failed",
        description:
          error instanceof Error
            ? error.message
            : "Please try uploading the 2x2 ID picture again.",
      });
    } finally {
      setIsPhotoUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Field
        label="2x2 ID picture"
        required
        hint="Use a clear recent JPG, JPEG, or PNG portrait. This picture is saved to the member profile and used for physical ID preparation."
      >
        <div className="flex flex-col gap-4 rounded-lg border border-dashed bg-muted/30 p-4 sm:flex-row sm:items-center">
          <div className="h-32 w-32 shrink-0 overflow-hidden rounded-md border bg-background">
            {form.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.photoUrl} alt="2x2 ID picture preview" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-center text-xs text-muted-foreground">
                <ImagePlus className="size-6 text-primary" />
                <span>2x2 preview</span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              {form.photoUrl ? "ID picture ready" : "Upload the member's 2x2 ID picture"}
            </p>
            <p className="text-xs leading-5 text-muted-foreground">
              JPG, JPEG, or PNG only, up to 4 MB. Use a clear front-facing portrait for physical ID printing.
            </p>
            <div className="flex flex-wrap gap-2">
              <label htmlFor={photoInputId} className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                {isPhotoUploading ? <LoaderCircle className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
                {isPhotoUploading ? "Uploading..." : form.photoUrl ? "Replace picture" : "Choose picture"}
              </label>
              {form.photoUrl ? (
                <button type="button" onClick={() => updateFieldAction("photoUrl", "")} disabled={isPhotoUploading} className="inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors hover:bg-muted">
                  <X className="size-4" />
                  Remove
                </button>
              ) : null}
            </div>
            <Input id={photoInputId} type="file" accept="image/jpeg,image/png,.jpg,.jpeg,.png" className="sr-only" disabled={isPhotoUploading} onChange={(event) => { void handlePhotoChange(event.target.files?.[0]); event.currentTarget.value = ""; }} />
          </div>
        </div>
      </Field>

      <Field label="Member type" required>
        <div className="space-y-1.5">
          <Select
            value={form.memberType}
            onValueChange={(value) =>
              updateFieldAction(
                "memberType",
                value as ApplicationFormState["memberType"],
              )
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select member type" />
            </SelectTrigger>
            <SelectContent>
              {MEMBER_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-muted-foreground text-xs">
            {
              MEMBER_TYPE_OPTIONS.find(
                (option) => option.value === form.memberType,
              )?.description
            }
          </p>
        </div>
      </Field>

      <Field label="Badge number">
        <Input
          value={form.badgeNumber}
          onChange={(event) =>
            updateFieldAction("badgeNumber", event.target.value)
          }
          placeholder="e.g. 2026-001"
        />
      </Field>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.65fr)]">
        <Field label="First name" required>
          <Input
            value={form.firstName}
            onChange={(event) =>
              updateFieldAction("firstName", event.target.value)
            }
            placeholder="e.g. Juan"
          />
        </Field>
        <Field label="Middle initial">
          <Input
            value={form.middleInitial}
            onChange={(event) =>
              updateFieldAction(
                "middleInitial",
                event.target.value.toUpperCase().slice(0, 1),
              )
            }
            placeholder="e.g. R"
            maxLength={1}
          />
        </Field>
        <Field label="Last name" required>
          <Input
            value={form.lastName}
            onChange={(event) =>
              updateFieldAction("lastName", event.target.value)
            }
            placeholder="e.g. Dela Cruz"
          />
        </Field>
        <Field label="Extension name">
          <Input
            value={form.extensionName}
            onChange={(event) =>
              updateFieldAction("extensionName", event.target.value)
            }
            placeholder="e.g. Jr., Sr., III"
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Email address" required>
          <div className="space-y-1.5">
            <Input
              type="email"
              value={form.emailAddress}
              onChange={(event) => handleEmailChange(event.target.value)}
              placeholder="you@gmail.com"
              readOnly={emailMode === "locked"}
              aria-readonly={emailMode === "locked"}
              className={
                emailMode === "locked"
                  ? "bg-neutral-100 text-neutral-700"
                  : undefined
              }
            />
            {isInvalidDomain ? (
              <p className="text-red-500 text-xs">
                Only @gmail.com email addresses are allowed
              </p>
            ) : emailHelperText ? (
              <p className="text-muted-foreground text-xs">{emailHelperText}</p>
            ) : null}
          </div>
        </Field>
        <Field label="Mobile / phone number">
          <Input
            type="tel"
            inputMode="numeric"
            maxLength={11}
            pattern={PHONE_PATTERN}
            value={form.phoneNumber}
            onChange={(event) =>
              updateFieldAction(
                "phoneNumber",
                sanitizeMobileNumber(event.target.value),
              )
            }
            placeholder="e.g. 09152479693"
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Civil status">
          <Select
            value={form.civilStatus}
            onValueChange={(value) =>
              updateFieldAction(
                "civilStatus",
                value as ApplicationFormState["civilStatus"],
              )
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Single">Single</SelectItem>
              <SelectItem value="Married">Married</SelectItem>
              <SelectItem value="Widowed">Widowed</SelectItem>
              <SelectItem value="Separated">Separated</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field label="Gender" required>
          <Select
            value={form.gender}
            onValueChange={(value) =>
              updateFieldAction(
                "gender",
                value as ApplicationFormState["gender"],
              )
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field label="Nationality">
          <Input
            value={form.nationality}
            onChange={(event) =>
              updateFieldAction("nationality", event.target.value)
            }
            placeholder="e.g. Filipino"
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Date of birth" required>
          <Input
            type="date"
            value={form.birthday}
            max={today}
            onChange={(event) =>
              updateFieldAction("birthday", event.target.value)
            }
          />
        </Field>
        <Field label="Age" required>
          <Input
            type="text"
            value={form.age}
            readOnly
            aria-readonly="true"
            placeholder="Auto-computed from date of birth"
            className="bg-neutral-100 text-neutral-700"
          />
        </Field>
      </div>

      <Field label="Location (Region / Province / Municipality / Barangay)">
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Select
              value={
                activeLocation.regionId !== null
                  ? String(activeLocation.regionId)
                  : undefined
              }
              onValueChange={(value) =>
                applyLocationSelection({
                  regionId: Number(value),
                  provinceId: null,
                  municipalityId: null,
                  barangayId: null,
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                {regions.map((region) => (
                  <SelectItem
                    key={region.region_id}
                    value={String(region.region_id)}
                  >
                    {region.region_description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={
                activeLocation.provinceId !== null
                  ? String(activeLocation.provinceId)
                  : undefined
              }
              onValueChange={(value) =>
                applyLocationSelection({
                  regionId: activeLocation.regionId,
                  provinceId: Number(value),
                  municipalityId: null,
                  barangayId: null,
                })
              }
              disabled={activeLocation.regionId === null}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select province" />
              </SelectTrigger>
              <SelectContent>
                {provinces.map((province) => (
                  <SelectItem
                    key={province.province_id}
                    value={String(province.province_id)}
                  >
                    {province.province_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={
                activeLocation.municipalityId !== null
                  ? String(activeLocation.municipalityId)
                  : undefined
              }
              onValueChange={(value) =>
                applyLocationSelection({
                  regionId: activeLocation.regionId,
                  provinceId: activeLocation.provinceId,
                  municipalityId: Number(value),
                  barangayId: null,
                })
              }
              disabled={activeLocation.provinceId === null}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select municipality / city" />
              </SelectTrigger>
              <SelectContent>
                {municipalities.map((municipality) => (
                  <SelectItem
                    key={municipality.municipality_id}
                    value={String(municipality.municipality_id)}
                  >
                    {municipality.municipality_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={
                activeLocation.barangayId !== null
                  ? String(activeLocation.barangayId)
                  : undefined
              }
              onValueChange={(value) =>
                applyLocationSelection({
                  regionId: activeLocation.regionId,
                  provinceId: activeLocation.provinceId,
                  municipalityId: activeLocation.municipalityId,
                  barangayId: Number(value),
                })
              }
              disabled={activeLocation.municipalityId === null}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select barangay" />
              </SelectTrigger>
              <SelectContent>
                {barangays.map((barangay) => (
                  <SelectItem
                    key={barangay.barangay_id}
                    value={String(barangay.barangay_id)}
                  >
                    {barangay.barangay_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Input
            value={form.address}
            onChange={(event) =>
              updateFieldAction("address", event.target.value)
            }
            placeholder="House no., street, subdivision / village"
          />

          <Input
            value={[form.address, form.regionProvince]
              .filter(Boolean)
              .join(", ")}
            readOnly
            aria-readonly="true"
            placeholder="Location summary will be auto-generated"
            className="bg-neutral-100 text-neutral-700"
          />
        </div>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Emergency contact name">
          <Input
            value={form.emergencyName}
            onChange={(event) =>
              updateFieldAction("emergencyName", event.target.value)
            }
            placeholder="Full name of emergency contact"
          />
        </Field>
        <Field label="Emergency contact mobile">
          <Input
            type="tel"
            inputMode="numeric"
            maxLength={11}
            pattern={PHONE_PATTERN}
            value={form.emergencyCellphone}
            onChange={(event) =>
              updateFieldAction(
                "emergencyCellphone",
                sanitizeMobileNumber(event.target.value),
              )
            }
            placeholder="e.g. 09152479693"
          />
        </Field>
      </div>
    </div>
  );
}
