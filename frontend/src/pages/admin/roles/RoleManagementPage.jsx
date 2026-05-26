import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/DataTable";
import { ActionButton, ActionButtonGroup } from "@/components/shared/ActionButton";
import { KeyRound, Pencil, Plus, Trash2 } from "lucide-react";
import { useAdminActions } from "../AdminContext";
import { useGetAdminRolesQuery, useUpdateAdminRolePermissionsMutation } from "@/store/api/admin/roleApi";
import { EditRolePermissionsDialog } from "../dialogs/EditRolePermissionsDialog";
import { toast } from "sonner";
import { useGetAdminPermissionsQuery } from "@/store/api/admin/permissionApi";

export const RoleManagement = () => {
  const { openAddRoleDialog, openEditDialog, openConfirmDialog } = useAdminActions();
  const { data: roles = [], isLoading } = useGetAdminRolesQuery();
  const { data: permissions = [], isLoading: isPermissionsLoading } = useGetAdminPermissionsQuery();
  const rolesList = useMemo(() => (Array.isArray(roles) ? roles : []), [roles]);
  const permissionList = useMemo(() => (Array.isArray(permissions) ? permissions : []), [permissions]);
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [activeRole, setActiveRole] = useState(null);
  const [updateRolePermissions, { isLoading: isSavingPermissions }] = useUpdateAdminRolePermissionsMutation();

  const permissionLabelByKey = useMemo(() => {
    const map = new Map();
    for (const perm of permissionList) {
      if (perm?.key) map.set(perm.key, perm.label || perm.key);
    }
    return map;
  }, [permissionList]);

  const columns = [
    {
      key: "label",
      label: "Role",
      render: (value, row) => (
        <div>
          <p className="font-medium">{value || "N/A"}</p>
          <p className="text-xs text-muted-foreground">{row.key}</p>
        </div>
      ),
    },
    {
      key: "__permissions",
      label: "Permissions",
      render: (_, row) => {
        if (isPermissionsLoading) return <span className="text-xs text-muted-foreground">Loading...</span>;
        const perms = Array.isArray(row?.permissions) ? row.permissions : [];
        if (perms.length === 0) return <span className="text-xs text-muted-foreground">—</span>;
        const labels = perms
          .map((k) => permissionLabelByKey.get(k) || k)
          .sort((a, b) => String(a).localeCompare(String(b)));
        const visible = labels.slice(0, 3);
        const remaining = labels.length - visible.length;
        return (
          <div className="flex flex-wrap gap-1">
            {visible.map((label) => (
              <Badge key={label} variant="secondary">
                {label}
              </Badge>
            ))}
            {remaining > 0 ? <Badge variant="outline">+{remaining}</Badge> : null}
          </div>
        );
      },
    },
    // {
    //   key: "isSystem",
    //   label: "Type",
    //   render: (value) =>
    //     value ? <Badge variant="secondary">System</Badge> : <Badge variant="outline">Custom</Badge>,
    // },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <ActionButtonGroup>
          <ActionButton
            icon={KeyRound}
            label="Permissions"
            testId={`role-permissions-${row.key}`}
            onClick={() => {
              setActiveRole(row);
              setPermissionDialogOpen(true);
            }}
          />
          <ActionButton
            icon={Pencil}
            label="Edit"
            testId={`edit-role-${row.key}`}
            onClick={() => openEditDialog("role", row)}
          />
          <ActionButton
            icon={Trash2}
            label="Delete"
            className="text-red-400 hover:text-red-300"
            testId={`delete-role-${row.key}`}
            onClick={() =>
              openConfirmDialog(
                "delete-role",
                row,
                `Delete role "${row.label}"? This cannot be undone.`
              )
            }
          />
        </ActionButtonGroup>
      ),
    },
  ];

  if (isLoading) return <p>Loading roles...</p>;

  return (
    <div className="space-y-6" data-testid="admin-role-management">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold font-['Barlow_Condensed'] uppercase tracking-wide mb-1">
            Role Management
          </h1>
          <p className="text-sm text-muted-foreground">Manage admin roles</p>
        </div>

        <div className="flex gap-2">
          {/* <div className="flex rounded-md overflow-hidden border border-white/10">
            <button
              type="button"
              className={`px-3 py-2 text-sm ${typeFilter === "all" ? "bg-white/10" : "bg-transparent"} hover:bg-white/10`}
              onClick={() => setTypeFilter("all")}
              data-testid="role-filter-all"
            >
              All
            </button>
            <button
              type="button"
              className={`px-3 py-2 text-sm ${typeFilter === "system" ? "bg-white/10" : "bg-transparent"} hover:bg-white/10`}
              onClick={() => setTypeFilter("system")}
              data-testid="role-filter-system"
            >
              System
            </button>
            <button
              type="button"
              className={`px-3 py-2 text-sm ${typeFilter === "custom" ? "bg-white/10" : "bg-transparent"} hover:bg-white/10`}
              onClick={() => setTypeFilter("custom")}
              data-testid="role-filter-custom"
            >
              Custom
            </button>
          </div> */}

          <Button onClick={openAddRoleDialog} data-testid="add-role-btn">
            <Plus className="h-4 w-4 mr-2" />
            Add Role
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={rolesList}
        searchPlaceholder="Search roles..."
        searchKey="label"
        pageSize={10}
        testId="admin-roles-table"
      />

      <EditRolePermissionsDialog
        open={permissionDialogOpen}
        setOpen={(open) => {
          setPermissionDialogOpen(open);
          if (!open) setActiveRole(null);
        }}
        role={activeRole}
        isSaving={isSavingPermissions}
        onSave={async (permissions) => {
          if (!activeRole?.key) return;
          try {
            await updateRolePermissions({ key: activeRole.key, permissions }).unwrap();
            toast.success(`Permissions updated for "${activeRole.label || activeRole.key}"`);
            setPermissionDialogOpen(false);
            setActiveRole(null);
          } catch (error) {
            toast.error(error?.data?.message || error?.message || "Failed to update role permissions");
          }
        }}
      />
    </div>
  );
};
