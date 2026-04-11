"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type OnChangeFn,
  type Row,
  type RowSelectionState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  LoaderCircleIcon,
  SearchIcon,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IconFileExport } from "@tabler/icons-react";

type GlobalDataTableProps<TData extends object, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  cellAction?: (row: Row<TData>) => React.ReactNode;
  toolbarActions?: ReactNode;
  hideSearch?: boolean;
  hideFooter?: boolean;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  manualSorting?: boolean;
  onDeleteSelected?: (rows: TData[]) => void;
  renderSelectedActions?: (
    rows: TData[],
    helpers: { clearSelection: () => void },
  ) => ReactNode;
  filterPlaceholder?: string;
  emptyMessage?: string;
  exportFileName?: string;
  pageSizeOptions?: number[];
};

export function GlobalDataTable<TData extends object, TValue>({
  columns,
  data,
  cellAction,
  toolbarActions,
  hideSearch = false,
  hideFooter = false,
  sorting: controlledSorting,
  onSortingChange: controlledOnSortingChange,
  manualSorting = false,
  onDeleteSelected,
  renderSelectedActions,
  filterPlaceholder = "Filter data...",
  emptyMessage = "No records found.",
  exportFileName = "table-export",
  pageSizeOptions = [10, 20, 25, 30, 40, 50],
}: GlobalDataTableProps<TData, TValue>) {
  const [internalSorting, setInternalSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const sorting = controlledSorting ?? internalSorting;
  const onSortingChange = controlledOnSortingChange ?? setInternalSorting;

  useEffect(() => {
    if (searchValue === globalFilter) {
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeout = setTimeout(() => {
      setGlobalFilter(searchValue);
      setIsSearching(false);
    }, 350);

    return () => clearTimeout(timeout);
  }, [searchValue, globalFilter]);

  const tableColumns = useMemo<ColumnDef<TData, TValue>[]>(
    () => [
      {
        id: "__select",
        header: ({ table }) => (
          <Checkbox
            aria-label="Select all rows"
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(Boolean(value))
            }
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            aria-label="Select row"
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      } as ColumnDef<TData, TValue>,
      ...columns,
      ...(cellAction
        ? ([
            {
              id: "__actions",
              header: "Actions",
              cell: ({ row }) => cellAction(row),
              enableSorting: false,
              enableHiding: false,
            } as ColumnDef<TData, TValue>,
          ] as ColumnDef<TData, TValue>[])
        : []),
    ],
    [cellAction, columns],
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns: tableColumns,
    enableRowSelection: true,
    state: {
      sorting,
      globalFilter,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: pageSizeOptions[0] ?? 10,
      },
    },
    onSortingChange,
    manualSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: manualSorting ? undefined : getSortedRowModel(),
    getPaginationRowModel: hideFooter ? undefined : getPaginationRowModel(),
    globalFilterFn: (row, _columnId, filterValue) => {
      const search = String(filterValue).toLowerCase().trim();
      if (!search) return true;

      return Object.values(row.original as Record<string, unknown>).some((value) =>
        String(value).toLowerCase().includes(search),
      );
    },
  });

  const filteredSelectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedRowsData = filteredSelectedRows.map((row) => row.original);
  const clearSelection = () => setRowSelection({});

  const handleDeleteSelected = () => {
    if (!selectedRowsData.length || !onDeleteSelected) return;
    onDeleteSelected(selectedRowsData);
    clearSelection();
  };

  const handleExportSelected = () => {
    if (!selectedRowsData.length) return;

    const headers = Array.from(
      selectedRowsData.reduce((keys, row) => {
        Object.keys(row as Record<string, unknown>).forEach((key) => keys.add(key));
        return keys;
      }, new Set<string>()),
    );

    const csvRows = selectedRowsData.map((row) =>
      headers
        .map((key) =>
          String((row as Record<string, unknown>)[key] ?? "").replaceAll('"', '""'),
        )
        .map((value) => `"${value}"`)
        .join(","),
    );

    const csv = [headers.join(","), ...csvRows].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${exportFileName}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {hideSearch ? <div /> : (
          <div className="relative">
            <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50">
              <SearchIcon className="size-4" />
              <span className="sr-only">Search</span>
            </div>
            <Input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder={filterPlaceholder}
              className="lg:w-110 peer px-9 [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none [&::-webkit-search-results-button]:appearance-none [&::-webkit-search-results-decoration]:appearance-none"
            />
            {isSearching && (
              <div className="text-muted-foreground pointer-events-none absolute inset-y-0 right-0 flex items-center justify-center pr-3 peer-disabled:opacity-50">
                <LoaderCircleIcon className="size-4 animate-spin" />
                <span className="sr-only">Loading...</span>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-end">
          {toolbarActions}
          {selectedRowsData.length > 0 && (
            <div className="flex items-center gap-2">
            <Button variant="outline" size="xs" onClick={handleExportSelected}>
              <IconFileExport className="size-3.5" />
              Export CSV
            </Button>
            {renderSelectedActions?.(selectedRowsData, { clearSelection })}
            {!renderSelectedActions && onDeleteSelected ? (
              <Button
                variant="destructive"
                size="xs"
                onClick={handleDeleteSelected}
              >
                <Trash2 className="size-3.5" />
                Delete
              </Button>
            ) : null}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="align-center whitespace-normal"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={tableColumns.length}
                  className="h-24 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {hideFooter ? null : (
        <div className="flex flex-col gap-3 px-1 md:flex-row md:items-center md:justify-between">
          <div className="text-muted-foreground flex-1 text-sm">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>

          <div className="flex flex-wrap items-center gap-3 md:gap-6">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">Rows per page</p>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => table.setPageSize(Number(value))}
              >
                <SelectTrigger className="h-8 w-20">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {pageSizeOptions.map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex w-27.5 items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon-sm"
                className="hidden lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                className="hidden lg:flex"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
