"use client";

import type { ReactNode } from "react";
import { format } from "date-fns";
import {
  CalendarDays,
  ExternalLink,
  FileText,
  LoaderCircle,
  Mail,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useMemberByIdQuery } from "@/features/members/member.hooks";

type PendingMemberDetailsSheetProps = {
  memberId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PendingMemberDetailsSheet({
  memberId,
  open,
  onOpenChange,
}: PendingMemberDetailsSheetProps) {
  const { data, isLoading, isError, error } = useMemberByIdQuery(
    memberId ?? "",
    open && Boolean(memberId),
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent showCloseButton={false} className="w-full gap-0 overflow-y-auto no-scrollbar p-0 max-w-5xl!">
        <SheetHeader className="sr-only">
          <SheetTitle>Pending application details</SheetTitle>
          <SheetDescription>
            Resume-style preview of the applicant profile and submitted
            requirements.
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="flex min-h-full items-center justify-center p-10 text-muted-foreground">
            <LoaderCircle className="size-4 animate-spin" />
            <span className="ml-2">Loading application details...</span>
          </div>
        ) : isError ? (
          <div className="p-8 text-sm text-destructive">
            {error instanceof Error
              ? error.message
              : "Unable to load this application right now."}
          </div>
        ) : data ? (
          <div className="min-h-full bg-slate-50">
            <div className="grid min-h-full lg:grid-cols-[380px_minmax(0,1fr)]">
              <aside className="bg-linear-to-b from-green-900 via-green-800 to-slate-900 p-8 text-white">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="size-30 border-4 border-white/80 shadow-xl">
                    {data.user.avatar ? (
                      <AvatarImage
                        src={data.user.avatar}
                        alt={buildMemberName(data)}
                        className="object-cover"
                      />
                    ) : null}
                    <AvatarFallback className="bg-white/15 text-3xl font-bold text-white">
                      {getMemberInitials(buildMemberName(data))}
                    </AvatarFallback>
                  </Avatar>

                  <h2 className="mt-6 text-2xl font-semibold tracking-tight">
                    {buildMemberName(data)}
                  </h2>
                  <p className="mt-2 text-sm text-sky-100/90">
                    {formatEnumLabel(data.memberType)}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    <Badge className="border-yellow-200/40 bg-yellow-300/15 text-yellow-100 hover:bg-yellow-300/15">
                      Pending
                    </Badge>
                    <Badge className="border-white/20 bg-white/10 text-white hover:bg-white/10">
                      Applied {formatDate(data.createdAt)}
                    </Badge>
                  </div>
                </div>

                <div className="mt-10 space-y-8">
                  <ResumeRailSection title="Contact">
                    <RailItem
                      icon={<Mail className="size-4" />}
                      lines={[data.user.email]}
                    />
                    <RailItem
                      icon={<Phone className="size-4" />}
                      lines={[data.mobilePhoneNumber || "No mobile number"]}
                    />
                    <RailItem
                      icon={<MapPin className="size-4" />}
                      lines={[buildAddress(data)]}
                    />
                  </ResumeRailSection>

                  <ResumeRailSection title="Profile">
                    <p className="text-sm">
                      {buildProfileSummary(data)}
                    </p>
                  </ResumeRailSection>

                  <ResumeRailSection title="General Information">
                    <RailKeyValue
                      label="Gender"
                      value={formatEnumLabel(data.gender)}
                    />
                    <RailKeyValue
                      label="Civil Status"
                      value={data.civilStatus || "Not provided"}
                    />
                    <RailKeyValue
                      label="Nationality"
                      value={data.nationality || "Not provided"}
                    />
                    <RailKeyValue
                      label="Birth Date"
                      value={formatDate(data.dateOfBirth)}
                    />
                    <RailKeyValue
                      label="Branch"
                      value={data.preferredBranchOther || "Not provided"}
                    />
                  </ResumeRailSection>

                  <ResumeRailSection title="Application Signals">
                    <RailKeyValue
                      label="Current Step"
                      value={formatEnumLabel(
                        data.onboardingProgress?.currentStep || "REQUIREMENTS",
                      )}
                    />
                    <RailKeyValue
                      label="Pre-orientation"
                      value={`${data.onboardingProgress?.preOrientationCompletedLessonIds?.length ?? 0} lessons`}
                    />
                    <RailKeyValue
                      label="Payment"
                      value={
                        data.paymentCheckout
                          ? formatEnumLabel(data.paymentCheckout.paymentMethod)
                          : "Not started"
                      }
                    />
                    <RailKeyValue
                      label="Interview"
                      value={
                        data.onlineInterviewAppointment
                          ? `${formatEnumLabel(data.onlineInterviewAppointment.day)} ${data.onlineInterviewAppointment.timeSlot}`
                          : "Not scheduled"
                      }
                    />
                  </ResumeRailSection>
                </div>
              </aside>

              <main className="bg-white px-8 py-5 lg:px-10">
                <div className="space-y-8">
                  <ResumeSection
                    title="Application Overview"
                    icon={<UserRound className="size-4" />}
                  >
                    <p className="text-sm leading-7 text-slate-700">
                      {buildOverviewSummary(data)}
                    </p>
                  </ResumeSection>

                  <ResumeSection
                    title="Experience"
                    icon={<CalendarDays className="size-4" />}
                  >
                    <ResumeEntry
                      heading={data.currentPositionRole || "Current role not provided"}
                      subheading={
                        data.churchAffiliation
                          ? `${data.churchAffiliation}${
                              data.churchAddress ? `, ${data.churchAddress}` : ""
                            }`
                          : "Church affiliation not provided"
                      }
                      bullets={[
                        data.currentPositionRoleOther
                          ? `Additional role details: ${data.currentPositionRoleOther}`
                          : null,
                        data.skillsTalents
                          ? `Skills and talents: ${data.skillsTalents}`
                          : null,
                        data.preferredBranchOther
                          ? `Preferred branch of service: ${data.preferredBranchOther}`
                          : null,
                      ]}
                    />
                    {data.ministerialExperiences?.length ? (
                      data.ministerialExperiences.map((experience) => (
                        <ResumeEntry
                          key={experience.id}
                          heading={experience.roleDescription}
                          subheading="Ministerial experience"
                          caption={experience.yearsApprox}
                        />
                      ))
                    ) : (
                      <EmptyCopy text="No ministerial experience entries were submitted." />
                    )}
                  </ResumeSection>

                  <ResumeSection
                    title="Education"
                    icon={<FileText className="size-4" />}
                  >
                    <ResumeEntry
                      heading={data.postGraduateStudies || "Post-graduate studies not provided"}
                      subheading="Post-graduate"
                    />
                    <ResumeEntry
                      heading={data.tertiaryCollege || "Tertiary education not provided"}
                      subheading="College / tertiary"
                    />
                    <ResumeEntry
                      heading={data.secondarySchool || "Secondary school not provided"}
                      subheading="Secondary"
                    />
                    <ResumeEntry
                      heading={data.elementarySchool || "Elementary school not provided"}
                      subheading="Elementary"
                    />
                  </ResumeSection>

                  <ResumeSection
                    title="References"
                    icon={<UserRound className="size-4" />}
                  >
                    {data.characterReferences?.length ? (
                      data.characterReferences.map((reference) => (
                        <ResumeEntry
                          key={reference.id}
                          heading={reference.name}
                          subheading={reference.positionRelationship}
                          caption={reference.contactNumber}
                        />
                      ))
                    ) : (
                      <EmptyCopy text="No character references were submitted." />
                    )}
                  </ResumeSection>

                  <ResumeSection
                    title="Attachments"
                    icon={<FileText className="size-4" />}
                  >
                    {data.applicantRequirements?.length ? (
                      <div className="space-y-4">
                        {data.applicantRequirements.map((item) => (
                          <div
                            key={item.id}
                            className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between"
                          >
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-medium text-slate-900">
                                  {formatEnumLabel(item.type)}
                                </p>
                                <Badge variant={getRequirementBadgeVariant(item.reviewStatus)}>
                                  {formatEnumLabel(item.reviewStatus)}
                                </Badge>
                              </div>
                              <p className="mt-1 text-sm text-slate-600">
                                {item.fileName || item.mimeType || "Attachment uploaded"}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                Updated {formatDate(item.updatedAt)}
                              </p>
                            </div>
                            <Button asChild variant="outline" size="sm">
                              <a href={item.fileUrl} target="_blank" rel="noreferrer">
                                <ExternalLink className="size-4" />
                                Open file
                              </a>
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyCopy text="No attachments uploaded yet." />
                    )}
                  </ResumeSection>
                </div>
              </main>
            </div>
          </div>
        ) : (
          <div className="p-8 text-sm text-muted-foreground">
            No member selected.
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function ResumeRailSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h3 className="text-xs font-semibold uppercase">
        {title}
      </h3>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

function RailItem({
  icon,
  lines,
}: {
  icon: ReactNode;
  lines: string[];
}) {
  return (
    <div className="flex gap-2 text-sm">
      <div className="mt-0.5">{icon}</div>
      <div className="space-y-1">
        {lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </div>
  );
}

function RailKeyValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-medium uppercase">
        {label}
      </p>
      <p className="text-sm">{value}</p>
    </div>
  );
}

function ResumeSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center gap-2 text-green-800">
        {icon}
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <Separator className="mt-3 mb-5" />
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function ResumeEntry({
  heading,
  subheading,
  caption,
  bullets,
}: {
  heading: string;
  subheading: string;
  caption?: string;
  bullets?: Array<string | null | undefined>;
}) {
  const visibleBullets = bullets?.filter(Boolean) ?? [];

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-semibold text-slate-900">{heading}</p>
          <p className="text-sm text-slate-600">{subheading}</p>
        </div>
        {caption ? (
          <p className="text-xs font-medium uppercase text-slate-500">
            {caption}
          </p>
        ) : null}
      </div>
      {visibleBullets.length ? (
        <ul className="space-y-1.5 pl-5 text-sm leading-5 text-slate-700">
          {visibleBullets.map((bullet) => (
            <li key={bullet} className="list-disc">
              {bullet}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function EmptyCopy({ text }: { text: string }) {
  return <p className="text-sm text-slate-600">{text}</p>;
}

function buildMemberName(member: {
  firstName: string;
  middleInitial: string | null;
  lastName: string;
  extensionName: string | null;
}) {
  return [
    member.firstName,
    member.middleInitial ? `${member.middleInitial.replace(/\.$/, "")}.` : null,
    member.lastName,
    member.extensionName,
  ]
    .filter(Boolean)
    .join(" ");
}

function getMemberInitials(fullName: string) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function buildAddress(member: {
  barangay: string | null;
  municipalityCity: string | null;
  province: string | null;
  region: string | null;
}) {
  return (
    [
      member.barangay ? `Barangay ${member.barangay}` : null,
      member.municipalityCity,
      member.province,
      member.region,
    ]
      .filter(Boolean)
      .join(", ") || "Not provided"
  );
}

function buildProfileSummary(member: {
  currentPositionRole: string | null;
  churchAffiliation: string | null;
  skillsTalents: string | null;
  preferredBranchOther: string | null;
}) {
  const fragments = [
    member.currentPositionRole
      ? `Currently serving as ${member.currentPositionRole}.`
      : null,
    member.churchAffiliation
      ? `Connected with ${member.churchAffiliation}.`
      : null,
    member.preferredBranchOther
      ? `Interested in ${member.preferredBranchOther}.`
      : null,
    member.skillsTalents
      ? `Highlights strengths in ${member.skillsTalents}.`
      : null,
  ].filter(Boolean);

  return (
    fragments.join(" ") ||
    "This applicant has submitted a pending membership application for review."
  );
}

function buildOverviewSummary(member: {
  firstName: string;
  churchAffiliation: string | null;
  nationality: string | null;
  preferredBranchOther: string | null;
  applicantRequirements?: { id: string }[];
  onboardingProgress?: { currentStep: string } | null;
}) {
  return `${member.firstName} submitted a pending membership application${
    member.churchAffiliation ? ` through ${member.churchAffiliation}` : ""
  }${member.nationality ? ` as a ${member.nationality} applicant` : ""}. ${
    member.preferredBranchOther
      ? `The application indicates interest in ${member.preferredBranchOther}.`
      : "No preferred branch of service was specified."
  } ${
    member.applicantRequirements?.length
      ? `${member.applicantRequirements.length} supporting requirement file(s) were uploaded.`
      : "No supporting requirements have been uploaded yet."
  } Current progress is marked at ${formatEnumLabel(
    member.onboardingProgress?.currentStep || "REQUIREMENTS",
  )}.`;
}

function formatEnumLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

function formatDate(value: string | null) {
  if (!value) return "Not available";
  return format(new Date(value), "MMM d, yyyy");
}

function getRequirementBadgeVariant(status: string) {
  if (status === "APPROVED") return "success";
  if (status === "REJECTED") return "error";
  return "warning";
}
