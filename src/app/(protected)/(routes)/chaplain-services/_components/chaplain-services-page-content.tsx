"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CalendarClock, Edit, MoreHorizontal, Percent, Plus, Save, Settings2, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { GlobalDataTable } from "@/components/DataTable";
import { PageEmptyState } from "@/components/PageEmptyState";
import { PageErrorState } from "@/components/PageErrorState";
import { PageLoadingState } from "@/components/PageLoadingState";
import { SummaryStatCard } from "@/components/SummaryStatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useChaplainServicesQuery, useCreateChaplainServiceMutation, useUpdateChaplainServiceMutation } from "@/features/chaplain-services/chaplain-service.hooks";
import type { ChaplainServicePayload, ChaplainServiceRecord } from "@/features/chaplain-services/chaplain-service.types";
import { useToast } from "@/hooks/use-toast";
import { toApiError } from "@/lib/http-client";
import { cn } from "@/lib/utils";

const surfaceClass = "border-border/60 bg-accent/30 text-foreground shadow-none backdrop-blur-sm";
const fieldClass = "border-border/60 bg-background/70 text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/30";

const commissionLabel = (value: number | null) => value === null ? "No commission" : `${value}%`;

export function ChaplainServicesPageContent() {
  const servicesQuery = useChaplainServicesQuery();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingService, setEditingService] = useState<ChaplainServiceRecord | null>(null);
  const services = useMemo(() => servicesQuery.data?.data ?? [], [servicesQuery.data?.data]);
  const activeCount = services.filter((service) => service.isActive).length;
  const commissionedCount = services.filter((service) => service.commissionPercent !== null).length;

  const openCreate = () => { setEditingService(null); setSheetOpen(true); };
  const openEdit = (service: ChaplainServiceRecord) => { setEditingService(service); setSheetOpen(true); };

  const columns = useMemo<ColumnDef<ChaplainServiceRecord>[]>(() => [
    {
      accessorKey: "name",
      header: "Service",
      cell: ({ row }) => <div className="min-w-64"><p className="font-medium">{row.original.name}</p><p className="text-muted-foreground line-clamp-1 text-xs">{row.original.description}</p></div>,
    },
    {
      accessorKey: "availability",
      header: "Availability",
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{row.original.availability || "Set per provider"}</span>,
    },
    {
      accessorKey: "commissionPercent",
      header: "Admin commission",
      cell: ({ row }) => <Badge variant="outline">{commissionLabel(row.original.commissionPercent)}</Badge>,
    },
    {
      accessorKey: "maxConcurrentBookings",
      header: "Capacity",
      cell: ({ row }) => <span className="text-sm">{row.original.maxConcurrentBookings} per schedule</span>,
    },
    {
      accessorKey: "sharedResourceName",
      header: "Shared resource",
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{row.original.sharedResourceName ? `${row.original.sharedResourceName} (${row.original.sharedResourceCapacity})` : "None"}</span>,
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => <Badge variant={row.original.isActive ? "default" : "secondary"}>{row.original.isActive ? "Active" : "Inactive"}</Badge>,
    },
  ], []);

  return (
    <section className="space-y-6 p-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Chaplain Services</h1>
          <p className="text-muted-foreground text-sm">Configure service offerings, general availability, and the organization&apos;s commission percentage.</p>
        </div>
        <Button onClick={openCreate}><Plus className="size-4" />Add service</Button>
      </div>

      <Card className="overflow-hidden bg-transparent">
        <CardHeader className="border-b pb-4"><CardTitle>Service Summary</CardTitle><CardDescription>Provider-specific pricing and schedules are managed separately when bookings are introduced.</CardDescription></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <SummaryStatCard label="Configured Services" value={services.length} description="All service records" icon={<Settings2 className="size-4" />} accentClassName="bg-blue-700/10 text-blue-700 dark:bg-blue-300/10 dark:text-blue-300" />
          <SummaryStatCard label="Active Services" value={activeCount} description="Available for future bookings" icon={<CalendarClock className="size-4" />} accentClassName="bg-emerald-700/10 text-emerald-700 dark:bg-emerald-300/10 dark:text-emerald-300" />
          <SummaryStatCard label="Commission Enabled" value={commissionedCount} description="Services with an admin rate" icon={<Percent className="size-4" />} accentClassName="bg-amber-700/10 text-amber-700 dark:bg-amber-300/10 dark:text-amber-300" />
        </CardContent>
      </Card>

      <Card className="bg-transparent">
        <CardHeader className="border-b"><CardTitle>Service Configuration</CardTitle><CardDescription>Create and maintain chaplain service offerings.</CardDescription></CardHeader>
        <CardContent>
          {servicesQuery.isLoading ? <PageLoadingState mode="table" /> : servicesQuery.isError ? (
            <PageErrorState title="Unable to load chaplain services" description={toApiError(servicesQuery.error).message ?? "The service configuration could not be loaded."} backUrl="/dashboard" backLabel="Back to dashboard" />
          ) : services.length === 0 ? (
            <PageEmptyState title="No chaplain services" description="Add the first service offering for the booking workflow." createAction={openCreate} createLabel="Add service" />
          ) : (
            <GlobalDataTable columns={columns} data={services} filterPlaceholder="Search services..." emptyMessage="No services match this search." exportFileName="chaplain-services" cellAction={(row) => (
              <DropdownMenu><DropdownMenuTrigger asChild><Button size="icon-sm" variant="ghost" aria-label="Open service actions"><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-44"><DropdownMenuLabel>Actions</DropdownMenuLabel><DropdownMenuItem onClick={() => openEdit(row.original)}><Edit className="size-4" />Edit service</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
            )} />
          )}
        </CardContent>
      </Card>

      <ServiceSheet key={`${editingService?.id ?? "new"}-${sheetOpen ? "open" : "closed"}`} open={sheetOpen} service={editingService} onOpenChange={setSheetOpen} />
    </section>
  );
}

