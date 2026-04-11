"use client";

import type { ReactNode } from "react";
import { format } from "date-fns";
import { MemberType } from "@/enums";
import type { ApplicationFormState, BranchOfService } from "./types";

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

const POSITION_OPTIONS: Array<NonNullable<ApplicationFormState["position"]>> = [
  "Church Worker",
  "Pastor",
  "Rev.",
  "Bishop",
  "Others",
];

const CIVIL_STATUS_OPTIONS: Array<Exclude<ApplicationFormState["civilStatus"], "">> = [
  "Single",
  "Married",
  "Widowed",
  "Separated",
];

const GENDER_OPTIONS: Array<Exclude<ApplicationFormState["gender"], "">> = [
  "Male",
  "Female",
];

export function PrintableMembershipApplicationForm({
  form,
  headerImageSrc,
}: {
  form: ApplicationFormState;
  headerImageSrc: string;
}) {
  return (
    <div className="mx-auto w-full max-w-[210mm] bg-white px-8 py-8 text-black print:max-w-none print:px-6 print:py-6">
      <div className="border border-black px-8 py-8">
        <header className="border-b border-black pb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={headerImageSrc}
            alt="Membership application form header"
            className="w-full object-contain"
          />
          <div className="mt-3 flex items-end justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold uppercase tracking-[0.16em]">
                Membership Application Form
              </h1>
              <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-black/70">
                Hard copy form for manual fill-out
              </p>
            </div>
            <div className="w-32 shrink-0 text-right text-[10px] leading-5">
              <p>Date Printed</p>
              <p className="border-b border-black pb-1 font-medium">
                {format(new Date(), "MMMM d, yyyy")}
              </p>
            </div>
          </div>
        </header>

        <div className="mt-6 space-y-7">
          <PrintSection title="Contact Information">
            <div className="grid gap-4 sm:grid-cols-[1.2fr_0.5fr_1.2fr_0.6fr]">
              <PrintLine label="First name" value={form.firstName} />
              <PrintLine label="Middle initial" value={form.middleInitial} />
              <PrintLine label="Last name" value={form.lastName} />
              <PrintLine label="Ext." value={form.extensionName} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <PrintLine label="Email address" value={form.emailAddress} />
              <PrintLine label="Mobile / phone number" value={form.phoneNumber} />
            </div>

            <div className="grid gap-4 sm:grid-cols-[1.1fr_1fr_1fr]">
              <PrintChoiceRow
                label="Civil status"
                options={CIVIL_STATUS_OPTIONS}
                selected={form.civilStatus}
                type="radio"
              />
              <PrintChoiceRow
                label="Gender"
                options={GENDER_OPTIONS}
                selected={form.gender}
                type="radio"
              />
              <PrintLine label="Nationality" value={form.nationality} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <PrintLine label="Date of birth" value={form.birthday} />
              <PrintLine label="Age" value={form.age} />
            </div>

            <PrintLine
              label="Home address"
              value={[form.address, form.regionProvince].filter(Boolean).join(", ")}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <PrintLine
                label="Emergency contact name"
                value={form.emergencyName}
              />
              <PrintLine
                label="Emergency contact mobile"
                value={form.emergencyCellphone}
              />
            </div>
          </PrintSection>

          <PrintSection title="Church Background">
            <PrintLine
              label="Member type"
              value={formatMemberType(form.memberType)}
            />
            <PrintLine
              label="Church / Organization affiliation"
              value={form.churchOrganizationAffiliation}
            />
            <PrintLine label="Church address" value={form.churchAddress} />

            <div className="grid gap-4 sm:grid-cols-2">
              <PrintChoiceRow
                label="Current position / role"
                options={POSITION_OPTIONS}
                selected={form.position}
                type="radio"
              />
              <PrintLine label="If Others, please specify" value={form.positionOthers} />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <PrintLine label="Height" value={form.height} />
              <PrintLine label="Weight" value={form.weight} />
              <PrintLine label="Blood type" value={form.bloodType} />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <PrintLine label="Color of eyes" value={form.colorOfEyes} />
              <PrintLine label="Color of skin" value={form.colorOfSkin} />
              <PrintLine label="SSS number" value={form.sssNumber} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <PrintLine label="TIN number" value={form.tinNumber} />
              <PrintLine label="Skills / talents" value={form.skillsTalents} />
            </div>

            <PrintChoiceRow
              label="Preferred branch/es of service"
              options={BRANCH_OPTIONS}
              selected={form.branchOfService}
              type="checkbox"
              columns={2}
            />
            <PrintLine
              label="If Others, please specify"
              value={form.branchOfServiceOthers}
            />
          </PrintSection>

          <PrintSection title="Education and Ministry">
            <div className="space-y-4">
              <PrintLine
                label="Elementary"
                value={form.elementarySchool}
                hint="Name of School / Course / Year Graduated"
              />
              <PrintLine
                label="Secondary"
                value={form.secondarySchool}
                hint="Name of School / Course / Year Graduated"
              />
              <PrintRepeatingLines
                label="Tertiary / College"
                values={form.tertiarySchool}
                emptyRows={2}
              />
              <PrintRepeatingLines
                label="Post-graduate studies"
                values={form.postGraduateStudies}
                emptyRows={2}
              />
            </div>

            <div className="page-break-inside-avoid mt-6 space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.14em]">
                Ministerial / Work Experience
              </p>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border border-black">
                    <th className="border border-black px-3 py-2 text-left font-semibold">
                      Role / Position
                    </th>
                    <th className="border border-black px-3 py-2 text-left font-semibold">
                      Institution
                    </th>
                    <th className="border border-black px-3 py-2 text-left font-semibold">
                      Years
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {buildMinisterialRows(form).map((item, index) => (
                    <tr key={`${item.rolePosition}-${item.institution}-${index}`}>
                      <td className="border border-black px-3 py-3 align-top">
                        {item.rolePosition || "\u00A0"}
                      </td>
                      <td className="border border-black px-3 py-3 align-top">
                        {item.institution || "\u00A0"}
                      </td>
                      <td className="border border-black px-3 py-3 align-top">
                        {item.years || "\u00A0"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </PrintSection>

          <PrintSection title="References and Confirmation">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.14em] text-black/70">
                Character references
              </p>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border border-black">
                    <th className="border border-black px-3 py-2 text-left font-semibold">
                      Name
                    </th>
                    <th className="border border-black px-3 py-2 text-left font-semibold">
                      Position / Relationship
                    </th>
                    <th className="border border-black px-3 py-2 text-left font-semibold">
                      Contact Number
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {buildReferenceRows(form).map((item, index) => (
                    <tr key={`${item.name}-${index}`}>
                      <td className="border border-black px-3 py-3 align-top">
                        {item.name || "\u00A0"}
                      </td>
                      <td className="border border-black px-3 py-3 align-top">
                        {item.position || "\u00A0"}
                      </td>
                      <td className="border border-black px-3 py-3 align-top">
                        {item.contactNumber || "\u00A0"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 pt-2">
              <PrintCheckboxRow
                label="I hereby certify that the statements made in this application are true and correct to the best of my knowledge."
                checked={form.declarationTruthConfirmed}
              />
              <PrintCheckboxRow
                label="I understand and agree to the membership pledge and responsibilities required by the organization."
                checked={form.monthlyPledgeConfirmed}
              />
            </div>

            <div className="grid gap-4 pt-2 sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
              <div>
                <p className="text-sm font-medium">Applicant&apos;s signature</p>
                <div className="mt-2 h-36 border border-black" />
                <p className="mt-2 border-t border-black pt-1 text-xs uppercase tracking-[0.14em]">
                  Signature over printed name
                </p>
              </div>
              <div className="space-y-5 pt-1">
                <PrintLine label="Date signed" value="" />
                <PrintLine label="Printed name" value={buildPrintedName(form)} />
              </div>
            </div>
          </PrintSection>
        </div>
      </div>
    </div>
  );
}

function PrintSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4 page-break-inside-avoid">
      <div className="border-b border-black pb-1">
        <h2 className="text-sm font-bold uppercase tracking-[0.2em]">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function PrintLine({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  const displayValue = value?.trim() ? value.trim() : "\u00A0";

  return (
    <div className="space-y-1">
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-black/75">
        {label}
      </p>
      <div className="min-h-7 border-b border-black px-1 py-1 text-sm">
        {displayValue}
      </div>
      {hint ? (
        <p className="text-[10px] uppercase tracking-[0.12em] text-black/55">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function PrintRepeatingLines({
  label,
  values,
  emptyRows = 1,
}: {
  label: string;
  values: string[];
  emptyRows?: number;
}) {
  const filled = values.map((item) => item.trim()).filter(Boolean);
  const rows = filled.length > 0 ? filled : [];

  while (rows.length < emptyRows) {
    rows.push("");
  }

  return (
    <div className="space-y-2">
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-black/75">
        {label}
      </p>
      <div className="space-y-2">
        {rows.map((value, index) => (
          <div key={`${label}-${index}`} className="min-h-7 border-b border-black px-1 py-1 text-sm">
            {value || "\u00A0"}
          </div>
        ))}
      </div>
    </div>
  );
}

function PrintChoiceRow({
  label,
  options,
  selected,
  type,
  columns = 0,
}: {
  label: string;
  options: string[];
  selected: string | string[];
  type: "radio" | "checkbox";
  columns?: number;
}) {
  const selectedValues = Array.isArray(selected) ? selected : [selected];

  return (
    <div className="space-y-2">
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-black/75">
        {label}
      </p>
      <div
        className={
          columns > 0
            ? `grid gap-2 ${columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`
            : "flex flex-wrap gap-x-5 gap-y-2"
        }
      >
        {options.map((option) => {
          const checked = selectedValues.includes(option);

          return (
            <label key={option} className="inline-flex items-center gap-2 text-sm">
              <input
                type={type}
                checked={checked}
                readOnly
                className="size-4 accent-black"
              />
              <span>{option}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function PrintCheckboxRow({
  label,
  checked,
}: {
  label: string;
  checked: boolean;
}) {
  return (
    <label className="flex items-start gap-2 text-sm">
      <input type="checkbox" checked={checked} readOnly className="mt-0.5 size-4 accent-black" />
      <span>{label}</span>
    </label>
  );
}

function buildMinisterialRows(form: ApplicationFormState) {
  const rows = form.ministerialWorkExperience
    .map((item) => ({
      rolePosition: item.rolePosition.trim(),
      institution: item.institution.trim(),
      years: item.years.trim(),
    }))
    .filter(
      (item) => item.rolePosition || item.institution || item.years,
    );

  while (rows.length < 3) {
    rows.push({ rolePosition: "", institution: "", years: "" });
  }

  return rows;
}

function buildReferenceRows(form: ApplicationFormState) {
  const rows = form.characterReferences
    .map((item) => ({
      name: item.name.trim(),
      position: item.position.trim(),
      contactNumber: item.contactNumber.trim(),
    }))
    .filter((item) => item.name || item.position || item.contactNumber);

  while (rows.length < 3) {
    rows.push({ name: "", position: "", contactNumber: "" });
  }

  return rows;
}

function buildPrintedName(form: ApplicationFormState) {
  return [
    form.firstName.trim(),
    form.middleInitial.trim() ? `${form.middleInitial.trim()}.` : "",
    form.lastName.trim(),
    form.extensionName.trim(),
  ]
    .filter(Boolean)
    .join(" ");
}

function formatMemberType(memberType: MemberType) {
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
}
