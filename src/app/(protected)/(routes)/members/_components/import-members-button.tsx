"use client";

import { useMemo, useRef, useState, type ChangeEvent } from "react";
import * as XLSX from "xlsx";
import { AlertCircle, FileSpreadsheet, LoaderCircle, Upload } from "lucide-react";

import { useMemberImport } from "@/components/providers/MemberImport";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Gender, MemberType } from "@/enums";
import type { CreateMemberByAdminRequest } from "@/features/members/member.types";
import { useToast } from "@/hooks/use-toast";

const BULK_TEMPLATE_PATH = "/print-templates/Pearl_Chaplaincy_Bulk_Template.xlsx";

type ImportPreviewRow = {
  rowNumber: number;
  fullName: string;
  email: string;
  memberType: string;
  gender: string;
  birthday: string;
  status: "ready" | "failed";
  errors: string[];
  payload: CreateMemberByAdminRequest | null;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

const HEADER_ALIASES: Record<string, string[]> = {
  number: ["no", "number"],
  email: ["email", "emailaddress", "email_address", "memberemail"],
  firstName: ["firstname", "first_name", "first"],
  middleInitial: ["middleinitial", "middle_initial", "mi", "middle"],
  lastName: ["lastname", "last_name", "last", "surname"],
  extensionName: ["extension", "extensionname", "extension_name", "suffix"],
  memberType: ["membertype", "member_type"],
  badgeNumber: ["badge", "badgenumber", "badge_number"],
  applicationDate: [
    "applicationdate",
    "application_date",
    "applicationdatemmddyyyy",
    "applieddate",
  ],
  mobilePhoneNumber: [
    "contact",
    "contactnumber",
    "contactno",
    "mobile",
    "mobilenumber",
    "mobile_phone_number",
    "phone",
    "phonenumber",
  ],
  homeAddress: ["address", "homeaddress", "home_address"],
  civilStatus: ["civilstatus", "civil_status"],
  gender: ["gender", "sex"],
  nationality: ["nationality"],
  dateOfBirth: [
    "dateofbirth",
    "date_of_birth",
    "birthdatemmddyyyy",
    "birthday",
    "birthdate",
  ],
  region: ["region"],
  province: ["province"],
  municipalityCity: [
    "municipalitycity",
    "municipality_city",
    "citymunicipality",
    "city_municipality",
    "city",
    "municipality",
  ],
  barangay: ["barangay"],
  emergencyContactName: [
    "emergencycontactname",
    "emergency_contact_name",
    "emergencyname",
  ],
  emergencyContactMobile: [
    "emergencycontactmobile",
    "emergency_contact_mobile",
    "emergencymobile",
    "emergencyphone",
  ],
  churchAffiliation: ["churchaffiliation", "church_affiliation", "church"],
  churchAddress: ["churchaddress", "church_address"],
  currentPositionRole: [
    "currentpositionrole",
    "current_position_role",
    "position",
    "role",
  ],
  currentPositionRoleOther: [
    "currentpositionroleother",
    "current_position_role_other",
    "positionothers",
  ],
  height: ["height"],
  weight: ["weight"],
  bloodType: ["bloodtype", "blood_type"],
  colorOfEyes: ["colorofeyes", "color_of_eyes", "eye_color"],
  colorOfSkin: ["colorofskin", "color_of_skin", "skin_color"],
  sssNumber: ["sssnumber", "sss_number"],
  tinNumber: ["tinnumber", "tin_number"],
  skillsTalents: ["skillstalents", "skills_talents", "skills", "talents"],
  preferredBranchOther: [
    "preferredbranchother",
    "preferred_branch_other",
    "branchofservice",
    "branch_of_service",
  ],
  elementarySchool: ["elementaryschool", "elementary_school"],
  secondarySchool: ["secondaryschool", "secondary_school"],
  tertiaryCollege: ["tertiarycollege", "tertiary_college", "college"],
  postGraduateStudies: [
    "postgraduatestudies",
    "post_graduate_studies",
    "postgraduate",
  ],
};

const normalizeHeader = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]/g, "");

const normalizeOptional = (value: unknown) => {
  const normalized = String(value ?? "").trim();
  return normalized.length > 0 ? normalized : undefined;
};

const formatDateParts = (month: number, day: number, year: number) =>
  `${String(month).padStart(2, "0")}/${String(day).padStart(2, "0")}/${year}`;

const normalizePhone = (value: unknown) => {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }

  const raw = String(value).trim().replace(/\.0$/, "");
  const digitsOnly = raw.replace(/\D/g, "");

  if (digitsOnly.length === 10 && digitsOnly.startsWith("9")) {
    return `0${digitsOnly}`;
  }

  return raw.length > 0 ? raw : undefined;
};

