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
import { Users, Eye, Ban, Trash2 } from "lucide-react";
import {
  useGetBuyersQuery,
  useUpdateBuyerStatusMutation,
  useDeleteBuyerMutation,
} from "@/store/api/buyerApi";

export const BuyerManagement = ({ onView }) => {

  const { data: buyers = [], isLoading } = useGetBuyersQuery();
  const [updateBuyerStatus] = useUpdateBuyerStatusMutation();
  const [deleteBuyer] = useDeleteBuyerMutation();

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
            onClick={() => onView(row)}
          />

          {row.status === "active" && (
            <ActionButton
              icon={Ban}
              label="Suspend"
              className="text-amber-400 hover:text-amber-300"
              testId={`suspend-buyer-${row.id}`}
              onClick={() =>
                updateBuyerStatus({
                  id: row.id,
                  status: "suspended",
                })
              }
            />
          )}

          <ActionButton
            icon={Trash2}
            label="Delete"
            className="text-red-400 hover:text-red-300"
            testId={`delete-buyer-${row.id}`}
            onClick={() => deleteBuyer(row.id)}
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
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filteredBuyers}
        searchPlaceholder="Search buyers..."
        searchKey="name"
        pageSize={5}
        testId="buyers-table"
      />
    </div>
  );
};