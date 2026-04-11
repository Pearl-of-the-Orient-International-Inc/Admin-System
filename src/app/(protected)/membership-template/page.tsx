"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

const BRANCH_OPTIONS = [
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
] as const;

const POSITION_OPTIONS = [
  "Church Worker",
  "Pastor",
  "Rev.",
  "Bishop",
] as const;

const CIVIL_STATUS_OPTIONS = [
  "Single",
  "Married",
  "Widowed",
  "Separated",
  "Anulled",
  "Divorced",
] as const;
const GENDER_OPTIONS = ["Male", "Female"] as const;

export default function MembershipTemplatePage() {
  return (
    <>
      <div className="bg-muted/30 min-h-screen py-8 print:bg-white print:py-0">
        <div className="mx-auto mb-4 flex w-full max-w-204 justify-end px-4 print:hidden">
          <Button onClick={() => window.print()}>
            <Printer className="size-4" />
            Print Form
          </Button>
        </div>

        <main className="mx-auto w-full max-w-204 text-black print:max-w-none print:shadow-none">
          <div className="min-h-312">
            <header className="">
              <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h1 className="text-xl font-bold uppercase">
                    Membership Application Form
                  </h1>
                  <p className="mt-1 text-[11px] uppercase text-black/70">
                    Please fill all the required fields (
                    <span className="text-destructive">*</span>)
                  </p>
                </div>
                <div className="w-40">
                  <FieldLine label="Date" />
                </div>
              </div>
            </header>

            <div className="mt-4 space-y-2">
              <div className="grid grid-cols-12 gap-5">
                <div className="col-span-4">
                  <FieldLine label="First name" required />
                </div>
                <div className="col-span-2">
                  <FieldLine label="Middle initial" />
                </div>
                <div className="col-span-4">
                  <FieldLine label="Last name" required />
                </div>
                <div className="col-span-2">
                  <FieldLine label="Ext. name" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-5">
                <FieldLine label="Badge number" />
                <FieldLine label="Email address" required />
                <FieldLine label="Mobile / phone number" required />
              </div>

              <ChoiceGroup
                label="Civil status"
                type="radio"
                options={CIVIL_STATUS_OPTIONS}
              />

              <div className="grid grid-cols-2 gap-5">
                <ChoiceGroup
                  label="Gender"
                  type="radio"
                  options={GENDER_OPTIONS}
                />
                <FieldLine label="Nationality" />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <FieldLine label="Date of birth" required />
                <FieldLine label="Age" required />
              </div>

              <FieldLine label="House no., street, subdivision / village" />
              <FieldLine label="Barangay / Municipality / City / Province / Region" />

              <div className="grid grid-cols-2 gap-5">
                <FieldLine label="Emergency contact name" />
                <FieldLine label="Emergency contact mobile" />
              </div>

              <FieldLine label="Church / Organization affiliation" />
              <FieldLine label="Church address" />

              <div className="grid grid-cols-2 gap-5">
                <ChoiceGroup
                  label="Current role"
                  type="radio"
                  options={POSITION_OPTIONS}
                />
                <FieldLine label="If Others, please specify" />
              </div>

              <div className="grid grid-cols-3 gap-5">
                <FieldLine label="Height" />
                <FieldLine label="Weight" />
                <FieldLine label="Blood type" />
              </div>

              <div className="grid grid-cols-3 gap-5">
                <FieldLine label="Color of eyes" />
                <FieldLine label="Color of skin" />
                <FieldLine label="SSS number" />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <FieldLine label="TIN number" />
                <FieldLine label="Skills / talents" />
              </div>

              <ChoiceGroup
                label="Preferred branch/es of service"
                type="checkbox"
                options={BRANCH_OPTIONS}
                columns={1}
              />
              <FieldLine label="If Others, please specify" />

              <div className="grid grid-cols-2 gap-5">
                <FieldLine label="Elementary - Name of School / Course / Year Graduated" />
                <FieldLine label="Secondary - Name of School / Course / Year Graduated" />
                <FieldLine label="Tertiary / College - Name of School / Course / Year Graduated" />
                <FieldLine label="Post-graduate - Name of School / Course / Year Graduated" />
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-medium uppercase text-black/75">
                  Ministerial / Work Experience
                </p>
                <TableGrid
                  headers={["Role / Position", "Institution", "Years"]}
                  rows={3}
                  columnWidths={["40%", "40%", "20%"]}
                />
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-medium uppercase text-black/75">
                  Character references
                </p>
                <TableGrid
                  headers={[
                    "Name",
                    "Position / Relationship",
                    "Contact Number",
                  ]}
                  rows={3}
                  columnWidths={["35%", "40%", "25%"]}
                />
              </div>

              <div className="space-y-2">
                <CheckboxLine label="I hereby certify that the statements made in this application are true and correct to the best of my knowledge." />
                <CheckboxLine label="I understand and agree to the membership pledge and responsibilities required by the organization." />
              </div>

              <div className="mt-5">
                <p className="text-sm font-medium">
                  Applicant&apos;s signature
                </p>
                <div className="mt-8 border-t border-black pt-1 text-center text-[11px] uppercase text-black/70">
                  Signature over printed name
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <style jsx global>{`
        @page {
          size: legal portrait;
          margin: 0.30in;
        }

        @media print {
          html,
          body {
            background: white !important;
          }
        }
      `}</style>
    </>
  );
}

function FieldLine({
  label,
  required = false,
}: {
  label: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-medium uppercase text-black/75">
        {label}
        {required ? <span className="text-red-600"> *</span> : null}
      </span>
      <div className="h-2 border-b border-black" />
    </label>
  );
}

function ChoiceGroup({
  label,
  type,
  options,
  columns = 0,
}: {
  label: string;
  type: "radio" | "checkbox";
  options: readonly string[];
  columns?: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <p className="text-[10px] font-medium uppercase text-black/75">{label}</p>
      <div
        className={
          columns === 2
            ? "grid grid-cols-2 gap-x-4 gap-y-2"
            : "flex flex-wrap gap-x-4 gap-y-2"
        }
      >
        {options.map((option) => (
          <label
            key={option}
            className="inline-flex items-center gap-2 text-[10px]"
          >
            <input type={type} className="size-4 accent-black" />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function CheckboxLine({ label }: { label: string }) {
  return (
    <label className="flex items-start gap-2 text-[10px]">
      <input type="checkbox" className="size-3 accent-black" />
      <span>{label}</span>
    </label>
  );
}

function TableGrid({
  headers,
  rows,
  columnWidths,
}: {
  headers: string[];
  rows: number;
  columnWidths: string[];
}) {
  return (
    <table className="w-full border-collapse text-[10px]">
      <thead>
        <tr>
          {headers.map((header, index) => (
            <th
              key={header}
              className="border border-black px-3 py-1 text-left font-semibold"
              style={{ width: columnWidths[index] }}
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <tr key={rowIndex}>
            {headers.map((header) => (
              <td
                key={`${header}-${rowIndex}`}
                className="h-5 border border-black"
              />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
