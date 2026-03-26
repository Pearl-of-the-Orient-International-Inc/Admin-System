"use client"

import { useState } from "react"
import { AlertTriangle } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageEmptyState } from "@/components/PageEmptyState"
import { PageErrorState } from "@/components/PageErrorState"
import { PageLoadingState } from "@/components/PageLoadingState"
import { useToast } from "@/hooks/use-toast"
import { useAllOfficerAssignmentsQuery } from "@/features/officer-assignment/officer-assignment.hooks"
import { ChangeOfficeHeadDialog } from "./change-office-head-dialog"
import { AssignedOfficeHoldersTable } from "./assigned-office-holders-table"
import { initialOfficeData, type Office } from "./office-data"
import { organizationUsers, type OfficeUser } from "./office-users"
import { OfficeStatsOverview } from "./office-stats-overview"

export function OrganizationalStructureManager() {
  const { toast } = useToast()
  const [offices, setOffices] = useState<Office[]>(initialOfficeData)
  const [isChangeHeadDialogOpen, setIsChangeHeadDialogOpen] = useState(false)
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false)
  const [selectedOfficeId, setSelectedOfficeId] = useState<string | null>(null)
  const [archiveTargetOfficeId, setArchiveTargetOfficeId] = useState<string | null>(null)
  const officerAssignmentsQuery = useAllOfficerAssignmentsQuery({ activeOnly: true })
  const hasNoOfficeAssignments =
    !officerAssignmentsQuery.isLoading &&
    !officerAssignmentsQuery.isError &&
    (officerAssignmentsQuery.data?.length ?? 0) === 0

  const updateOffice = (officeId: string, updater: (office: Office) => Office) => {
    setOffices((current) =>
      current.map((office) => (office.id === officeId ? updater(office) : office))
    )
  }

  const handleArchiveOffice = (officeId: string) => {
    updateOffice(officeId, (office) => ({
      ...office,
      status: "Inactive",
      updatedAt: new Date().toISOString().slice(0, 10),
    }))
    toast({
      variant: "warning",
      title: "Office archived",
      description: "The office has been archived and can be retrieved anytime.",
    })
  }

  const handleConfirmArchiveOffice = () => {
    if (!archiveTargetOfficeId) return
    handleArchiveOffice(archiveTargetOfficeId)
    setIsArchiveDialogOpen(false)
    setArchiveTargetOfficeId(null)
  }

  const handleConfirmChangeHeadOffice = (user: OfficeUser) => {
    if (!selectedOfficeId) return

    updateOffice(selectedOfficeId, (office) => ({
      ...office,
      head: user.name,
      updatedAt: new Date().toISOString().slice(0, 10),
    }))

    toast({
      variant: "success",
      title: "Head/Admin updated",
      description: `${user.name} is now assigned to this office.`,
    })

    setIsChangeHeadDialogOpen(false)
    setSelectedOfficeId(null)
  }

  const selectedOffice = selectedOfficeId
    ? offices.find((office) => office.id === selectedOfficeId) ?? null
    : null

  const handleDialogOpenChange = (open: boolean) => {
    setIsChangeHeadDialogOpen(open)
    if (!open) {
      setSelectedOfficeId(null)
    }
  }

  return (
    <section className="space-y-7 p-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Organizational Structure
          </h1>
          <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
            One organization, many offices. Define office posts, assign heads, and maintain role expectations.
          </p>
        </div>
      </div>

      {hasNoOfficeAssignments ? (
        <PageEmptyState
          title="No office assignments found"
          description="Create office titles and assign members to start building the organizational structure."
          createUrl="/organizational-structure/office-title/new"
          createLabel="Create office title"
        />
      ) : (
        <>
          <OfficeStatsOverview offices={offices} />
          <Card className="bg-transparent">
            <CardHeader className="border-b pb-4">
              <CardTitle>Assigned Office Holders</CardTitle>
              <CardDescription className="max-w-3xl leading-relaxed">
                Overview of active members currently holding office assignments.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {officerAssignmentsQuery.isLoading ? (
                <PageLoadingState mode="table" />
              ) : officerAssignmentsQuery.isError ? (
                <PageErrorState
                  title="Unable to load office holders"
                  description={
                    officerAssignmentsQuery.error instanceof Error
                      ? officerAssignmentsQuery.error.message
                      : "The current office holder assignments could not be loaded right now."
                  }
                  backUrl="/dashboard"
                  backLabel="Back to dashboard"
                  className="min-h-40"
                />
              ) : (
                <AssignedOfficeHoldersTable data={officerAssignmentsQuery.data ?? []} />
              )}
            </CardContent>
          </Card>
        </>
      )}

      <AlertDialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <AlertTriangle />
            </AlertDialogMedia>
            <AlertDialogTitle>Archive this office?</AlertDialogTitle>
            <AlertDialogDescription>
              This office will be marked as inactive. You can retrieve it later from the same action menu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setArchiveTargetOfficeId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleConfirmArchiveOffice}>
              Archive Office
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ChangeOfficeHeadDialog
        key={selectedOfficeId ?? "change-head-dialog"}
        open={isChangeHeadDialogOpen}
        onOpenChange={handleDialogOpenChange}
        office={selectedOffice}
        users={organizationUsers}
        onConfirm={handleConfirmChangeHeadOffice}
      />
    </section>
  )
}
