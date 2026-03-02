"use client"

import { useMemo, useState } from "react"
import { AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"

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
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { ChangeOfficeHeadDialog } from "./change-office-head-dialog"
import { initialOfficeData, type Office } from "./office-data"
import { organizationUsers, type OfficeUser } from "./office-users"
import { OfficeStatsOverview } from "./office-stats-overview"
import { OfficesDataTable } from "./offices-data-table"

export function OrganizationalStructureManager() {
  const router = useRouter()
  const { toast } = useToast()
  const [offices, setOffices] = useState<Office[]>(initialOfficeData)
  const [isChangeHeadDialogOpen, setIsChangeHeadDialogOpen] = useState(false)
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false)
  const [selectedOfficeId, setSelectedOfficeId] = useState<string | null>(null)
  const [archiveTargetOfficeId, setArchiveTargetOfficeId] = useState<string | null>(null)

  const activeOffices = useMemo(
    () => offices.filter((office) => office.status === "Active").length,
    [offices]
  )

  const handleDeleteOffices = (officeIds: string[]) => {
    const ids = new Set(officeIds)
    setOffices((current) => current.filter((office) => !ids.has(office.id)))
  }

  const updateOffice = (officeId: string, updater: (office: Office) => Office) => {
    setOffices((current) =>
      current.map((office) => (office.id === officeId ? updater(office) : office))
    )
  }

  const handleEditOffice = (officeId: string) => {
    router.push(`/organizational-structure/${officeId}`)
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

  const handleRequestArchiveOffice = (officeId: string) => {
    setArchiveTargetOfficeId(officeId)
    setIsArchiveDialogOpen(true)
  }

  const handleConfirmArchiveOffice = () => {
    if (!archiveTargetOfficeId) return
    handleArchiveOffice(archiveTargetOfficeId)
    setIsArchiveDialogOpen(false)
    setArchiveTargetOfficeId(null)
  }

  const handleRetrieveOffice = (officeId: string) => {
    updateOffice(officeId, (office) => ({
      ...office,
      status: "Active",
      updatedAt: new Date().toISOString().slice(0, 10),
    }))
    toast({
      variant: "success",
      title: "Office retrieved",
      description: "The office is active again.",
    })
  }

  const handleOpenChangeHeadOffice = (officeId: string) => {
    setSelectedOfficeId(officeId)
    setIsChangeHeadDialogOpen(true)
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
    <section className="space-y-7">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Organizational Structure
          </h1>
          <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
            One organization, many offices. Define office posts, assign heads, and maintain role expectations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => router.push("/organizational-structure/new")}>
            Create Office
          </Button>
        </div>
      </div>

      <OfficeStatsOverview offices={offices} />

      <Card className="bg-transparent">
        <CardHeader className="border-b pb-4">
          <CardTitle>Office Directory</CardTitle>
          <CardDescription className="max-w-3xl leading-relaxed">
            {offices.length} offices registered, {activeOffices} active. This directory tracks office posts and assigned heads only.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OfficesDataTable
            data={offices}
            onDeleteOffices={handleDeleteOffices}
            onEditOffice={handleEditOffice}
            onRequestArchiveOffice={handleRequestArchiveOffice}
            onRetrieveOffice={handleRetrieveOffice}
            onChangeHeadOffice={handleOpenChangeHeadOffice}
          />
        </CardContent>
      </Card>

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