function ServiceSheet({ open, service, onOpenChange }: { open: boolean; service: ChaplainServiceRecord | null; onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast();
  const createMutation = useCreateChaplainServiceMutation();
  const updateMutation = useUpdateChaplainServiceMutation();
  const [name, setName] = useState(service?.name ?? "");
  const [description, setDescription] = useState(service?.description ?? "");
  const [availability, setAvailability] = useState(service?.availability ?? "");
  const [commissionPercent, setCommissionPercent] = useState(service?.commissionPercent?.toString() ?? "");
  const [maxConcurrentBookings, setMaxConcurrentBookings] = useState(service?.maxConcurrentBookings.toString() ?? "1");
  const [sharedResourceName, setSharedResourceName] = useState(service?.sharedResourceName ?? "");
  const [sharedResourceCapacity, setSharedResourceCapacity] = useState(service?.sharedResourceCapacity?.toString() ?? "1");
  const [sortOrder, setSortOrder] = useState(service?.sortOrder.toString() ?? "0");
  const [isActive, setIsActive] = useState(service?.isActive ?? true);
  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async () => {
    const commission = commissionPercent.trim() === "" ? null : Number(commissionPercent);
    const order = Number(sortOrder);
    const capacity = Number(maxConcurrentBookings);
    const resourceCapacity = Number(sharedResourceCapacity);
    if (!name.trim() || !description.trim()) { toast({ variant: "error", title: "Complete required fields", description: "Service name and description are required." }); return; }
    if (commission !== null && (!Number.isFinite(commission) || commission < 0 || commission > 100)) { toast({ variant: "error", title: "Invalid commission", description: "Enter a commission percentage from 0 to 100." }); return; }
    if (!Number.isInteger(capacity) || capacity < 1) { toast({ variant: "error", title: "Invalid capacity", description: "Service capacity must be at least 1." }); return; }
    if (sharedResourceName.trim() && (!Number.isInteger(resourceCapacity) || resourceCapacity < 1)) { toast({ variant: "error", title: "Invalid resource capacity", description: "Shared resource capacity must be at least 1." }); return; }
    const payload: ChaplainServicePayload = { name: name.trim(), description: description.trim(), availability: availability.trim() || null, commissionPercent: commission, maxConcurrentBookings: capacity, sharedResourceName: sharedResourceName.trim() || null, sharedResourceCapacity: sharedResourceName.trim() ? resourceCapacity : null, isActive, sortOrder: Number.isFinite(order) && order >= 0 ? order : 0 };
    try {
      if (service) await updateMutation.mutateAsync({ id: service.id, payload }); else await createMutation.mutateAsync(payload);
      toast({ variant: "success", title: service ? "Service updated" : "Service created", description: `${payload.name} was saved successfully.` });
      onOpenChange(false);
    } catch (error) { toast({ variant: "error", title: service ? "Update failed" : "Creation failed", description: toApiError(error).message }); }
  };

  return <Sheet open={open} onOpenChange={onOpenChange}><SheetContent side="right" className="no-scrollbar w-full gap-0 overflow-y-auto p-0 sm:max-w-2xl"><SheetHeader className="border-b"><SheetTitle>{service ? "Edit chaplain service" : "Add chaplain service"}</SheetTitle><SheetDescription>Maintain a service offering and the organization&apos;s commission rate.</SheetDescription></SheetHeader><div className="space-y-5 p-5">
    <Card className={cn(surfaceClass, "rounded-lg! py-4")}><CardContent className="space-y-4 px-5"><SectionHeading icon={Settings2} title="Service Details" description="Define what members and visitors can request." />
      <div className="grid gap-2"><Label htmlFor="service-name">Service name</Label><Input id="service-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Hospital visitation" className={cn(fieldClass, "h-11")} /></div>
      <div className="grid gap-2"><Label htmlFor="service-description">Description</Label><Textarea id="service-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe the service and its purpose." className={cn(fieldClass, "min-h-28")} /></div>
      <div className="grid gap-2"><Label htmlFor="service-availability">General availability</Label><Textarea id="service-availability" value={availability} onChange={(event) => setAvailability(event.target.value)} placeholder="e.g. Subject to provider availability and service area" className={cn(fieldClass, "min-h-20")} /><p className="text-muted-foreground text-xs">This is a general note. Actual schedule and pricing may vary by provider.</p></div>
    </CardContent></Card>
    <Card className={cn(surfaceClass, "rounded-lg! py-4")}><CardContent className="space-y-4 px-5"><SectionHeading icon={Percent} title="Admin Commission" description="An optional organization commission applied to this service." />
      <div className="grid gap-2"><Label htmlFor="service-commission">Commission percentage</Label><div className="relative"><Input id="service-commission" type="number" min="0" max="100" step="0.01" value={commissionPercent} onChange={(event) => setCommissionPercent(event.target.value)} placeholder="e.g. 10" className={cn(fieldClass, "h-11 pr-10")} /><Percent className="text-muted-foreground pointer-events-none absolute right-3 top-3.5 size-4" /></div><p className="text-muted-foreground text-xs">Leave blank when no commission applies. This is only visible to administrators.</p></div>
    </CardContent></Card>
    <Card className={cn(surfaceClass, "rounded-lg! py-4")}><CardContent className="space-y-4 px-5"><SectionHeading icon={Users} title="Capacity and Shared Resource" description="Prevent services and shared facilities from being overbooked at the same schedule." />
      <div className="grid gap-2"><Label htmlFor="service-capacity">Maximum confirmed bookings per schedule</Label><Input id="service-capacity" type="number" min="1" step="1" value={maxConcurrentBookings} onChange={(event) => setMaxConcurrentBookings(event.target.value)} className={cn(fieldClass, "h-11")} /></div>
      <div className="grid gap-2"><Label htmlFor="shared-resource-name">Shared resource name</Label><Input id="shared-resource-name" value={sharedResourceName} onChange={(event) => setSharedResourceName(event.target.value)} placeholder="e.g. Main chapel or service vehicle" className={cn(fieldClass, "h-11")} /><p className="text-muted-foreground text-xs">Services using the same resource name share one schedule capacity.</p></div>
      {sharedResourceName.trim() ? <div className="grid gap-2"><Label htmlFor="shared-resource-capacity">Shared resource capacity per schedule</Label><Input id="shared-resource-capacity" type="number" min="1" step="1" value={sharedResourceCapacity} onChange={(event) => setSharedResourceCapacity(event.target.value)} className={cn(fieldClass, "h-11")} /></div> : null}
    </CardContent></Card>
    <Card className={cn(surfaceClass, "rounded-lg! py-4")}><CardContent className="space-y-4 px-5"><SectionHeading icon={CalendarClock} title="Availability Settings" description="Control whether this service is ready for the booking workflow." />
      <div className="flex items-center justify-between gap-4 rounded-xl border bg-background/60 p-4"><div><p className="text-sm font-medium">Active service</p><p className="text-muted-foreground text-xs">Inactive services cannot be offered for new bookings.</p></div><Switch checked={isActive} onCheckedChange={setIsActive} /></div>
      <div className="grid gap-2"><Label htmlFor="service-sort-order">Display order</Label><Input id="service-sort-order" type="number" min="0" step="1" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} className={cn(fieldClass, "h-11")} /></div>
    </CardContent></Card>
    <div className="sticky bottom-0 isolate flex items-center justify-end gap-2 bg-background py-4"><Button variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>Cancel</Button><Button disabled={isPending} onClick={() => void handleSubmit()}><Save className="size-4" />{isPending ? "Saving..." : service ? "Save changes" : "Create service"}</Button></div>
  </div></SheetContent></Sheet>;
}

function SectionHeading({ icon: Icon, title, description }: { icon: typeof Settings2; title: string; description: string }) {
  return <div className="flex items-start gap-3"><div className="rounded-xl bg-background/70 p-2"><Icon className="text-muted-foreground size-4" /></div><div><p className="text-xl font-semibold">{title}</p><p className="text-muted-foreground text-sm">{description}</p></div></div>;
}