const hasMeaningfulRowData = (row: Record<string, unknown>) =>
  Object.entries(row).some(([header, value]) => {
    const normalizedHeader = normalizeHeader(header);

    if (
      !normalizedHeader ||
      normalizedHeader === "no" ||
      normalizedHeader === "number"
    ) {
      return false;
    }

    return String(value ?? "").trim().length > 0;
  });

const parseGender = (value: unknown) => {
  const normalized = String(value ?? "").trim().toLowerCase();

  if (normalized === "male" || normalized === "m") {
    return Gender.MALE;
  }

  if (normalized === "female" || normalized === "f") {
    return Gender.FEMALE;
  }

  return null;
};

const parseCivilStatus = (
  value: unknown,
): CreateMemberByAdminRequest["civilStatus"] => {
  const normalized = String(value ?? "").trim().toLowerCase();

  if (!normalized) return undefined;
  if (normalized === "single") return "SINGLE";
  if (normalized === "married") return "MARRIED";
  if (normalized === "widowed") return "WIDOWED";
  if (normalized === "separated") return "SEPARATED";
  if (normalized === "annulled") return "ANNULLED";

  return undefined;
};

const parseMemberType = (value: unknown) => {
  const normalized = String(value ?? "").trim().toLowerCase();

  if (!normalized) {
    return MemberType.ASSOCIATE_CHAPLAIN;
  }

  if (normalized.includes("professional")) {
    return MemberType.PROFESSIONAL_CHAPLAIN;
  }

  if (normalized.includes("ordained") || normalized.includes("commissioned")) {
    return MemberType.ORDAINED_AND_COMMISSIONED_PRACTITIONER;
  }

  if (
    normalized.includes("certified") ||
    normalized.includes("training officer") ||
    normalized.includes("instructor")
  ) {
    return MemberType.CERTIFIED_SPECIALIST_TRAINING_OFFICER_INSTRUCTOR;
  }

  return MemberType.ASSOCIATE_CHAPLAIN;
};

const formatMemberType = (memberType: MemberType) => {
  switch (memberType) {
    case MemberType.PROFESSIONAL_CHAPLAIN:
      return "Professional Chaplain";
    case MemberType.ORDAINED_AND_COMMISSIONED_PRACTITIONER:
      return "Ordained and Commissioned Practitioner";
    case MemberType.CERTIFIED_SPECIALIST_TRAINING_OFFICER_INSTRUCTOR:
      return "Certified Specialist Training Officer/Instructor";
    case MemberType.ASSOCIATE_CHAPLAIN:
    default:
      return "Associate Chaplain";
  }
};

const toUtcDateOnlyIsoString = (year: number, month: number, day: number) => {
  const date = new Date(Date.UTC(year, month - 1, day));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const isValidCalendarDate = (year: number, month: number, day: number) => {
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    !Number.isNaN(date.getTime()) &&
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

const parseDatePartsFromText = (value: string) => {
  const mmDdYyyyMatch = value.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if (mmDdYyyyMatch) {
    const month = Number(mmDdYyyyMatch[1]);
    const day = Number(mmDdYyyyMatch[2]);
    const year = Number(mmDdYyyyMatch[3]);

    if (isValidCalendarDate(year, month, day)) {
      return { year, month, day };
    }

    return null;
  }

  const isoMatch = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:\s.*)?$/);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]);
    const day = Number(isoMatch[3]);

    if (isValidCalendarDate(year, month, day)) {
      return { year, month, day };
    }

    return null;
  }

  const nativeDate = new Date(value);
  if (Number.isNaN(nativeDate.getTime())) {
    return null;
  }

  const year = nativeDate.getFullYear();
  const month = nativeDate.getMonth() + 1;
  const day = nativeDate.getDate();

  if (!isValidCalendarDate(year, month, day)) {
    return null;
  }

  return { year, month, day };
};

const parseDateValue = (value: unknown): string | null => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return toUtcDateOnlyIsoString(
      value.getUTCFullYear(),
      value.getUTCMonth() + 1,
      value.getUTCDate(),
    );
  }

  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (!parsed) return null;

    return toUtcDateOnlyIsoString(parsed.y, parsed.m, parsed.d);
  }

  const normalized = String(value ?? "").trim();
  if (!normalized) return null;

  const parsed = parseDatePartsFromText(normalized);
  if (!parsed) return null;

  return toUtcDateOnlyIsoString(parsed.year, parsed.month, parsed.day);
};

