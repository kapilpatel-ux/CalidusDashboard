import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DataTable } from "@/components/shared/DataTable";
import { ActionButton, ActionButtonGroup } from "@/components/shared/ActionButton";
import { Ban, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useGetUsersQuery, useUpdateUserStatusMutation } from "@/store/api/admin/userApi";

export const UserManagement = () => {
  const { data: users = [], isLoading } = useGetUsersQuery();
  const [updateStatus] = useUpdateUserStatusMutation();
  const [roleFilter, setRoleFilter] = useState("all");

  const filteredUsers = roleFilter === "all" ? users : users.filter((user) => user.role === roleFilter);

  const handleStatus = async (row, status) => {
    try {
      await updateStatus({ id: row.id, role: row.role, status }).unwrap();
      toast.success(`${row.name || row.company || row.email} ${status}`);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update user");
    }
  };

  const columns = [
    { key: "name", label: "User", render: (value, row) => <div><p className="font-medium">{value || row.contactPerson || row.company || "N/A"}</p><p className="text-xs text-muted-foreground">{row.email}</p></div> },
    { key: "role", label: "Role", render: (value) => <Badge variant="secondary">{value}</Badge> },
    { key: "country", label: "Country" },
    { key: "status", label: "Status", render: (value) => <StatusBadge status={value} /> },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <ActionButtonGroup>
          <ActionButton icon={Ban} label="Suspend" className="text-amber-400 hover:text-amber-300" testId={`suspend-user-${row.id}`} onClick={() => handleStatus(row, "suspended")} />
          <ActionButton icon={RotateCcw} label="Activate" className="text-emerald-400 hover:text-emerald-300" testId={`activate-user-${row.id}`} onClick={() => handleStatus(row, "active")} />
        </ActionButtonGroup>
      ),
    },
  ];

  if (isLoading) return <p>Loading users...</p>;

  return (
    <div className="space-y-6" data-testid="admin-user-management">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold font-['Barlow_Condensed'] uppercase tracking-wide mb-1">User Management</h1>
          <p className="text-sm text-muted-foreground">Manage supplier and buyer account access</p>
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[150px] bg-black/20" data-testid="user-role-filter">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="supplier">Suppliers</SelectItem>
            <SelectItem value="buyer">Buyers</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DataTable columns={columns} data={filteredUsers} searchPlaceholder="Search users..." searchKey="name" pageSize={5} testId="admin-users-table" />
    </div>
  );
};
