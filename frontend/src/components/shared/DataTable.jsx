import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const asMillis = (value) => {
  if (!value) return null;
  if (value instanceof Date) {
    const ms = value.getTime();
    return Number.isFinite(ms) ? ms : null;
  }
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const ms = Date.parse(String(value));
  return Number.isFinite(ms) ? ms : null;
};

const getCreatedAtMillis = (row) => {
  if (!row || typeof row !== "object") return null;
  return (
    asMillis(row.createdAt) ??
    asMillis(row.created_at) ??
    asMillis(row.createdOn) ??
    asMillis(row.created_on) ??
    null
  );
};

const formatCreatedAt = (row) => {
  const ms = getCreatedAtMillis(row);
  if (!ms) return "—";
  try {
    return new Date(ms).toLocaleString();
  } catch {
    return "—";
  }
};

export const DataTable = ({
  columns,
  data,
  searchPlaceholder = "Search...",
  searchKey,
  searchKeys,
  pageSize = 10,
  autoSortByCreatedAt = true,
  className,
  testId,
  toolbarRight,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const normalizedData = Array.isArray(data) ? data : [];

  // Filter data based on search
  const normalizedSearch = searchTerm.toLowerCase();
  const effectiveSearchKeys =
    Array.isArray(searchKeys) && searchKeys.length
      ? searchKeys
      : searchKey
        ? [searchKey]
        : [];

  const filteredData =
    effectiveSearchKeys.length && normalizedSearch
      ? normalizedData.filter((item) =>
          effectiveSearchKeys.some((key) =>
            String(item?.[key] ?? "")
              .toLowerCase()
              .includes(normalizedSearch)
          )
        )
      : normalizedData;

  const hasCreatedAt = filteredData.some((row) => getCreatedAtMillis(row) != null);
  const hasCreatedAtColumn = columns.some((c) => String(c?.key || "") === "createdAt" || String(c?.key || "") === "__createdAt");
  const createdAtColumn = {
    key: "__createdAt",
    label: "Created At",
    width: "190px",
    render: (_, row) => <span className="text-xs text-muted-foreground">{formatCreatedAt(row)}</span>,
  };

  const effectiveColumns = (() => {
    if (!hasCreatedAt || hasCreatedAtColumn) return columns;
    const actionIndex = columns.findIndex((c) => String(c?.key || "") === "actions");
    if (actionIndex >= 0) {
      return [...columns.slice(0, actionIndex), createdAtColumn, ...columns.slice(actionIndex)];
    }
    return [...columns, createdAtColumn];
  })();

  const sortedData =
    autoSortByCreatedAt && hasCreatedAt
      ? [...filteredData].sort(
          (a, b) => (getCreatedAtMillis(b) || 0) - (getCreatedAtMillis(a) || 0)
        )
      : filteredData;

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = sortedData.slice(startIndex, startIndex + pageSize);

  return (
    <div className={cn("space-y-4", className)} data-testid={testId}>
      {(effectiveSearchKeys.length || toolbarRight) && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search */}
          {effectiveSearchKeys.length > 0 && (
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 h-9 bg-black/20 border-border rounded-sm"
                data-testid={`${testId}-search`}
              />
            </div>
          )}
          {toolbarRight && <div className="ml-auto flex items-center">{toolbarRight}</div>}
        </div>
      )}

      {/* Table */}
      <div className="dashboard-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border hover:bg-transparent">
              {effectiveColumns.map((column) => (
                <TableHead
                  key={column.key}
                  className="text-[10px] uppercase tracking-wider text-muted-foreground bg-muted/30 font-semibold h-10"
                  style={{ width: column.width }}
                >
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={effectiveColumns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <TableRow
                  key={row?.id ?? row?.key ?? rowIndex}
                  className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                  data-testid={`${testId}-row-${rowIndex}`}
                >
                  {effectiveColumns.map((column) => (
                    <TableCell
                      key={column.key}
                      className="py-3 text-sm"
                    >
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {startIndex + 1} to{" "}
            {Math.min(startIndex + pageSize, sortedData.length)} of{" "}
            {sortedData.length} entries
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              data-testid={`${testId}-prev-page`}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium px-2">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              data-testid={`${testId}-next-page`}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