const getCellValue = (
  row: Record<string, unknown>,
  key: keyof typeof HEADER_ALIASES,
) => {
  const entries = Object.entries(row);
  const alias = HEADER_ALIASES[key].find((candidate) =>
    entries.some(([header]) => normalizeHeader(header) === candidate),
  );

  if (!alias) return undefined;

  const match = entries.find(([header]) => normalizeHeader(header) === alias);
  return match?.[1];
};

const formatDisplayDate = (value: string | null) => {
  if (!value) return "";

  const parsed = parseDatePartsFromText(value);
  if (!parsed) return value;

  return formatDateParts(parsed.month, parsed.day, parsed.year);
};

const buildTimestampedFileName = (fileName: string) => {
  const extensionIndex = fileName.lastIndexOf(".");
  const hasExtension = extensionIndex > 0;
  const baseName = hasExtension ? fileName.slice(0, extensionIndex) : fileName;
  const extension = hasExtension ? fileName.slice(extensionIndex) : "";
  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, "-")
    .replace("T", "_")
    .replace("Z", "");

  return `${baseName}_${timestamp}${extension}`;
};

const buildPreviewRow = (
  row: Record<string, unknown>,
  rowNumber: number,
): ImportPreviewRow => {
  const email = String(getCellValue(row, "email") ?? "").trim();
  const firstName = String(getCellValue(row, "firstName") ?? "").trim();
  const middleInitial = String(getCellValue(row, "middleInitial") ?? "")
    .trim()
    .slice(0, 1);
  const lastName = String(getCellValue(row, "lastName") ?? "").trim();
  const extensionName = String(getCellValue(row, "extensionName") ?? "").trim();
  const gender = parseGender(getCellValue(row, "gender"));
  const dateOfBirth = parseDateValue(getCellValue(row, "dateOfBirth"));
  const applicationDate = parseDateValue(getCellValue(row, "applicationDate"));
  const memberType = parseMemberType(getCellValue(row, "memberType"));
  const badgeNumber = normalizeOptional(getCellValue(row, "badgeNumber"));

  const errors: string[] = [];

  if (!email) {
    errors.push("Email is required.");
  } else if (!EMAIL_REGEX.test(email)) {
    errors.push("Email format is invalid.");
  }

  if (!firstName) {
    errors.push("First name is required.");
  }

  if (!lastName) {
    errors.push("Last name is required.");
  }

  if (!gender) {
    errors.push("Gender must be Male or Female.");
  }

  if (!dateOfBirth) {
    errors.push("Date of birth is required and must use a valid MM/DD/YYYY date.");
  }

  if (
    normalizeOptional(getCellValue(row, "applicationDate")) &&
    !applicationDate
  ) {
    errors.push("Application date must use a valid MM/DD/YYYY date.");
  }

  const payload: CreateMemberByAdminRequest | null =
    errors.length > 0 || !gender || !dateOfBirth
      ? null
      : {
          email,
          firstName,
          middleInitial: middleInitial || undefined,
          lastName,
          extensionName: extensionName || undefined,
          memberType,
          badgeNumber,
          mobilePhoneNumber: normalizePhone(getCellValue(row, "mobilePhoneNumber")),
          homeAddress: normalizeOptional(getCellValue(row, "homeAddress")),
          civilStatus: parseCivilStatus(getCellValue(row, "civilStatus")),
          gender,
          nationality: normalizeOptional(getCellValue(row, "nationality")),
          dateOfBirth,
          createdAt: applicationDate ?? undefined,
          region: normalizeOptional(getCellValue(row, "region")),
          province: normalizeOptional(getCellValue(row, "province")),
          municipalityCity: normalizeOptional(getCellValue(row, "municipalityCity")),
          barangay: normalizeOptional(getCellValue(row, "barangay")),
          emergencyContactName: normalizeOptional(
            getCellValue(row, "emergencyContactName"),
          ),
          emergencyContactMobile: normalizeOptional(
            getCellValue(row, "emergencyContactMobile"),
          ),
          churchAffiliation: normalizeOptional(getCellValue(row, "churchAffiliation")),
          churchAddress: normalizeOptional(getCellValue(row, "churchAddress")),
          currentPositionRole: normalizeOptional(
            getCellValue(row, "currentPositionRole"),
          ),
          currentPositionRoleOther: normalizeOptional(
            getCellValue(row, "currentPositionRoleOther"),
          ),
          height: normalizeOptional(getCellValue(row, "height")),
          weight: normalizeOptional(getCellValue(row, "weight")),
          bloodType: normalizeOptional(getCellValue(row, "bloodType")),
          colorOfEyes: normalizeOptional(getCellValue(row, "colorOfEyes")),
          colorOfSkin: normalizeOptional(getCellValue(row, "colorOfSkin")),
          sssNumber: normalizeOptional(getCellValue(row, "sssNumber")),
          tinNumber: normalizeOptional(getCellValue(row, "tinNumber")),
          skillsTalents: normalizeOptional(getCellValue(row, "skillsTalents")),
          preferredBranchOther: normalizeOptional(
            getCellValue(row, "preferredBranchOther"),
          ),
          elementarySchool: normalizeOptional(getCellValue(row, "elementarySchool")),
          secondarySchool: normalizeOptional(getCellValue(row, "secondarySchool")),
          tertiaryCollege: normalizeOptional(getCellValue(row, "tertiaryCollege")),
          postGraduateStudies: normalizeOptional(
            getCellValue(row, "postGraduateStudies"),
          ),
        };

  return {
    rowNumber,
    fullName:
      [firstName, lastName].filter(Boolean).join(" ").trim() || "Unnamed member",
    email,
    memberType: formatMemberType(memberType),
    gender: gender === Gender.MALE ? "Male" : gender === Gender.FEMALE ? "Female" : "",
    birthday: formatDisplayDate(dateOfBirth),
    status: errors.length > 0 ? "failed" : "ready",
    errors,
    payload,
  };
};

