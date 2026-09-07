"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  ShieldCheck,
  ShieldX,
  UsersRound,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserAccountStatus, UserPosition, UserType } from "@/enums";
import { useToast } from "@/hooks/use-toast";
import { toApiError } from "@/features/auth/auth.hooks";
import { PageEmptyState } from "@/components/PageEmptyState";
import { PageErrorState } from "@/components/PageErrorState";
import { PageLoadingState } from "@/components/PageLoadingState";
import {
  useAccountsQuery,
  useChangeAccountPasswordMutation,
  useResendAccountEmailVerificationMutation,
  useUpdateAccountMutation,
  useVerifyAccountEmailMutation,
} from "@/features/accounts/account.hooks";
import { type AccountRecord } from "./accounts-data";
import { AccountsDataTable } from "./accounts-data-table";
import { RegisterAccountButton } from "./register-account-button";
import { SummaryStatCard } from "@/components/SummaryStatCard";

type AccountSummaryFilter = "ALL" | "ACTIVE" | "PENDING" | "TWO_FACTOR";

export function AccountsPageContent() {
  const { toast } = useToast();
  const [summaryFilter, setSummaryFilter] =
    useState<AccountSummaryFilter>("ALL");
  const accountsQuery = useAccountsQuery();
  const updateAccountMutation = useUpdateAccountMutation();
  const changeAccountPasswordMutation = useChangeAccountPasswordMutation();
  const resendAccountEmailVerificationMutation =
    useResendAccountEmailVerificationMutation();
  const verifyAccountEmailMutation = useVerifyAccountEmailMutation();

  const accounts = useMemo<AccountRecord[]>(
    () =>
      (accountsQuery.data ?? []).map((user) => ({
        id: user.id,
        fullName: user.name,
        email: user.email,
        avatar: user.avatar ?? undefined,
        role: UserType.ADMIN,
        position: (user.position as UserPosition | null) ?? null,
        status: user.accountStatus ?? UserAccountStatus.ACTIVE,
        isEmailVerified: Boolean(user.isEmailVerified),
        isTwoFactorEnabled: Boolean(user.isTwoFactorEnabled),
        createdAt: user.createdAt,
        lastSignInAt: user.updatedAt ?? user.createdAt,
      })),
    [accountsQuery.data],
  );

  const totalAccounts = accounts.length;
  const hasNoAccounts =
    !accountsQuery.isLoading && !accountsQuery.isError && accounts.length === 0;
  const activeAccounts = useMemo(
    () =>
      accounts.filter((account) => account.status === UserAccountStatus.ACTIVE)
        .length,
    [accounts],
  );
  const pendingAccounts = useMemo(
    () =>
      accounts.filter((account) => account.status === UserAccountStatus.PENDING)
        .length,
    [accounts],
  );
  const twoFactorEnabled = useMemo(
    () => accounts.filter((account) => account.isTwoFactorEnabled).length,
    [accounts],
  );
  const twoFactorRate = totalAccounts
    ? Math.round((twoFactorEnabled / totalAccounts) * 100)
    : 0;
  const filteredAccounts = useMemo(() => {
    if (summaryFilter === "ACTIVE") {
      return accounts.filter(
        (account) => account.status === UserAccountStatus.ACTIVE,
      );
    }

    if (summaryFilter === "PENDING") {
      return accounts.filter(
        (account) => account.status === UserAccountStatus.PENDING,
      );
    }

    if (summaryFilter === "TWO_FACTOR") {
      return accounts.filter((account) => account.isTwoFactorEnabled);
    }

    return accounts;
  }, [accounts, summaryFilter]);

  const handleArchiveAccount = async (accountId: string) => {
    try {
      await updateAccountMutation.mutateAsync({
        userId: accountId,
        payload: { accountStatus: UserAccountStatus.SUSPENDED },
      });
      toast({
        title: "Account archived",
        description: "The account has been suspended.",
        variant: "success",
      });
    } catch (error: unknown) {
      const apiError = toApiError(error);
      toast({
        title: "Archive failed",
        description: apiError.message ?? "Unable to archive account.",
        variant: "error",
      });
    }
  };

  const handleRetrieveAccount = async (accountId: string) => {
    try {
      await updateAccountMutation.mutateAsync({
        userId: accountId,
        payload: { accountStatus: UserAccountStatus.ACTIVE },
      });
      toast({
        title: "Account retrieved",
        description: "The account has been reactivated.",
        variant: "success",
      });
    } catch (error: unknown) {
      const apiError = toApiError(error);
      toast({
        title: "Retrieve failed",
        description: apiError.message ?? "Unable to retrieve account.",
        variant: "error",
      });
    }
  };

  const handleChangeAccountPassword = async (
    account: AccountRecord,
    password: string,
    confirmPassword: string,
  ) => {
    try {
      await changeAccountPasswordMutation.mutateAsync({
        userId: account.id,
        password,
        confirmPassword,
      });
      toast({
        title: "Password updated",
        description: `${account.fullName}'s password has been changed.`,
        variant: "success",
      });
    } catch (error: unknown) {
      const apiError = toApiError(error);
      toast({
        title: "Password update failed",
        description: apiError.message ?? "Unable to change account password.",
        variant: "error",
      });
      throw error;
    }
  };

  const handleResendAccountEmailVerification = async (
    account: AccountRecord,
  ) => {
    try {
      await resendAccountEmailVerificationMutation.mutateAsync(account.id);
      toast({
        title: "Verification email sent",
        description: `A verification link was sent to ${account.email}.`,
        variant: "success",
      });
    } catch (error: unknown) {
      const apiError = toApiError(error);
      toast({
        title: "Resend failed",
        description:
          apiError.message ?? "Unable to resend account verification email.",
        variant: "error",
      });
    }
  };

  const handleVerifyAccountEmail = async (account: AccountRecord) => {
    try {
      await verifyAccountEmailMutation.mutateAsync(account.id);
      toast({
        title: "Email verified",
        description: `${account.email} is now marked as verified.`,
        variant: "success",
      });
    } catch (error: unknown) {
      const apiError = toApiError(error);
      toast({
        title: "Verification failed",
        description: apiError.message ?? "Unable to verify account email.",
        variant: "error",
      });
    }
  };

  return (
    <section className="space-y-6 p-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Admin Accounts
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage administrator accounts for the admin portal.
          </p>
        </div>
        {!hasNoAccounts && <RegisterAccountButton />}
      </div>

      {hasNoAccounts ? (
        <PageEmptyState
          title="No admin accounts found"
          description="Create the first administrator account to start managing portal access."
          createUrl="/accounts/new"
          createLabel="Register admin account"
        />
      ) : (
        <>
          <Card className="overflow-hidden bg-transparent">
            <CardHeader className="border-b pb-4">
              <CardTitle>Account Summary</CardTitle>
              <CardDescription>
                Current status of administrative accounts.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <SummaryStatCard
                label="Total Accounts"
                value={totalAccounts}
                description="All registered administrator profiles"
                icon={<UsersRound className="size-4" />}
                accentClassName="bg-blue-700/10 text-blue-700 dark:bg-blue-300/10 dark:text-blue-300"
                active={summaryFilter === "ALL"}
                onClick={() => setSummaryFilter("ALL")}
              />
              <SummaryStatCard
                label="Active"
                value={activeAccounts}
                description="Accounts currently able to sign in"
                icon={<CheckCircle2 className="size-4" />}
                accentClassName="bg-emerald-700/10 text-emerald-700 dark:bg-emerald-300/10 dark:text-emerald-300"
                active={summaryFilter === "ACTIVE"}
                onClick={() => setSummaryFilter("ACTIVE")}
              />
              <SummaryStatCard
                label="Pending"
                value={pendingAccounts}
                description="Accounts waiting for full activation"
                icon={<Clock3 className="size-4" />}
                accentClassName="bg-amber-700/10 text-amber-700 dark:bg-amber-300/10 dark:text-amber-300"
                active={summaryFilter === "PENDING"}
                onClick={() => setSummaryFilter("PENDING")}
              />
              <SummaryStatCard
                label="2FA Coverage"
                value={`${twoFactorRate}%`}
                description="Accounts with two-factor authentication enabled"
                icon={
                  twoFactorRate >= 50 ? (
                    <ShieldCheck className="size-4" />
                  ) : (
                    <ShieldX className="size-4" />
                  )
                }
                accentClassName="bg-violet-700/10 text-violet-700 dark:bg-violet-300/10 dark:text-violet-300"
                active={summaryFilter === "TWO_FACTOR"}
                onClick={() => setSummaryFilter("TWO_FACTOR")}
              />
            </CardContent>
          </Card>

          <Card className="bg-transparent">
            <CardHeader className="border-b pb-4">
              <CardTitle>Accounts Directory</CardTitle>
              <CardDescription>
                Search, export, and perform batch actions on admin accounts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {accountsQuery.isLoading ? (
                <PageLoadingState mode="table" />
              ) : accountsQuery.isError ? (
                <PageErrorState
                  title="Unable to load admin accounts"
                  description={
                    accountsQuery.error instanceof Error
                      ? accountsQuery.error.message
                      : "Administrator accounts could not be loaded right now."
                  }
                  backUrl="/dashboard"
                  backLabel="Back to dashboard"
                />
              ) : (
                <AccountsDataTable
                  data={filteredAccounts}
                  changingPasswordAccountId={
                    changeAccountPasswordMutation.isPending
                      ? changeAccountPasswordMutation.variables?.userId ?? null
                      : null
                  }
                  resendingVerificationAccountId={
                    resendAccountEmailVerificationMutation.isPending
                      ? resendAccountEmailVerificationMutation.variables ?? null
                      : null
                  }
                  verifyingEmailAccountId={
                    verifyAccountEmailMutation.isPending
                      ? verifyAccountEmailMutation.variables ?? null
                      : null
                  }
                  onArchiveAccount={handleArchiveAccount}
                  onRetrieveAccount={handleRetrieveAccount}
                  onChangeAccountPassword={handleChangeAccountPassword}
                  onResendAccountEmailVerification={
                    handleResendAccountEmailVerification
                  }
                  onVerifyAccountEmail={handleVerifyAccountEmail}
                />
              )}
            </CardContent>
          </Card>
        </>
      )}
    </section>
  );
}
