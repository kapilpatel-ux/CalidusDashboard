import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DataTable } from "@/components/shared/DataTable";
import { ActionButton, ActionButtonGroup } from "@/components/shared/ActionButton";
import { RatingStars } from "@/components/shared/RatingStars";
import { Button } from "@/components/ui/button";
import { Building2, Eye, Check, X, Edit, Trash2, Ban, RotateCcw, Download } from "lucide-react";
import {
  useGetProductsQuery,
  useUpdateProductStatusMutation,
  useDeleteProductMutation,
} from "@/store/api/admin/productApi";
import { useAdminActions } from "../AdminContext";
import { useRole } from "@/App";

export const ProductManagement = ({
  onView,
  onEdit,
  onConfirmAction
} = {}) => {
  const { currentRole } = useRole();
  const isAdmin = currentRole === "admin";
  const { openViewSheet, openEditDialog, openConfirmDialog } = useAdminActions();
  const handleView = onView || ((item) => openViewSheet("product", item));
  const handleEdit = onEdit || ((item) => openEditDialog("product", item));
  const handleConfirmAction = onConfirmAction || openConfirmDialog;

  const { data: products = [], isLoading } = useGetProductsQuery();
  const [updateProductStatus] = useUpdateProductStatusMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const [statusFilter, setStatusFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isExporting, setIsExporting] = useState(false);
  const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

  const uniqueSuppliers = [...new Set(products.map((p) => p.supplierName))].filter(Boolean);
  const uniqueCategories = [...new Set(products.map((p) => p.category))].filter(Boolean);

  const filteredProducts = products.filter((p) => {
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    const matchesSupplier = supplierFilter === "all" || p.supplierName === supplierFilter;
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
    return matchesStatus && matchesSupplier && matchesCategory;
  });

  const exportCsv = async () => {
    const date = new Date().toISOString().slice(0, 10);
    const url = `${backendUrl}/api/products/export?status=${encodeURIComponent(statusFilter)}&supplierName=${encodeURIComponent(supplierFilter)}&category=${encodeURIComponent(categoryFilter)}`;
    setIsExporting(true);
    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`Export failed (${resp.status})`);
      const blob = await resp.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `products_${date}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error(err);
      alert("Failed to export products CSV. Check backend logs.");
    } finally {
      setIsExporting(false);
    }
  };

  const deriveRating = (row) => {
    if (typeof row.rating === "number" && row.rating > 0) return row.rating;
    if (typeof row.averageRating === "number" && row.averageRating > 0) return row.averageRating;
    if (Array.isArray(row.ratings) && row.ratings.length > 0) {
      const total = row.ratings.reduce((sum, rating) => {
        const value = typeof rating === "number" ? rating : Number(rating?.rating ?? 0);
        return sum + (Number.isFinite(value) ? value : 0);
      }, 0);
      return total / row.ratings.length;
    }
    return 0;
  };

  const columns = [
    {
      key: "name",
      label: "Product Name",
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.image}
            alt={value}
            className="h-10 w-14 rounded-sm object-cover bg-muted"
          />
          <div>
            <p className="font-medium">{value}</p>
            <p className="text-xs text-muted-foreground">{row.subcategory}</p>
          </div>
        </div>
      ),
    },
    {
      key: "supplierName",
      label: "Supplier",
      render: (value) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{value || "Unknown"}</span>
        </div>
      ),
    },
    { key: "category", label: "Category" },
    {
      key: "rating",
      label: "Rating",
      render: (_, row) => {
        const rating = deriveRating(row);
        return rating > 0 ? (
          <RatingStars rating={rating} size="sm" />
        ) : (
          <span className="text-xs text-muted-foreground">No ratings</span>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (value) => <StatusBadge status={value} />,
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <ActionButtonGroup>
          <ActionButton
            icon={Eye}
            label="View"
            testId={`view-product-${row.id}`}
            onClick={() => handleView(row)}
          />

          {isAdmin && row.status === "pending" && (
            <>
              <ActionButton
                icon={Check}
                label="Approve"
                className="text-emerald-400 hover:text-emerald-300"
                testId={`approve-product-${row.id}`}
                onClick={() =>
                  handleConfirmAction(
                    "approve-product",
                    row,
                    `Approve product "${row.name}"?`
                  )
                }
              />
              <ActionButton
                icon={X}
                label="Reject"
                className="text-red-400 hover:text-red-300"
                testId={`reject-product-${row.id}`}
                onClick={() =>
                  handleConfirmAction(
                    "reject-product",
                    row,
                    `Reject product "${row.name}"?`
                  )
                }
              />
            </>
          )}

          {row.status === "approved" && (
            <ActionButton
              icon={Ban}
              label="Suspend"
              className="text-amber-400 hover:text-amber-300"
              testId={`suspend-product-${row.id}`}
              onClick={() =>
                handleConfirmAction(
                  "suspend-product",
                  row,
                  `Suspend product "${row.name}"?`
                )
              }
            />
          )}

          {isAdmin && row.status === "suspended" && (
            <ActionButton
              icon={RotateCcw}
              label="Activate"
              className="text-emerald-400 hover:text-emerald-300"
              testId={`activate-product-${row.id}`}
              onClick={() =>
                handleConfirmAction(
                  "approve-product",
                  row,
                  `Activate product "${row.name}"?`
                )
              }
            />
          )}

          {isAdmin && row.status === "rejected" && (
            <ActionButton
              icon={RotateCcw}
              label="Activate"
              className="text-emerald-400 hover:text-emerald-300"
              testId={`activate-rejected-product-${row.id}`}
              onClick={() => updateProductStatus({ id: row.id, status: "approved" })}
            />
          )}

          <ActionButton
            icon={Edit}
            label="Edit"
            testId={`edit-product-${row.id}`}
            onClick={() => handleEdit(row)}
          />

          <ActionButton
            icon={Trash2}
            label="Delete"
            className="text-red-400 hover:text-red-300"
            testId={`delete-product-${row.id}`}
            onClick={() =>
              handleConfirmAction(
                "delete-product",
                row,
                `Delete product "${row.name}"?`
              )
            }
          />
        </ActionButtonGroup>
      ),
    },
  ];

  if (isLoading) return <p>Loading products...</p>;
  
  return (
    <div className="space-y-6" data-testid="product-management">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold font-['Barlow_Condensed'] uppercase tracking-wide mb-1">
            Product Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage product listings and approvals
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={supplierFilter} onValueChange={setSupplierFilter}>
            <SelectTrigger className="w-[180px] bg-black/20" data-testid="product-supplier-filter">
              <SelectValue placeholder="Supplier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Suppliers</SelectItem>
              {uniqueSuppliers.map((supplier) => (
                <SelectItem key={supplier} value={supplier}>
                  {supplier}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px] bg-black/20" data-testid="product-category-filter">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {uniqueCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] bg-black/20" data-testid="product-status-filter">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredProducts}
        searchPlaceholder="Search products or suppliers..."
        searchKeys={["name", "supplierName", "category", "subcategory"]}
        pageSize={10}
        testId="products-table"
        toolbarRight={
          <Button
            variant="outline"
            className="h-9 bg-black/20 border-border rounded-sm"
            onClick={exportCsv}
            disabled={isExporting}
            data-testid="export-products-csv"
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "Exporting..." : "Export CSV"}
          </Button>
        }
      />
    </div>
  );
};
