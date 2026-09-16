"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  AlertTriangle,
  Boxes,
  Edit,
  ImageIcon,
  MoreHorizontal,
  PackageCheck,
  PackagePlus,
  PackageX,
  Save,
  Settings2,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { GlobalDataTable } from "@/components/DataTable";
import { PageEmptyState } from "@/components/PageEmptyState";
import { PageErrorState } from "@/components/PageErrorState";
import { PageLoadingState } from "@/components/PageLoadingState";
import { SummaryStatCard } from "@/components/SummaryStatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  useChaplainProductsQuery,
  useCreateChaplainProductMutation,
  useDeleteChaplainProductMutation,
  useUpdateChaplainProductMutation,
  useUploadChaplainProductImageMutation,
} from "@/features/chaplain-products/chaplain-product.hooks";
import type {
  ChaplainProductCategory,
  ChaplainProductPayload,
  ChaplainProductRecord,
  ChaplainProductStockStatus,
} from "@/features/chaplain-products/chaplain-product.types";
import { useToast } from "@/hooks/use-toast";
import { toApiError } from "@/lib/http-client";
import { cn } from "@/lib/utils";

const categories: Array<{
  value: ChaplainProductCategory;
  label: string;
}> = [
  { value: "PIN", label: "Pin" },
  { value: "PATCH", label: "Patch" },
  { value: "STICKER", label: "Sticker" },
  { value: "ACCESSORY", label: "Accessory" },
  { value: "APPAREL", label: "Apparel" },
  { value: "OTHER", label: "Other" },
];

const surfaceClass =
  "border-border/60 bg-accent/30 text-foreground shadow-none backdrop-blur-sm";
const fieldClass =
  "border-border/60 bg-background/70 text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/30";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(price);

const stockLabels: Record<ChaplainProductStockStatus, string> = {
  IN_STOCK: "In stock",
  LOW_STOCK: "Low stock",
  OUT_OF_STOCK: "Out of stock",
};

const stockClasses: Record<ChaplainProductStockStatus, string> = {
  IN_STOCK:
    "border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  LOW_STOCK:
    "border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  OUT_OF_STOCK:
    "border-red-300 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
};

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const resolveImageUrl = (value: string) => {
  if (!value.startsWith("/")) return value;
  const websiteUrl =
    process.env.NEXT_PUBLIC_WEBSITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";
  return `${websiteUrl}${value}`;
};

