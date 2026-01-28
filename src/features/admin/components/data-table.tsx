// TODO: Fix unused variable ignore
// biome-ignore-all lint/correctness/noUnusedVariables: Type parameters in module augmentation must match original signature
"use client";

import React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { cn } from "@/shared/utils";

// Type augmentation for TanStack Table column meta
declare module "@tanstack/react-table" {
  // Type parameters must match TanStack Table's signature exactly
  interface ColumnMeta<TData, TValue> {
    align?: "left" | "center" | "right";
    wrap?: boolean;
  }
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  enableColumnVisibility?: boolean;
  /** Rendered on the same row as the Columns button (left side). Use for filters. */
  toolbarContent?: React.ReactNode;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search...",
  enableColumnVisibility = true,
  toolbarContent,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  const showToolbar = Boolean(
    searchKey || enableColumnVisibility || toolbarContent
  );

  return (
    <div className="space-y-4">
      {showToolbar && (
        <div className="flex flex-wrap items-end gap-4">
          {toolbarContent && (
            <div className="min-w-0 flex-1">{toolbarContent}</div>
          )}
          {searchKey && !toolbarContent && (
            <Input
              className="max-w-sm"
              onChange={(event) =>
                table.getColumn(searchKey)?.setFilterValue(event.target.value)
              }
              placeholder={searchPlaceholder}
              value={
                (table.getColumn(searchKey)?.getFilterValue() as string) ?? ""
              }
            />
          )}
          {enableColumnVisibility && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="shrink-0" variant="outline">
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        checked={column.getIsVisible()}
                        className="capitalize"
                        key={column.id}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const { meta } = header.column.columnDef;
                  const size = header.getSize();
                  return (
                    <TableHead
                      className={cn(
                        meta?.align === "right" && "text-right",
                        meta?.align === "center" && "text-center"
                      )}
                      key={header.id}
                      style={{
                        width: size !== 150 ? `${size}px` : undefined,
                        minWidth: `${header.column.columnDef.minSize ?? header.column.columnDef.size ?? 150}px`,
                        maxWidth: header.column.columnDef.maxSize
                          ? `${header.column.columnDef.maxSize}px`
                          : undefined,
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  data-state={row.getIsSelected() && "selected"}
                  key={row.id}
                >
                  {row.getVisibleCells().map((cell) => {
                    const { meta } = cell.column.columnDef;
                    const { getSize } = cell.column;
                    const size = getSize();
                    return (
                      <TableCell
                        className={cn(
                          meta?.align === "right" && "text-right",
                          meta?.align === "center" && "text-center",
                          meta?.wrap === true && "whitespace-normal!"
                        )}
                        key={cell.id}
                        style={{
                          width: size !== 150 ? `${size}px` : undefined,
                          minWidth: `${cell.column.columnDef.minSize ?? cell.column.columnDef.size ?? 150}px`,
                          maxWidth: cell.column.columnDef.maxSize
                            ? `${cell.column.columnDef.maxSize}px`
                            : undefined,
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  className="h-24 text-center"
                  colSpan={columns.length}
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <p className="font-medium text-muted-foreground text-sm">
            {table.getFilteredRowModel().rows.length} of{" "}
            {table.getCoreRowModel().rows.length} row(s)
          </p>
          <Select
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
            value={`${table.getState().pagination.pageSize}`}
          >
            <SelectTrigger className="h-8 min-w-[4rem]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 50, 100].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 font-medium text-muted-foreground text-sm">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center gap-1">
            <Button
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.firstPage()}
              size="sm"
              variant="outline"
            >
              {"<<"}
            </Button>
            <Button
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
              size="sm"
              variant="outline"
            >
              {"<"}
            </Button>
            <Button
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
              size="sm"
              variant="outline"
            >
              {">"}
            </Button>
            <Button
              disabled={!table.getCanNextPage()}
              onClick={() => table.lastPage()}
              size="sm"
              variant="outline"
            >
              {">>"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
