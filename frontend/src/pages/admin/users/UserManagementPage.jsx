import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DataTable } from "@/components/shared/DataTable";
import { ActionButton, ActionButtonGroup } from "@/components/shared/ActionButton";
import { Ban, Pencil, Plus, RotateCcw } from "lucide-react";
import { useAdminActions } from "../AdminContext";
import { useGetUsersQuery } from "@/store/api/admin/userApi";
import { useGetAdminRolesQuery } from "@/store/api/admin/roleApi";

export const UserManagement = () => {
  const { openConfirmDialog, openEditDialog, openAddUserDialog } = useAdminActions();
  const { data: users = [], isLoading } = useGetUsersQuery();
  const { data: roles = [] } = useGetAdminRolesQuery();
  const [roleFilter, setRoleFilter] = useState("all");

  const filteredUsers = roleFilter === "all" ? users : users.filter((user) => user.role === roleFilter);
  const roleLabelByKey = new Map((Array.isArray(roles) ? roles : []).map((r) => [r.key, r.label]));
  const getRoleLabel = (role) => {
    if (!role) return "Unknown";
    const known = roleLabelByKey.get(role);
    if (known) return known;
    if (role === "admin") return "Admin";
    return String(role)
      .replace(/[_-]+/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const columns = [
    { key: "name", label: "User", render: (value, row) => <div><p className="font-medium">{value || row.contactPerson || row.company || "N/A"}</p><p className="text-xs text-muted-foreground">{row.email}</p></div> },
    { key: "role", label: "Role", render: (value) => <Badge variant="secondary">{getRoleLabel(value)}</Badge> },
    { key: "status", label: "Status", render: (value) => <StatusBadge status={value} /> },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <ActionButtonGroup>
          <ActionButton
            icon={Pencil}
            label="Edit"
            testId={`edit-user-${row.id}`}
            onClick={() => openEditDialog("user", row)}
          />

          {["active", "suspended", "inactive"].includes(row.status) && (
            <ActionButton
              icon={row.status === "active" ? Ban : RotateCcw}
              label={row.status === "active" ? "Suspend" : "Activate"}
              className={
                row.status === "active"
                  ? "text-amber-400 hover:text-amber-300"
                  : "text-emerald-400 hover:text-emerald-300"
              }
              testId={`toggle-user-${row.id}`}
              onClick={() =>
                openConfirmDialog(
                  row.status === "active" ? "suspend-user" : "activate-user",
                  row,
                  row.status === "active"
                    ? `Suspend user "${row.name || row.email}"?`
                    : `Activate user "${row.name || row.email}"?`
                )
              }
            />
          )}
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
          <p className="text-sm text-muted-foreground">Manage admin user access and roles</p>
        </div>
        <div className="flex gap-2">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[170px] bg-black/20" data-testid="user-role-filter">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {(Array.isArray(roles) ? roles : []).map((role) => (
                <SelectItem key={role.key} value={role.key}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={openAddUserDialog} data-testid="add-user-btn">
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>
      <DataTable columns={columns} data={filteredUsers} searchPlaceholder="Search users..." searchKey="name" pageSize={10} testId="admin-users-table" />
    </div>
  );
};