export function ChaplainProductsPageContent() {
  const { toast } = useToast();
  const productsQuery = useChaplainProductsQuery();
  const deleteMutation = useDeleteChaplainProductMutation();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingProduct, setEditingProduct] =
    useState<ChaplainProductRecord | null>(null);

  const products = useMemo(
    () => productsQuery.data?.data ?? [],
    [productsQuery.data?.data],
  );
  const lowStockCount = products.filter(
    (product) => product.stockStatus === "LOW_STOCK",
  ).length;
  const outOfStockCount = products.filter(
    (product) => product.stockStatus === "OUT_OF_STOCK",
  ).length;
  const totalUnits = products.reduce(
    (total, product) => total + product.stockQuantity,
    0,
  );

  const openCreate = () => {
    setEditingProduct(null);
    setSheetOpen(true);
  };

  const openEdit = (product: ChaplainProductRecord) => {
    setEditingProduct(product);
    setSheetOpen(true);
  };

  const handleDelete = async (product: ChaplainProductRecord) => {
    if (!window.confirm(`Delete ${product.name}? This cannot be undone.`)) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(product.id);
      toast({
        variant: "success",
        title: "Product deleted",
        description: `${product.name} was removed from the catalog.`,
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Delete failed",
        description: toApiError(error).message,
      });
    }
  };

  const columns = useMemo<ColumnDef<ChaplainProductRecord>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Product",
        cell: ({ row }) => (
          <div className="flex min-w-56 items-center gap-3">
            <div className="size-12 overflow-hidden rounded-lg border bg-white p-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolveImageUrl(row.original.imageUrl)}
                alt=""
                className="h-full w-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium">{row.original.name}</p>
              <p className="text-muted-foreground truncate text-xs">
                {row.original.slug}
              </p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => (
          <Badge variant="outline">
            {categories.find(
              (category) => category.value === row.original.category,
            )?.label ?? row.original.category}
          </Badge>
        ),
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => formatPrice(row.original.price),
      },
      {
        accessorKey: "stockQuantity",
        header: "Available Stock",
        cell: ({ row }) => (
          <div>
            <p className="font-medium tabular-nums">
              {row.original.stockQuantity} units
            </p>
            <p className="text-muted-foreground text-xs">
              Alert at {row.original.lowStockThreshold}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "stockStatus",
        header: "Stock Status",
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={stockClasses[row.original.stockStatus]}
          >
            {stockLabels[row.original.stockStatus]}
          </Badge>
        ),
      },
      {
        accessorKey: "isActive",
        header: "Visibility",
        cell: ({ row }) => (
          <Badge variant={row.original.isActive ? "default" : "secondary"}>
            {row.original.isActive ? "Active" : "Hidden"}
          </Badge>
        ),
      },
    ],
    [],
  );

  return (
    <section className="space-y-6 p-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Chaplain Products
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage the public product catalog, pricing, availability, and stock
            thresholds.
          </p>
        </div>
        <Button onClick={openCreate}>
          <PackagePlus className="size-4" />
          Add product
        </Button>
      </div>

      <Card className="overflow-hidden bg-transparent">
        <CardHeader className="border-b pb-4">
          <CardTitle>Inventory Summary</CardTitle>
          <CardDescription>
            Stock status is calculated automatically from available units and
            each product&apos;s threshold.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryStatCard
            label="Products"
            value={products.length}
            description="Total catalog records"
            icon={<Boxes className="size-4" />}
            accentClassName="bg-blue-700/10 text-blue-700 dark:bg-blue-300/10 dark:text-blue-300"
          />
          <SummaryStatCard
            label="Units Available"
            value={totalUnits}
            description="Combined current stock"
            icon={<PackageCheck className="size-4" />}
            accentClassName="bg-emerald-700/10 text-emerald-700 dark:bg-emerald-300/10 dark:text-emerald-300"
          />
          <SummaryStatCard
            label="Low Stock"
            value={lowStockCount}
            description="At or below threshold"
            icon={<AlertTriangle className="size-4" />}
            accentClassName="bg-amber-700/10 text-amber-700 dark:bg-amber-300/10 dark:text-amber-300"
          />
          <SummaryStatCard
            label="Out of Stock"
            value={outOfStockCount}
            description="Unavailable on the website"
            icon={<PackageX className="size-4" />}
            accentClassName="bg-red-700/10 text-red-700 dark:bg-red-300/10 dark:text-red-300"
          />
        </CardContent>
      </Card>

      <Card className="bg-transparent">
        <CardHeader className="border-b">
          <CardTitle>Product Inventory</CardTitle>
          <CardDescription>
            Create, edit, hide, and remove chaplain products.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {productsQuery.isLoading ? (
            <PageLoadingState mode="table" />
          ) : productsQuery.isError ? (
            <PageErrorState
              title="Unable to load products"
              description={
                toApiError(productsQuery.error).message ??
                "The product inventory could not be loaded."
              }
              backUrl="/dashboard"
              backLabel="Back to dashboard"
            />
          ) : products.length === 0 ? (
            <PageEmptyState
              title="No chaplain products"
              description="Add the first product to the public shop catalog."
              createAction={openCreate}
              createLabel="Add product"
            />
          ) : (
            <GlobalDataTable
              columns={columns}
              data={products}
              filterPlaceholder="Search products..."
              emptyMessage="No products match this search."
              exportFileName="chaplain-products"
              cellAction={(row) => (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      aria-label="Open product actions"
                    >
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => openEdit(row.original)}>
                      <Edit className="size-4" />
                      Edit product
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      disabled={deleteMutation.isPending}
                      onClick={() => void handleDelete(row.original)}
                    >
                      <Trash2 className="size-4" />
                      Delete product
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            />
          )}
        </CardContent>
      </Card>

      <ProductSheet
        key={`${editingProduct?.id ?? "new"}-${sheetOpen ? "open" : "closed"}`}
        open={sheetOpen}
        product={editingProduct}
        onOpenChange={setSheetOpen}
      />
    </section>
  );
}

