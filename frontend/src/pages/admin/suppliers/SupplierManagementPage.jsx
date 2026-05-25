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
import { Button } from "@/components/ui/button";
import { Building2, Eye, Check, X, Ban, Trash2, RotateCcw, Download } from "lucide-react";
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

  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
  const requiredSupplierColumns = [
    "id",
    "name",
    "email",
    "phone",
    "type",
    "businessType",
    "calidusCluster",
    "country",
    "productsCount",
    "documentStatus",
    "status",
    "joinDate",
    "rating",
    "totalEnquiries",
    "profileViews",
  ];

  const exportCsv = async () => {
    const date = new Date().toISOString().slice(0, 10);
    const url = `${backendUrl}/api/suppliers/export?status=${encodeURIComponent(statusFilter)}&documentStatus=${encodeURIComponent(docFilter)}`;
    setIsExporting(true);
    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`Export failed (${resp.status})`);
      const blob = await resp.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `suppliers_${date}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error(err);
      alert("Failed to export suppliers CSV. Check backend logs / SMTP config is unrelated.");
    } finally {
      setIsExporting(false);
    }
  };

  const importCsv = async (file) => {
    if (!file) return;
    setIsImporting(true);
    try {
      const csv = await file.text();
      const resp = await fetch(`${backendUrl}/api/suppliers/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        const msg =
          data?.message ||
          data?.detail ||
          `Import failed (${resp.status}). Ensure the CSV has the correct columns.`;
        const expectedFields = Array.isArray(data?.expectedFields) && data.expectedFields.length
          ? data.expectedFields
          : requiredSupplierColumns;

        if (resp.status === 400) {
          alert(
            `${msg}\n\nRequired columns:\n${expectedFields.join(", ")}\n\nMissing: ${(data.missingFields || []).join(", ") || "None"}\nUnknown: ${(data.unknownFields || []).join(", ") || "None"}`
          );
        } else if (data?.errors?.length) {
          alert(`${msg}\n\nFirst error (line ${data.errors[0].line}): ${data.errors[0].message}`);
        } else {
          alert(msg);
        }
        return;
      }
      alert(`Import completed.\nCreated: ${data.created || 0}\nUpdated: ${data.updated || 0}\nFailed: ${data.failed || 0}`);
    } catch (err) {
      console.error(err);
      alert("Failed to import suppliers CSV. Check console for details.");
    } finally {
      setIsImporting(false);
    }
  };

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
        searchKeys={["name", "email", "country", "businessType", "type"]}
        pageSize={10}
        testId="suppliers-table"
        toolbarRight={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="h-9 bg-black/20 border-border rounded-sm"
              onClick={exportCsv}
              disabled={isExporting || isImporting}
              data-testid="export-suppliers-csv"
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? "Exporting..." : "Export CSV"}
            </Button>

            <Button
              asChild
              variant="outline"
              className="h-9 bg-black/20 border-border rounded-sm"
              disabled={isExporting || isImporting}
              data-testid="import-suppliers-csv"
            >
              <label>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    importCsv(file);
                  }}
                />
                {isImporting ? "Importing..." : "Import CSV"}
              </label>
            </Button>
          </div>
        }
      />
    </div>
  );
};
