"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  Banknote,
  CheckCircle2,
  Clock3,
  Eye,
  PackageCheck,
  ReceiptText,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { GlobalDataTable } from "@/components/DataTable";
import { PageErrorState } from "@/components/PageErrorState";
import { PageLoadingState } from "@/components/PageLoadingState";
import { SummaryStatCard } from "@/components/SummaryStatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  useChaplainProductOrdersQuery,
  useUpdateChaplainProductOrderStatusMutation,
} from "@/features/chaplain-product-orders/chaplain-product-order.hooks";
import type {
  ChaplainOrderStatus,
  ChaplainProductOrder,
} from "@/features/chaplain-product-orders/chaplain-product-order.types";
import { useToast } from "@/hooks/use-toast";
import { toApiError } from "@/lib/http-client";

const statusLabels: Record<ChaplainOrderStatus, string> = {
  PENDING: "Pending",
  PAID: "Paid",
  PROCESSING: "Processing",
  READY: "Ready",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

const statusVariants: Record<
  ChaplainOrderStatus,
  "warning" | "info" | "success" | "error" | "secondary"
> = {
  PENDING: "warning",
  PAID: "info",
  PROCESSING: "info",
  READY: "success",
  COMPLETED: "success",
  CANCELLED: "error",
  REFUNDED: "secondary",
};

const transitions: Record<ChaplainOrderStatus, ChaplainOrderStatus[]> = {
  PENDING: ["PAID", "PROCESSING", "CANCELLED"],
  PAID: ["PROCESSING", "REFUNDED"],
  PROCESSING: ["READY", "CANCELLED", "REFUNDED"],
  READY: ["COMPLETED", "CANCELLED", "REFUNDED"],
  COMPLETED: ["REFUNDED"],
  CANCELLED: [],
  REFUNDED: [],
};

const money = (value: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(value);

const dateTime = (value: string) =>
  new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export function ChaplainProductOrdersPageContent() {
  const { toast } = useToast();
  const ordersQuery = useChaplainProductOrdersQuery();
  const updateStatus = useUpdateChaplainProductOrderStatusMutation();
  const [selected, setSelected] = useState<ChaplainProductOrder | null>(null);
  const [statusFilter, setStatusFilter] = useState<ChaplainOrderStatus | "ALL">(
    "ALL",
  );
  const [nextStatus, setNextStatus] = useState<ChaplainOrderStatus | null>(
    null,
  );
  const [paymentFilter, setPaymentFilter] = useState("ALL");

  const orders = useMemo(
    () => ordersQuery.data?.data ?? [],
    [ordersQuery.data?.data],
  );
  const filteredOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          (statusFilter === "ALL" || order.status === statusFilter) &&
          (paymentFilter === "ALL" || order.paymentStatus === paymentFilter),
      ),
    [orders, paymentFilter, statusFilter],
  );

  const openOrder = (order: ChaplainProductOrder) => {
    setSelected(order);
    setNextStatus(null);
  };

  const columns = useMemo<ColumnDef<ChaplainProductOrder>[]>(
    () => [
      {
        accessorKey: "orderNumber",
        header: "Order",
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.orderNumber}</p>
            <p className="text-muted-foreground text-xs">
              {dateTime(row.original.createdAt)}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "customerName",
        header: "Customer",
        cell: ({ row }) => (
          <div>
            <p>{row.original.customerName}</p>
            <p className="text-muted-foreground text-xs">
              {row.original.customerEmail}
            </p>
          </div>
        ),
      },
      {
        id: "product",
        header: "Product",
        cell: ({ row }) => (
          <div>
            <p>{row.original.product.name}</p>
            <p className="text-muted-foreground text-xs">
              Qty {row.original.quantity}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "total",
        header: "Total",
        cell: ({ row }) => <span>{money(row.original.total)}</span>,
      },
      {
        accessorKey: "fulfillmentMethod",
        header: "Fulfillment",
        cell: ({ row }) =>
          row.original.fulfillmentMethod === "DELIVERY" ? "Delivery" : "Pickup",
      },
      {
        id: "payment",
        header: "Payment",
        cell: ({ row }) => (
          <div>
            <p>{row.original.paymentGateway ?? "Cash"}</p>
            <p className="text-muted-foreground text-xs">
              {row.original.paymentStatus}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={statusVariants[row.original.status]}>
            {statusLabels[row.original.status]}
          </Badge>
        ),
      },
    ],
    [],
  );

  const saveStatus = async () => {
    if (!selected || !nextStatus) return;
    try {
      const updated = await updateStatus.mutateAsync({
        id: selected.id,
        status: nextStatus,
      });
      setSelected(updated);
      setNextStatus(null);
      toast({
        variant: "success",
        title: "Order status updated",
        description: `${updated.orderNumber} is now ${statusLabels[updated.status].toLowerCase()}.`,
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Status update failed",
        description: toApiError(error).message,
      });
    }
  };

  if (ordersQuery.isLoading) return <PageLoadingState mode="table" />;
  if (ordersQuery.isError) {
    return (
      <PageErrorState
        title="Orders could not be loaded"
        description="Refresh the page or try again shortly."
        backUrl="/chaplain-products"
        backLabel="Back to products"
      />
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-muted-foreground text-sm">Chaplain Products</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Product Orders
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Review customer requests, payments, fulfillment, and order status.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/chaplain-products">Manage product catalog</Link>
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryStatCard
          label="Pending"
          value={orders.filter((order) => order.status === "PENDING").length}
          icon={<Clock3 className="size-4" />}
          onClick={() => setStatusFilter("PENDING")}
          active={statusFilter === "PENDING"}
        />
        <SummaryStatCard
          label="Paid"
          value={orders.filter((order) => order.status === "PAID").length}
          icon={<Banknote className="size-4" />}
          onClick={() => setStatusFilter("PAID")}
          active={statusFilter === "PAID"}
        />
        <SummaryStatCard
          label="In fulfillment"
          value={
            orders.filter((order) =>
              ["PROCESSING", "READY"].includes(order.status),
            ).length
          }
          icon={<PackageCheck className="size-4" />}
        />
        <SummaryStatCard
          label="Completed"
          value={orders.filter((order) => order.status === "COMPLETED").length}
          icon={<CheckCircle2 className="size-4" />}
          onClick={() => setStatusFilter("COMPLETED")}
          active={statusFilter === "COMPLETED"}
        />
      </div>

      <Card>
        <CardContent className="pt-6">
          <GlobalDataTable
            columns={columns}
            data={filteredOrders}
            filterPlaceholder="Search orders, customers, or products..."
            emptyMessage="No product orders match this view."
            exportFileName="chaplain-product-orders"
            toolbarActions={
              <div className="flex gap-2">
                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger className="w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All payments</SelectItem>
                    {[
                      "PENDING",
                      "PAID",
                      "FAILED",
                      "CANCELLED",
                      "EXPIRED",
                      "REFUNDED",
                    ].map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0) + status.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={statusFilter}
                  onValueChange={(value) =>
                    setStatusFilter(value as ChaplainOrderStatus | "ALL")
                  }
                >
                  <SelectTrigger className="w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All orders</SelectItem>
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            }
            cellAction={(row) => (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openOrder(row.original)}
              >
                <Eye className="size-4" />
                View
              </Button>
            )}
          />
        </CardContent>
      </Card>

      <Sheet
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {selected ? (
            <div className="space-y-6">
              <SheetHeader>
                <SheetTitle>{selected.orderNumber}</SheetTitle>
                <SheetDescription>
                  Submitted {dateTime(selected.createdAt)}
                </SheetDescription>
              </SheetHeader>

              <div className="grid grid-cols-2 gap-3 rounded-lg border p-4 text-sm">
                <Detail label="Customer" value={selected.customerName} />
                <Detail label="Contact" value={selected.customerPhone} />
                <Detail label="Email" value={selected.customerEmail} />
                <Detail
                  label="Customer type"
                  value={selected.customerUser ? "Registered member" : "Guest"}
                />
                <Detail
                  label="Fulfillment"
                  value={
                    selected.fulfillmentMethod === "DELIVERY"
                      ? "Delivery"
                      : "Pickup"
                  }
                />
                <Detail
                  label="Payment"
                  value={`${selected.paymentMethod === "ONLINE" ? (selected.paymentGateway ?? "Online") : "Cash"} · ${selected.paymentStatus}`}
                />
                {selected.latestPayment ? (
                  <>
                    <Detail
                      label="Payment reference"
                      value={selected.latestPayment.reference}
                    />
                    <Detail
                      label="Gateway reference"
                      value={
                        selected.latestPayment.gatewayReference ?? "Pending"
                      }
                    />
                    <Detail
                      label="Provider status"
                      value={
                        selected.latestPayment.providerStatus ??
                        selected.latestPayment.status
                      }
                    />
                    <Detail
                      label="Currency"
                      value={selected.latestPayment.currency}
                    />
                    {selected.latestPayment.failureReason ? (
                      <Detail
                        label="Payment failure"
                        value={selected.latestPayment.failureReason}
                        wide
                      />
                    ) : null}
                  </>
                ) : null}
                {selected.deliveryAddress ? (
                  <Detail
                    label="Delivery address"
                    value={selected.deliveryAddress}
                    wide
                  />
                ) : null}
                {selected.customerNotes ? (
                  <Detail
                    label="Customer notes"
                    value={selected.customerNotes}
                    wide
                  />
                ) : null}
              </div>

              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selected.product.imageUrl}
                    alt=""
                    className="size-14 rounded object-contain"
                  />
                  <div>
                    <p className="font-medium">{selected.product.name}</p>
                    <p className="text-muted-foreground text-sm">
                      {selected.quantity} × {money(selected.unitPrice)}
                    </p>
                  </div>
                </div>
                <div className="mt-4 space-y-2 border-t pt-4 text-sm">
                  <Amount label="Subtotal" value={selected.subtotal} />
                  <Amount label="Tax (12%)" value={selected.taxAmount} />
                  <Amount label="Platform fee" value={selected.platformFee} />
                  <Amount label="Order total" value={selected.total} strong />
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <div className="mb-3 flex items-center gap-2">
                  <ReceiptText className="size-4" />
                  <p className="font-medium">Order status</p>
                  <Badge variant={statusVariants[selected.status]}>
                    {statusLabels[selected.status]}
                  </Badge>
                </div>
                {transitions[selected.status].length ? (
                  <div className="flex gap-2">
                    <Select
                      value={nextStatus ?? undefined}
                      onValueChange={(value) =>
                        setNextStatus(value as ChaplainOrderStatus)
                      }
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select next status" />
                      </SelectTrigger>
                      <SelectContent>
                        {transitions[selected.status].map((status) => (
                          <SelectItem key={status} value={status}>
                            {statusLabels[status]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={saveStatus}
                      disabled={!nextStatus || updateStatus.isPending}
                    >
                      <RotateCcw className="size-4" />
                      Update
                    </Button>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    This order has reached a final status.
                  </p>
                )}
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Detail({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "col-span-2" : undefined}>
      <p className="text-muted-foreground text-xs uppercase">{label}</p>
      <p className="mt-1 break-words">{value}</p>
    </div>
  );
}

function Amount({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: number;
  strong?: boolean;
}) {
  return (
    <div className={`flex justify-between ${strong ? "font-semibold" : ""}`}>
      <span>{label}</span>
      <span>{money(value)}</span>
    </div>
  );
}
