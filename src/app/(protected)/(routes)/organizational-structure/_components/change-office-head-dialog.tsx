"use client"

import { useMemo, useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { Office } from "./office-data"
import type { OfficeUser } from "./office-users"

type ChangeOfficeHeadDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  office: Office | null
  users: OfficeUser[]
  onConfirm: (user: OfficeUser) => void
}

export function ChangeOfficeHeadDialog({
  open,
  onOpenChange,
  office,
  users,
  onConfirm,
}: ChangeOfficeHeadDialogProps) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const currentHeadUserId = office
    ? users.find((user) => user.name === office.head)?.id ?? ""
    : ""
  const [selectedUserId, setSelectedUserId] = useState<string>(currentHeadUserId)

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId) ?? null,
    [selectedUserId, users]
  )

  const handleConfirm = () => {
    if (!selectedUser) return
    onConfirm(selectedUser)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Change Head/Admin</DialogTitle>
          <DialogDescription>
            {office
              ? `Assign a new head/admin for ${office.officeTitle}.`
              : "Select an office to assign a head/admin."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label>Select User</Label>
          <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={pickerOpen}
                className="w-full justify-between"
              >
                {selectedUser
                  ? `${selectedUser.name} (${selectedUser.role})`
                  : "Select user..."}
                <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[--radix-popover-trigger-width] p-0">
              <Command>
                <CommandInput placeholder="Search users..." />
                <CommandList>
                  <CommandEmpty>No users found.</CommandEmpty>
                  <CommandGroup>
                    {users.map((user) => (
                      <CommandItem
                        key={user.id}
                        value={`${user.name} ${user.email} ${user.role}`}
                        onSelect={() => {
                          setSelectedUserId(user.id)
                          setPickerOpen(false)
                        }}
                      >
                        <Check
                          className={cn(
                            "size-4",
                            selectedUserId === user.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col">
                          <span>{user.name}</span>
                          <span className="text-muted-foreground text-xs">
                            {user.email} - {user.role}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedUser || !office}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
