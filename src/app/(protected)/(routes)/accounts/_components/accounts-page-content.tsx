"use client";

import { useMemo } from "react";
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
  useUpdateAccountMutation,
} from "@/features/accounts/account.hooks";
import { type AccountRecord } from "./accounts-data";
import { AccountsDataTable } from "./accounts-data-table";
import { RegisterAccountButton } from "./register-account-button";

export function AccountsPageContent() {
  const { toast } = useToast();
  const accountsQuery = useAccountsQuery();
  const updateAccountMutation = useUpdateAccountMutation();

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
              <div className="rounded-lg border bg-card hover:border-primary p-4 shadow-xs">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-muted-foreground text-xs font-medium uppercase">
                    Total Accounts
                  </p>
                  <span className="rounded-md bg-blue-700/10 p-1.5 text-blue-700 dark:bg-blue-300/10 dark:text-blue-300">
                    <UsersRound className="size-4" />
                  </span>
                </div>
                <p className="text-2xl font-semibold">{totalAccounts}</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  All registered administrator profiles
                </p>
              </div>

              <div className="rounded-lg border bg-card hover:border-primary p-4 shadow-xs">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-muted-foreground text-xs font-medium uppercase">
                    Active
                  </p>
                  <span className="rounded-md bg-emerald-700/10 p-1.5 text-emerald-700 dark:bg-emerald-300/10 dark:text-emerald-300">
                    <CheckCircle2 className="size-4" />
                  </span>
                </div>
                <p className="text-2xl font-semibold">{activeAccounts}</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  Accounts currently able to sign in
                </p>
              </div>

              <div className="rounded-lg border bg-card hover:border-primary p-4 shadow-xs">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-muted-foreground text-xs font-medium uppercase">
                    Pending
                  </p>
                  <span className="rounded-md bg-amber-700/10 p-1.5 text-amber-700 dark:bg-amber-300/10 dark:text-amber-300">
                    <Clock3 className="size-4" />
                  </span>
                </div>
                <p className="text-2xl font-semibold">{pendingAccounts}</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  Accounts waiting for full activation
                </p>
              </div>

              <div className="rounded-lg border bg-card hover:border-primary p-4 shadow-xs">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-muted-foreground text-xs font-medium uppercase">
                    2FA Coverage
                  </p>
                  <span className="rounded-md bg-violet-700/10 p-1.5 text-violet-700 dark:bg-violet-300/10 dark:text-violet-300">
                    {twoFactorRate >= 50 ? (
                      <ShieldCheck className="size-4" />
                    ) : (
                      <ShieldX className="size-4" />
                    )}
                  </span>
                </div>
                <p className="text-2xl font-semibold">{twoFactorRate}%</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  Accounts with two-factor authentication enabled
                </p>
              </div>
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
                  data={accounts}
                  onArchiveAccount={handleArchiveAccount}
                  onRetrieveAccount={handleRetrieveAccount}
                />
              )}
            </CardContent>
          </Card>
        </>
      )}
    </section>
  );
}
