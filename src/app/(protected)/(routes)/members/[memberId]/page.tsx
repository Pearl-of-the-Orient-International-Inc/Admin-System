"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Info, LoaderCircle } from "lucide-react";

import { MembershipApplicationForm } from "@/shared/membership-application/MembershipApplicationForm";
import type { ApplicationFormState } from "@/shared/membership-application/types";
import { getBarangays } from "@/constants/barangay";
import { getMunicipalities } from "@/constants/municipality";
import { getProvinces } from "@/constants/province";
import { getRegions } from "@/constants/region";
import {
  useCreateMemberMutation,
  useMemberByIdQuery,
  useUpdateMemberMutation,
} from "@/features/members/member.hooks";
import { toApiError } from "@/features/auth/auth.hooks";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  mapFormToMemberPayload,
  mapMemberToFormState,
} from "../_components/member-form-mappers";

export default function AdminMemberFormPage() {
  const params = useParams<{ memberId: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const createMemberMutation = useCreateMemberMutation();
  const updateMemberMutation = useUpdateMemberMutation();

  const routeMemberId = Array.isArray(params.memberId)
    ? params.memberId[0] ?? "new"
    : params.memberId ?? "new";
  const isCreateMode = routeMemberId === "new";

  const {
    data: existingMember,
    isLoading,
    isError,
  } = useMemberByIdQuery(routeMemberId, !isCreateMode);

  const handleSubmit = async (form: ApplicationFormState) => {
    const payload = mapFormToMemberPayload(form);

    try {
      if (isCreateMode) {
        const result = await createMemberMutation.mutateAsync(payload);
        toast({
          title: "Member profile created",
          description: result.createdUser
            ? result.emailSent
              ? "The member account and profile were created successfully, and the temporary password was sent to the member's email."
              : "The member account and profile were created successfully, but the welcome email could not be sent."
            : "The member profile was linked to the existing member account successfully.",
          variant: "success",
        });
      } else {
        await updateMemberMutation.mutateAsync({
          memberId: routeMemberId,
          payload,
        });
        toast({
          title: "Member updated",
          description: "The member details were updated successfully.",
          variant: "success",
        });
      }

      router.push("/members");
    } catch (error) {
      const apiError = toApiError(error);
      const message =
        apiError.message ??
        (error instanceof Error
          ? error.message
          : isCreateMode
            ? "Unable to create member profile."
            : "Unable to update member profile.");

      toast({
        title: isCreateMode ? "Creation failed" : "Update failed",
        description: message,
        variant: "error",
      });
      throw new Error(message);
    }
  };

  if (!isCreateMode && isLoading) {
    return (
      <section className="space-y-6 p-10">
        <div className="flex min-h-80 items-center justify-center rounded-xl border border-dashed text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" />
          <span className="ml-2">Loading member details...</span>
        </div>
      </section>
    );
  }

  if (!isCreateMode && (isError || !existingMember)) {
    return (
      <section className="space-y-6 p-10">
        <Card>
          <CardHeader>
            <CardTitle>Member not found</CardTitle>
            <CardDescription>
              We couldn&apos;t load the requested member record for editing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/members">
                <ArrowLeft className="size-4" />
                Back to members
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-6 p-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {isCreateMode ? "Add New Member" : "Edit Member"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {isCreateMode
              ? "Encode a member profile directly from the admin side without sending the member through the website onboarding flow."
              : "Update the stored member information using the same admin membership form."}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/members">
            <ArrowLeft className="size-4" />
            Back to members
          </Link>
        </Button>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <MembershipApplicationForm
          storageKey={`pearl-admin-member-application-draft-${routeMemberId}`}
          locationCatalog={{
            getRegions,
            getProvinces,
            getMunicipalities,
            getBarangays,
          }}
          initialForm={existingMember ? mapMemberToFormState(existingMember) : undefined}
          emailMode="editable"
          emailHelperText={
            isCreateMode
              ? "This email will be used to create or link the member's account. If a new account is created, a temporary password will be sent there."
              : "Updating this email will also update the linked member account."
          }
          submitLabel={isCreateMode ? "Create member" : "Save changes"}
          submittingLabel={isCreateMode ? "Creating member..." : "Saving changes..."}
          successMessage={
            isCreateMode
              ? "Member profile created successfully."
              : "Member profile updated successfully."
          }
          footerMessage={
            isCreateMode
              ? "This admin form auto-saves as a local draft while you encode the member's information."
              : "This edit form auto-saves as a local draft while you update the member's information."
          }
          clearDraftOnSuccess
          onSubmitAction={handleSubmit}
        />

        <Card className="sticky top-6">
          <CardHeader className="border-b">
            <CardTitle>Admin Notes</CardTitle>
            <CardDescription>
              This route is protected by the existing admin session guard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6 text-sm text-muted-foreground">
            <p>
              {isCreateMode
                ? "This flow creates the member record directly in the database and skips website onboarding entirely."
                : "This flow reuses the same membership form to edit an existing member record from the admin side."}
            </p>
            <div className="flex gap-3 rounded-lg border border-dashed bg-muted/40 px-3 py-3">
              <Info className="mt-0.5 size-4 shrink-0 text-foreground" />
              <p>
                Guests cannot access this page because it lives under the admin
                protected routes. Only authenticated admin users can open it.
              </p>
            </div>
            <p>
              Draft save remains local to the browser, so admins can continue
              later before submitting the final member profile.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
