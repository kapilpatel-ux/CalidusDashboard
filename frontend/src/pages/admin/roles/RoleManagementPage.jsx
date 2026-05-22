import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/DataTable";
import { ActionButton, ActionButtonGroup } from "@/components/shared/ActionButton";
import { KeyRound, Pencil, Plus, Trash2 } from "lucide-react";
import { useAdminActions } from "../AdminContext";
import { useGetAdminRolesQuery } from "@/store/api/admin/roleApi";
import { EditRolePermissionsDialog } from "../dialogs/EditRolePermissionsDialog";
import { useUpdateAdminRolePermissionsMutation } from "@/store/api/admin/roleApi";
import { toast } from "sonner";

export const RoleManagement = () => {
  const { openAddRoleDialog, openEditDialog, openConfirmDialog } = useAdminActions();
  const { data: roles = [], isLoading } = useGetAdminRolesQuery();
  const [updateRolePermissions, { isLoading: isSavingPermissions }] = useUpdateAdminRolePermissionsMutation();
  const [typeFilter, setTypeFilter] = useState("all");
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [activeRole, setActiveRole] = useState(null);

  const filteredRoles = useMemo(() => {
    const list = Array.isArray(roles) ? roles : [];
    if (typeFilter === "system") return list.filter((r) => r.isSystem);
    if (typeFilter === "custom") return list.filter((r) => !r.isSystem);
    return list;
  }, [roles, typeFilter]);

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
          {/* <ActionButton
            icon={KeyRound}
            label="Permissions"
            testId={`role-permissions-${row.key}`}
            onClick={() => {
              setActiveRole(row);
              setPermissionsDialogOpen(true);
            }}
          /> */}
          <ActionButton
            icon={Pencil}
            label="Edit"
            testId={`edit-role-${row.key}`}
            onClick={() => openEditDialog("role", row)}
            disabled={Boolean(row.isSystem)}
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
            disabled={Boolean(row.isSystem)}
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
        data={filteredRoles}
        searchPlaceholder="Search roles..."
        searchKey="label"
        pageSize={10}
        testId="admin-roles-table"
      />

      <EditRolePermissionsDialog
        open={permissionsDialogOpen}
        setOpen={setPermissionsDialogOpen}
        role={activeRole}
        isSaving={isSavingPermissions}
        onSave={async (permissions) => {
          if (!activeRole?.key) return;
          try {
            await updateRolePermissions({ key: activeRole.key, permissions }).unwrap();
            toast.success(`Permissions updated for "${activeRole.label}"`);
            setPermissionsDialogOpen(false);
          } catch (error) {
            toast.error(error?.data?.message || error?.message || "Failed to update permissions");
          }
        }}
      />
    </div>
  );
};