function ProductSheet({
  open,
  product,
  onOpenChange,
}: {
  open: boolean;
  product: ChaplainProductRecord | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const createMutation = useCreateChaplainProductMutation();
  const updateMutation = useUpdateChaplainProductMutation();
  const uploadMutation = useUploadChaplainProductImageMutation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [category, setCategory] = useState<ChaplainProductCategory>(
    product?.category ?? "OTHER",
  );
  const [price, setPrice] = useState(String(product?.price ?? ""));
  const [stockQuantity, setStockQuantity] = useState(
    String(product?.stockQuantity ?? 0),
  );
  const [lowStockThreshold, setLowStockThreshold] = useState(
    String(product?.lowStockThreshold ?? 5),
  );
  const [sortOrder, setSortOrder] = useState(String(product?.sortOrder ?? 0));
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? "");
  const imageFileName = product?.imageFileName ?? "";
  const [imageFile, setImageFile] = useState<File | null>(null);
  const localPreview = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : null),
    [imageFile],
  );

  useEffect(
    () => () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    },
    [localPreview],
  );

  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    uploadMutation.isPending;
  const numericStock = Number(stockQuantity) || 0;
  const numericThreshold = Number(lowStockThreshold) || 0;
  const previewStatus: ChaplainProductStockStatus =
    numericStock === 0
      ? "OUT_OF_STOCK"
      : numericStock <= numericThreshold
        ? "LOW_STOCK"
        : "IN_STOCK";

  const handleSubmit = async () => {
    const numericPrice = Number(price);
    const numericSortOrder = Number(sortOrder);

    if (!name.trim() || !slug.trim() || !Number.isFinite(numericPrice)) {
      toast({
        variant: "error",
        title: "Complete required fields",
        description: "Name, slug, and a valid price are required.",
      });
      return;
    }
    if (!imageUrl.trim() && !imageFile) {
      toast({
        variant: "error",
        title: "Product image required",
        description: "Upload an image or enter an image URL.",
      });
      return;
    }

    try {
      let resolvedImageUrl = imageUrl.trim();
      let resolvedImageFileName = imageFileName.trim() || null;

      if (imageFile) {
        const uploaded = await uploadMutation.mutateAsync(imageFile);
        resolvedImageUrl =
          uploaded?.serverData.fileUrl ?? uploaded?.ufsUrl ?? "";
        resolvedImageFileName = uploaded?.serverData.fileName ?? imageFile.name;
      }

      const payload: ChaplainProductPayload = {
        slug: slugify(slug),
        name: name.trim(),
        description: description.trim() || null,
        category,
        price: numericPrice,
        stockQuantity: numericStock,
        lowStockThreshold: numericThreshold,
        imageUrl: resolvedImageUrl,
        imageFileName: resolvedImageFileName,
        isActive,
        sortOrder: Number.isFinite(numericSortOrder) ? numericSortOrder : 0,
      };

      if (product) {
        await updateMutation.mutateAsync({ id: product.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }

      toast({
        variant: "success",
        title: product ? "Product updated" : "Product created",
        description: `${payload.name} was saved successfully.`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "error",
        title: product ? "Update failed" : "Creation failed",
        description: toApiError(error).message,
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="no-scrollbar w-full gap-0 overflow-y-auto p-0 sm:max-w-2xl"
      >
        <SheetHeader className="border-b">
          <SheetTitle>
            {product ? "Edit chaplain product" : "Add chaplain product"}
          </SheetTitle>
          <SheetDescription>
            Maintain catalog details, website visibility, and inventory levels.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 p-5">
          <Card className={cn(surfaceClass, "rounded-lg! py-4")}>
            <CardContent className="space-y-4 px-5">
              <SectionHeading
                icon={PackagePlus}
                title="Product Details"
                description="Set the public name, category, description, and price."
              />
              <div className="grid gap-2">
                <Label htmlFor="product-name">Product name</Label>
                <Input
                  id="product-name"
                  value={name}
                  onChange={(event) => {
                    const nextName = event.target.value;
                    setSlug((current) =>
                      !product && (!current || current === slugify(name))
                        ? slugify(nextName)
                        : current,
                    );
                    setName(nextName);
                  }}
                  placeholder="Pearl Chaplain Pin"
                  className={cn(fieldClass, "h-11")}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="product-slug">Slug</Label>
                <Input
                  id="product-slug"
                  value={slug}
                  onChange={(event) => setSlug(slugify(event.target.value))}
                  placeholder="pearl-chaplain-pin"
                  className={cn(fieldClass, "h-11")}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Category</Label>
                  <Select
                    value={category}
                    onValueChange={(value) =>
                      setCategory(value as ChaplainProductCategory)
                    }
                  >
                    <SelectTrigger className={cn(fieldClass, "w-full")}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="product-price">Price (PHP)</Label>
                  <Input
                    id="product-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                    className={cn(fieldClass, "h-11")}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="product-description">Description</Label>
                <Textarea
                  id="product-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Optional product details..."
                  rows={4}
                  className={fieldClass}
                />
              </div>
            </CardContent>
          </Card>

          <Card className={cn(surfaceClass, "rounded-lg! py-4")}>
            <CardContent className="space-y-4 px-5">
              <SectionHeading
                icon={Boxes}
                title="Inventory Management"
                description="Status updates automatically from available stock and the threshold."
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="stock-quantity">Stock available</Label>
                  <Input
                    id="stock-quantity"
                    type="number"
                    min="0"
                    step="1"
                    value={stockQuantity}
                    onChange={(event) => setStockQuantity(event.target.value)}
                    className={cn(fieldClass, "h-11")}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="stock-threshold">Low-stock threshold</Label>
                  <Input
                    id="stock-threshold"
                    type="number"
                    min="0"
                    step="1"
                    value={lowStockThreshold}
                    onChange={(event) =>
                      setLowStockThreshold(event.target.value)
                    }
                    className={cn(fieldClass, "h-11")}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-xl border bg-background/60 p-4">
                <div>
                  <p className="text-sm font-medium">Calculated stock status</p>
                  <p className="text-muted-foreground text-xs">
                    Zero is out of stock; threshold or below is low stock.
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={stockClasses[previewStatus]}
                >
                  {stockLabels[previewStatus]}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className={cn(surfaceClass, "rounded-lg! py-4")}>
            <CardContent className="space-y-4 px-5">
              <SectionHeading
                icon={ImageIcon}
                title="Product Image"
                description="Upload a catalog image or use a direct image URL."
              />
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) =>
                  setImageFile(event.target.files?.[0] ?? null)
                }
              />
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="size-4" />
                {imageFile?.name ?? imageFileName ?? "Choose product image"}
              </Button>
              <div className="grid gap-2">
                <Label htmlFor="product-image-url">Image URL</Label>
                <Input
                  id="product-image-url"
                  value={imageUrl}
                  onChange={(event) => setImageUrl(event.target.value)}
                  placeholder="https://... or /products/item.png"
                  className={cn(fieldClass, "h-11")}
                />
              </div>
              {localPreview || imageUrl ? (
                <div className="flex h-56 items-center justify-center overflow-hidden rounded-xl border bg-white p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={localPreview ?? resolveImageUrl(imageUrl)}
                    alt="Product preview"
                    className="h-full w-full object-contain"
                  />
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className={cn(surfaceClass, "rounded-lg! py-4")}>
            <CardContent className="space-y-4 px-5">
              <SectionHeading
                icon={Settings2}
                title="Catalog Settings"
                description="Control website visibility and product ordering."
              />
              <div className="flex items-center justify-between gap-4 rounded-xl border bg-background/60 p-4">
                <div>
                  <p className="text-sm font-medium">Visible on public shop</p>
                  <p className="text-muted-foreground text-xs">
                    Hidden products will not appear on the website.
                  </p>
                </div>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="product-sort-order">Display order</Label>
                <Input
                  id="product-sort-order"
                  type="number"
                  min="0"
                  step="1"
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value)}
                  className={cn(fieldClass, "h-11")}
                />
              </div>
            </CardContent>
          </Card>

          <div className="sticky bottom-0 isolate flex items-center justify-end gap-2 bg-background py-4 after:pointer-events-none after:absolute after:bottom-full after:-z-10 after:h-10 after:w-full after:bg-linear-to-t after:from-background after:to-transparent">
            <Button
              variant="outline"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button disabled={isPending} onClick={() => void handleSubmit()}>
              <Save className="size-4" />
              {isPending
                ? "Saving..."
                : product
                  ? "Save changes"
                  : "Create product"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function SectionHeading({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof PackagePlus;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-xl bg-background/70 p-2">
        <Icon className="text-muted-foreground size-4" />
      </div>
      <div>
        <p className="text-xl font-semibold">{title}</p>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </div>
  );
}