export function ImportMembersButton() {
  const { toast } = useToast();
  const { startImport, isImportRunning } = useMemberImport();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState("");
  const [previewRows, setPreviewRows] = useState<ImportPreviewRow[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isStartingImport, setIsStartingImport] = useState(false);

  const validRows = useMemo(
    () => previewRows.filter((row) => row.payload !== null),
    [previewRows],
  );
  const invalidRows = useMemo(
    () => previewRows.filter((row) => row.payload === null),
    [previewRows],
  );

  const resetState = () => {
    setFileName("");
    setPreviewRows([]);
    setIsParsing(false);
    setIsStartingImport(false);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      resetState();
    }
  };

  const handleOpenPicker = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.click();
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsParsing(true);
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, {
        type: "array",
        cellDates: false,
      });
      const firstSheetName = workbook.SheetNames[0];
      const firstSheet = workbook.Sheets[firstSheetName];

      if (!firstSheet) {
        throw new Error("The selected file does not contain a readable sheet.");
      }

      const rawRows = XLSX.utils.sheet_to_json<(string | number | Date)[]>(
        firstSheet,
        {
          header: 1,
          defval: "",
          raw: false,
          dateNF: "mm/dd/yyyy",
        },
      );

      if (rawRows.length < 3) {
        throw new Error("The selected file does not contain the expected member rows.");
      }

      const headers = (rawRows[1] ?? []).map((value) => String(value ?? "").trim());
      const extractedRows: Record<string, unknown>[] = [];
      let blankRowStreak = 0;

      for (const row of rawRows.slice(2)) {
        const record = headers.reduce<Record<string, unknown>>((result, header, index) => {
          if (!header) return result;
          result[header] = row[index] ?? "";
          return result;
        }, {});

        if (hasMeaningfulRowData(record)) {
          extractedRows.push(record);
          blankRowStreak = 0;
          continue;
        }

        blankRowStreak += 1;
        if (blankRowStreak >= 3 && extractedRows.length > 0) {
          break;
        }
      }

      if (extractedRows.length === 0) {
        throw new Error("The selected file does not contain any rows to import.");
      }

      const mappedRows = extractedRows.map((row, index) =>
        buildPreviewRow(row, index + 3),
      );

      setFileName(buildTimestampedFileName(file.name));
      setPreviewRows(mappedRows);

      toast({
        variant: "success",
        title: "Excel parsed",
        description: `${mappedRows.length} row(s) extracted and ready for review.`,
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Import preview failed",
        description:
          error instanceof Error
            ? error.message
            : "Unable to parse this spreadsheet right now.",
      });
      resetState();
    } finally {
      setIsParsing(false);
      event.target.value = "";
    }
  };

  const handleConfirmImport = async () => {
    if (validRows.length === 0) return;

    setIsStartingImport(true);

    try {
      const queued = await startImport({
        fileName,
        rows: validRows
          .filter(
            (
              row,
            ): row is ImportPreviewRow & { payload: CreateMemberByAdminRequest } =>
              row.payload !== null,
          )
          .map((row) => ({
            rowNumber: row.rowNumber,
            fullName: row.fullName,
            email: row.email,
            payload: row.payload,
          })),
      });

      if (queued) {
        handleOpenChange(false);
      }
    } finally {
      setIsStartingImport(false);
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={handleFileChange}
      />

      <Button onClick={() => setOpen(true)} variant="outline">
        <FileSpreadsheet className="size-4" />
        Import Excel
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-5xl!">
          <DialogHeader>
            <DialogTitle>Import Members</DialogTitle>
            <DialogDescription>
              Upload an Excel or CSV file, review the extracted member rows, then
              start the import in the background so you can keep using the admin
              system.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-xl border bg-muted/20 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <p className="font-medium text-foreground">Spreadsheet Upload</p>
                  <p className="text-sm text-muted-foreground">
                    Download the official bulk template, complete it, then upload
                    the finished file here. Date columns should use MM/DD/YYYY.
                  </p>
                  {isImportRunning ? (
                    <p className="text-sm text-amber-600">
                      A background import is already running. Please wait for it to
                      finish before starting another one.
                    </p>
                  ) : null}
                  {fileName ? (
                    <p className="text-sm text-foreground">
                      Queued as: <span className="font-medium">{fileName}</span>
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button variant="outline" asChild>
                    <a href={BULK_TEMPLATE_PATH} download>
                      <FileSpreadsheet className="size-4" />
                      Download Template
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleOpenPicker}
                    disabled={isParsing || isStartingImport || isImportRunning}
                  >
                    {isParsing ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : (
                      <Upload className="size-4" />
                    )}
                    {isParsing ? "Parsing file..." : "Choose file"}
                  </Button>
                </div>
              </div>
            </div>

            {previewRows.length > 0 ? (
              <>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-lg border bg-card p-4">
                    <p className="text-xs font-medium uppercase text-muted-foreground">
                      Extracted Rows
                    </p>
                    <p className="mt-2 text-2xl font-semibold">{previewRows.length}</p>
                  </div>
                  <div className="rounded-lg border bg-card p-4">
                    <p className="text-xs font-medium uppercase text-muted-foreground">
                      Ready To Import
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-emerald-600">
                      {validRows.length}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-card p-4">
                    <p className="text-xs font-medium uppercase text-muted-foreground">
                      Needs Attention
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-rose-600">
                      {invalidRows.length}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border">
                  <div className="border-b px-4 py-3">
                    <p className="font-medium text-foreground">Import Preview</p>
                    <p className="text-sm text-muted-foreground">
                      Review the extracted members below before starting the
                      background import.
                    </p>
                  </div>
                  <ScrollArea className="h-70">
                    <div className="divide-y">
                      {previewRows.map((row) => (
                        <div
                          key={row.rowNumber}
                          className="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-start md:justify-between"
                        >
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-medium text-foreground">
                                Row {row.rowNumber}: {row.fullName}
                              </p>
                              <Badge
                                variant={
                                  row.status === "failed" ? "error" : "secondary"
                                }
                              >
                                {row.status === "ready" ? "Ready" : "Needs attention"}
                              </Badge>
                            </div>
                            <div className="grid gap-1 text-sm text-muted-foreground">
                              <p>{row.email || "No email"}</p>
                              <p>
                                {row.memberType}
                                {row.gender ? ` · ${row.gender}` : ""}
                                {row.birthday ? ` · ${row.birthday}` : ""}
                              </p>
                            </div>
                            {row.errors.length > 0 ? (
                              <div className="space-y-1 rounded-lg border border-rose-200 bg-rose-500/5 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:text-rose-300">
                                {row.errors.map((error) => (
                                  <p key={error} className="flex items-start gap-2">
                                    <AlertCircle className="mt-0.5 size-4 shrink-0" />
                                    <span>{error}</span>
                                  </p>
                                ))}
                              </div>
                            ) : null}
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            {row.status === "failed" ? (
                              <span className="flex items-center gap-2 text-rose-600">
                                <AlertCircle className="size-4" />
                                Blocked
                              </span>
                            ) : (
                              <span className="text-muted-foreground">Queued</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </>
            ) : (
              <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed px-6 text-center text-muted-foreground">
                <FileSpreadsheet className="mb-4 size-10" />
                <p className="font-medium text-foreground">No file preview yet</p>
                <p className="mt-1 max-w-lg text-sm">
                  Choose an Excel or CSV file first. The extracted rows will appear
                  here before anything is imported.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isStartingImport}
            >
              Close
            </Button>
            <Button
              onClick={() => void handleConfirmImport()}
              disabled={
                validRows.length === 0 ||
                isParsing ||
                isStartingImport ||
                isImportRunning
              }
            >
              {isStartingImport ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              {isStartingImport
                ? "Starting background import..."
                : `Start background import (${validRows.length})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
