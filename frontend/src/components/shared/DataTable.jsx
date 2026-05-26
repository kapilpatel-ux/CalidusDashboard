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

export const DataTable = ({
  columns,
  data,
  searchPlaceholder = "Search...",
  searchKey,
  searchKeys,
  pageSize = 10,
  className,
  testId,
  toolbarRight,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

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
      ? data.filter((item) =>
          effectiveSearchKeys.some((key) =>
            String(item?.[key] ?? "")
              .toLowerCase()
              .includes(normalizedSearch)
          )
        )
      : data;

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

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
              {columns.map((column) => (
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
                  colSpan={columns.length}
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
                  {columns.map((column) => (
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
            {Math.min(startIndex + pageSize, filteredData.length)} of{" "}
            {filteredData.length} entries
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
