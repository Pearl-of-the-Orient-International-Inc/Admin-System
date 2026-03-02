"use client"

import { useState } from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Office, OfficeStatus } from "./office-data"

type CreateOfficeInput = Omit<Office, "id" | "updatedAt">

type CreateOfficeDialogProps = {
  onCreateOffice: (office: CreateOfficeInput) => void
}

const initialForm: CreateOfficeInput = {
  officeTitle: "",
  department: "",
  head: "",
  jobDescription: "",
  obligations: "",
  dutiesAndResponsibilities: "",
  status: "Active",
}

export function CreateOfficeDialog({ onCreateOffice }: CreateOfficeDialogProps) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(initialForm)

  const setField = <K extends keyof CreateOfficeInput>(
    key: K,
    value: CreateOfficeInput[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onCreateOffice({
      officeTitle: form.officeTitle.trim(),
      department: form.department.trim(),
      head: form.head.trim(),
      jobDescription: form.jobDescription.trim(),
      obligations: form.obligations.trim(),
      dutiesAndResponsibilities: form.dutiesAndResponsibilities.trim(),
      status: form.status,
    })
    setForm(initialForm)
    setOpen(false)
  }

  const isDisabled =
    !form.officeTitle.trim() ||
    !form.head.trim() ||
    !form.jobDescription.trim() ||
    !form.obligations.trim() ||
    !form.dutiesAndResponsibilities.trim()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Create Office
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Office</DialogTitle>
          <DialogDescription>
            Define an office post for Pearl of the Orient and assign its leadership details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="office-title">Office Title</Label>
              <Input
                id="office-title"
                value={form.officeTitle}
                onChange={(event) => setField("officeTitle", event.target.value)}
                placeholder="e.g. Provincial Chaplain Director"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="office-head">Office Head</Label>
              <Input
                id="office-head"
                value={form.head}
                onChange={(event) => setField("head", event.target.value)}
                placeholder="e.g. Rev. Juan Dela Cruz"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="office-department">Department</Label>
              <Input
                id="office-department"
                value={form.department}
                onChange={(event) => setField("department", event.target.value)}
                placeholder="e.g. Administration"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="office-status">Status</Label>
              <select
                id="office-status"
                value={form.status}
                onChange={(event) =>
                  setField("status", event.target.value as OfficeStatus)
                }
                className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm outline-none"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="office-job-description">Job Description</Label>
            <Textarea
              id="office-job-description"
              value={form.jobDescription}
              onChange={(event) => setField("jobDescription", event.target.value)}
              placeholder="Describe the role of this office."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="office-obligations">Obligations</Label>
            <Textarea
              id="office-obligations"
              value={form.obligations}
              onChange={(event) => setField("obligations", event.target.value)}
              placeholder="State key obligations for this office."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="office-duties">Duties and Responsibilities</Label>
            <Textarea
              id="office-duties"
              value={form.dutiesAndResponsibilities}
              onChange={(event) =>
                setField("dutiesAndResponsibilities", event.target.value)
              }
              placeholder="List practical duties and responsibilities."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isDisabled}>
              Save Office
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
