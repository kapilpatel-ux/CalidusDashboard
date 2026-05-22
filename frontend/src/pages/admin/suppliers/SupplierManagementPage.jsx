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
import { Building2, Eye, Check, X, Ban, Trash2, RotateCcw } from "lucide-react";
import {
  useGetSuppliersQuery,
  useDeleteSupplierMutation,
} from "@/store/api/admin/supplierApi";
import { useAdminActions } from "../AdminContext";
import { useRole } from "@/App";

export const SupplierManagement = ({ onView, onConfirmAction } = {}) => {
  const { currentRole } = useRole();
  const isAdmin = currentRole === "admin";
  const { openViewSheet, openConfirmDialog } = useAdminActions();
  const handleView = onView || ((item) => openViewSheet("supplier", item));
  const handleConfirmAction = onConfirmAction || openConfirmDialog;

  const { data: suppliers = [], isLoading, error } = useGetSuppliersQuery();

  console.log("SUPPLIERS:", suppliers);
  console.log("ERROR:", error);
  
  const [deleteSupplier] = useDeleteSupplierMutation();

  const [statusFilter, setStatusFilter] = useState("all");
  const [docFilter, setDocFilter] = useState("all");

  const filteredSuppliers = suppliers.filter((s) => {
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    const matchesDoc = docFilter === "all" || s.documentStatus === docFilter;
    return matchesStatus && matchesDoc;
  });

  const getDocStatusBadge = (status) => {
    switch (status) {
      case "expired":
        return <span className="status-badge bg-red-500/20 text-red-400 border-red-500/30">EXPIRED</span>;
      case "expiring":
        return <span className="status-badge bg-amber-500/20 text-amber-400 border-amber-500/30">EXPIRING</span>;
      default:
        return <span className="status-badge bg-emerald-500/20 text-emerald-400 border-emerald-500/30">ACTIVE</span>;
    }
  };

  const columns = [
    {
      key: "name",
      label: "Supplier Name",
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-sm bg-primary/20 flex items-center justify-center">
            <Building2 className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-medium">{value}</p>
            <p className="text-xs text-muted-foreground">{row.email}</p>
          </div>
        </div>
      ),
    },
    { key: "type", label: "Business Type", render: (value, row) => row.businessType || value || "N/A" },
    { key: "calidusCluster", label: "Cluster", render: (value) => value || "N/A" },
    { key: "country", label: "Country" },
    { key: "productsCount", label: "Products" },
    {
      key: "documentStatus",
      label: "Doc Status",
      render: (value) => getDocStatusBadge(value),
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
            label="View Profile"
            testId={`view-supplier-${row.id}`}
            onClick={() => handleView(row)}
          />

          {isAdmin && row.status === "pending" && (
            <>
              <ActionButton
                icon={Check}
                label="Approve"
                className="text-emerald-400 hover:text-emerald-300"
                testId={`approve-supplier-${row.id}`}
                onClick={() =>
                  handleConfirmAction(
                    "approve-supplier",
                    row,
                    `Approve supplier "${row.name}"?`
                  )
                }
              />
              <ActionButton
                icon={X}
                label="Reject"
                className="text-red-400 hover:text-red-300"
                testId={`reject-supplier-${row.id}`}
                onClick={() =>
                  handleConfirmAction(
                    "reject-supplier",
                    row,
                    `Reject supplier "${row.name}"?`
                  )
                }
              />
            </>
          )}

          {row.status === "active" && (
            <ActionButton
              icon={Ban}
              label="Suspend"
              className="text-amber-400 hover:text-amber-300"
              testId={`suspend-supplier-${row.id}`}
              onClick={() =>
                handleConfirmAction(
                  "suspend-supplier",
                  row,
                  `Suspend supplier "${row.name}"?`
                )
              }
            />
          )}

          {isAdmin && row.status === "suspended" && (
            <ActionButton
              icon={RotateCcw}
              label="Activate"
              className="text-emerald-400 hover:text-emerald-300"
              testId={`activate-supplier-${row.id}`}
              onClick={() =>
                handleConfirmAction(
                  "approve-supplier",
                  row,
                  `Activate supplier "${row.name}"?`
                )
              }
            />
          )}

          {isAdmin && row.status === "rejected" && (
            <ActionButton
              icon={RotateCcw}
              label="Activate"
              className="text-emerald-400 hover:text-emerald-300"
              testId={`activate-rejected-supplier-${row.id}`}
              onClick={() =>
                handleConfirmAction(
                  "approve-supplier",
                  row,
                  `Activate supplier "${row.name}"?`
                )
              }
            />
          )}

          <ActionButton
            icon={Trash2}
            label="Delete"
            className="text-red-400 hover:text-red-300"
            testId={`delete-supplier-${row.id}`}
            onClick={() =>
              handleConfirmAction(
                "delete-supplier",
                row,
                `Delete supplier "${row.name}"?`
              )
            }
          />
        </ActionButtonGroup>
      ),
    },
  ];

  if (isLoading) return <p>Loading suppliers...</p>;

  return (
    <div className="space-y-6" data-testid="supplier-management">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold font-['Barlow_Condensed'] uppercase tracking-wide mb-1">
            Supplier Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage supplier registrations and accounts
          </p>
        </div>

        <div className="flex gap-2">
          <Select value={docFilter} onValueChange={setDocFilter}>
            <SelectTrigger className="w-[150px] bg-black/20" data-testid="doc-status-filter">
              <SelectValue placeholder="Doc Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Docs</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expiring">Expiring</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem> 
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] bg-black/20" data-testid="supplier-status-filter">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredSuppliers}
        searchPlaceholder="Search suppliers..."
        searchKey="name"
        pageSize={10}
        testId="suppliers-table"
      />
    </div>
  );
};
