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
import { Users, Eye, Ban, Trash2, RotateCcw, Check, X } from "lucide-react";
import { useGetBuyersQuery } from "@/store/api/admin/buyerApi";
import { useAdminActions } from "../AdminContext";

export const BuyerManagement = ({ onView } = {}) => {
  const { openBuyerSheet, openConfirmDialog } = useAdminActions();
  const handleView = onView || openBuyerSheet;

  const { data: buyers = [], isLoading } = useGetBuyersQuery();

  const [statusFilter, setStatusFilter] = useState("all");

  const filteredBuyers =
    statusFilter === "all"
      ? buyers
      : buyers.filter((b) => b.status === statusFilter);

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
        searchKey="name"
        pageSize={10}
        testId="buyers-table"
      />
    </div>
  );
};
