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
import { Users, Eye, Ban, Trash2, RotateCcw, Check, X, Download } from "lucide-react";
import { useGetBuyersQuery } from "@/store/api/admin/buyerApi";
import { useAdminActions } from "../AdminContext";

export const BuyerManagement = ({ onView } = {}) => {
  const { openBuyerSheet, openConfirmDialog } = useAdminActions();
  const handleView = onView || openBuyerSheet;

  const { data: buyers = [], isLoading } = useGetBuyersQuery();

  const [statusFilter, setStatusFilter] = useState("all");
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
  const requiredBuyerColumns = [
    "id",
    "name",
    "email",
    "phone",
    "company",
    "country",
    "status",
    "joinDate",
    "enquiriesSent",
    "ratingsSubmitted",
  ];

  const filteredBuyers =
    statusFilter === "all"
      ? buyers
      : buyers.filter((b) => b.status === statusFilter);

  const exportCsv = async () => {
    const date = new Date().toISOString().slice(0, 10);
    const url = `${backendUrl}/api/buyers/export?status=${encodeURIComponent(statusFilter)}`;
    setIsExporting(true);
    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`Export failed (${resp.status})`);
      const blob = await resp.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `buyers_${date}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error(err);
      alert("Failed to export buyers CSV. Check backend logs.");
    } finally {
      setIsExporting(false);
    }
  };

  const importCsv = async (file) => {
    if (!file) return;
    setIsImporting(true);
    try {
      const csv = await file.text();
      const resp = await fetch(`${backendUrl}/api/buyers/import`, {
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
          : requiredBuyerColumns;

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
      alert("Failed to import buyers CSV. Check console for details.");
    } finally {
      setIsImporting(false);
    }
  };

  const downloadDummyCsv = () => {
    const sampleRow = {
      id: "BUY001",
      name: "Example Buyer",
      email: "buyer@example.com",
      phone: "+971501234567",
      company: "Example Company",
      country: "United Arab Emirates",
      status: "pending",
      joinDate: new Date().toISOString().slice(0, 10),
      enquiriesSent: "0",
      ratingsSubmitted: "0",
    };
    const escapeCsv = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const csv = [
      requiredBuyerColumns.join(","),
      requiredBuyerColumns.map((column) => escapeCsv(sampleRow[column])).join(","),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const objectUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = "buyer_import_template.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(objectUrl);
  };

  const columns = [
    {
      key: "name",
      label: "Buyer Name",
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-sm bg-primary/20 flex items-center justify-center">
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-medium">{value}</p>
            <p className="text-xs text-muted-foreground">{row.email}</p>
          </div>
        </div>
      ),
    },
    { key: "company", label: "Company" },
    { key: "country", label: "Country" },
    { key: "enquiriesSent", label: "Enquiries" },
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
            testId={`view-buyer-${row.id}`}
            onClick={() => handleView(row)}
          />

          {row.status === "pending" && (
            <>
              <ActionButton
                icon={Check}
                label="Approve"
                className="text-emerald-400 hover:text-emerald-300"
                testId={`approve-buyer-${row.id}`}
                onClick={() =>
                  openConfirmDialog(
                    "approve-buyer",
                    row,
                    `Approve buyer "${row.name}"?`
                  )
                }
              />
              <ActionButton
                icon={X}
                label="Reject"
                className="text-red-400 hover:text-red-300"
                testId={`reject-buyer-${row.id}`}
                onClick={() =>
                  openConfirmDialog(
                    "reject-buyer",
                    row,
                    `Reject buyer "${row.name}"?`
                  )
                }
              />
            </>
          )}

          {["active", "suspended", "inactive"].includes(row.status) && (
            <ActionButton
              icon={row.status === "active" ? Ban : RotateCcw}
              label={row.status === "active" ? "Suspend" : "Activate"}
              className={
                row.status === "active"
                  ? "text-amber-400 hover:text-amber-300"
                  : "text-emerald-400 hover:text-emerald-300"
              }
              testId={`suspend-buyer-${row.id}`}
              onClick={() =>
                openConfirmDialog(
                  row.status === "active" ? "suspend-buyer" : "activate-buyer",
                  row,
                  row.status === "active"
                    ? `Suspend buyer "${row.name}"?`
                    : `Activate buyer "${row.name}"?`
                )
              }
            />
          )}

          <ActionButton
            icon={Trash2}
            label="Delete"
            className="text-red-400 hover:text-red-300"
            testId={`delete-buyer-${row.id}`}
            onClick={() =>
              openConfirmDialog(
                "delete-buyer",
                row,
                `Delete buyer "${row.name}"?`
              )
            }
          />
        </ActionButtonGroup>
      ),
    },
  ];

  if (isLoading) return <p>Loading buyers...</p>;

  return (
    <div className="space-y-6" data-testid="buyer-management">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold font-['Barlow_Condensed'] uppercase tracking-wide mb-1">
            Buyer Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage buyer accounts and activities
          </p>
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px] bg-black/20" data-testid="buyer-status-filter">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filteredBuyers}
        searchPlaceholder="Search buyers..."
        searchKeys={["name", "email", "company"]}
        pageSize={10}
        testId="buyers-table"
        toolbarRight={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="h-9 bg-black/20 border-border rounded-sm"
              onClick={exportCsv}
              disabled={isExporting || isImporting}
              data-testid="export-buyers-csv"
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? "Exporting..." : "Export CSV"}
            </Button>

            <Button
              asChild
              variant="outline"
              className="h-9 bg-black/20 border-border rounded-sm"
              disabled={isExporting || isImporting}
              data-testid="import-buyers-csv"
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

            <Button
              variant="outline"
              className="h-9 bg-black/20 border-border rounded-sm"
              onClick={downloadDummyCsv}
              disabled={isExporting || isImporting}
              data-testid="download-buyer-dummy-csv"
            >
              <Download className="h-4 w-4 mr-2" />
              Dummy CSV
            </Button>
          </div>
        }
      />
    </div>
  );
};
