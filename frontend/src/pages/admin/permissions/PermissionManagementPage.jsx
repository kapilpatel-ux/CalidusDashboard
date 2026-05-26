import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/DataTable";
import { ActionButton, ActionButtonGroup } from "@/components/shared/ActionButton";
import { KeyRound, Pencil, Plus, Trash2 } from "lucide-react";
import { useAdminActions } from "../AdminContext";
import { useGetAdminPermissionsQuery } from "@/store/api/admin/permissionApi";
import { AssignPermissionToRolesDialog } from "../dialogs/AssignPermissionToRolesDialog";
import { useGetAdminRolesQuery } from "@/store/api/admin/roleApi";

export const PermissionManagement = () => {
  const { openAddPermissionDialog, openEditDialog, openConfirmDialog } = useAdminActions();
  const { data: permissions = [], isLoading } = useGetAdminPermissionsQuery();
  const { data: roles = [], isLoading: isRolesLoading } = useGetAdminRolesQuery();
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [activePermission, setActivePermission] = useState(null);

  const data = useMemo(() => (Array.isArray(permissions) ? permissions : []), [permissions]);
  const rolesList = useMemo(() => (Array.isArray(roles) ? roles : []), [roles]);

  const permissionAssignments = useMemo(() => {
    const map = new Map();
    for (const role of rolesList) {
      const roleKey = role?.key;
      const roleLabel = role?.label || roleKey;
      const perms = Array.isArray(role?.permissions) ? role.permissions : [];
      for (const permKey of perms) {
        if (!map.has(permKey)) map.set(permKey, []);
        map.get(permKey).push({ key: roleKey, label: roleLabel });
      }
    }
    for (const [permKey, list] of map.entries()) {
      list.sort((a, b) => String(a.label).localeCompare(String(b.label)));
      map.set(permKey, list);
    }
    return map;
  }, [rolesList]);

  const columns = [
    {
      key: "label",
      label: "Permission",
      render: (value, row) => (
        <div>
          <p className="font-medium">{value || "N/A"}</p>
          <p className="text-xs text-muted-foreground">{row.key}</p>
        </div>
      ),
    },
   
    {
      key: "__assigned_roles",
      label: "Assigned Roles",
      render: (_, row) => {
        if (isRolesLoading) return <span className="text-xs text-muted-foreground">Loading...</span>;
        const assigned = permissionAssignments.get(row.key) || [];
        if (assigned.length === 0) return <span className="text-xs text-muted-foreground">—</span>;
        const visible = assigned.slice(0, 3);
        const remaining = assigned.length - visible.length;
        return (
          <div className="flex flex-wrap gap-1">
            {visible.map((r) => (
              <Badge key={r.key} variant="secondary">
                {r.label}
              </Badge>
            ))}
            {remaining > 0 ? (
              <Badge variant="outline">+{remaining}</Badge>
            ) : null}
          </div>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <ActionButtonGroup>
          <ActionButton
            icon={KeyRound}
            label="Assign"
            testId={`assign-permission-${row.key}`}
            onClick={() => {
              setActivePermission(row);
              setAssignDialogOpen(true);
            }}
          />
          <ActionButton
            icon={Pencil}
            label="Edit"
            testId={`edit-permission-${row.key}`}
            onClick={() => openEditDialog("permission", row)}
          />
          <ActionButton
            icon={Trash2}
            label="Delete"
            className="text-red-400 hover:text-red-300"
            testId={`delete-permission-${row.key}`}
            disabled={Boolean(row?.isSystem)}
            onClick={() =>
              openConfirmDialog(
                "delete-permission",
                row,
                `Delete permission "${row.label}"? This cannot be undone.`
              )
            }
          />
        </ActionButtonGroup>
      ),
    },
  ];

  if (isLoading) return <p>Loading permissions...</p>;

  return (
    <div className="space-y-6" data-testid="admin-permission-management">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold font-['Barlow_Condensed'] uppercase tracking-wide mb-1">
            Permission Management
          </h1>
          <p className="text-sm text-muted-foreground">Manage permissions and assign them to roles</p>
        </div>

        <Button onClick={openAddPermissionDialog} data-testid="add-permission-btn">
          <Plus className="h-4 w-4 mr-2" />
          Add Permission
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder="Search permissions..."
        searchKey="label"
        pageSize={10}
        testId="admin-permissions-table"
      />

      <AssignPermissionToRolesDialog
        open={assignDialogOpen}
        setOpen={setAssignDialogOpen}
        permission={activePermission}
      />
    </div>
  );
};
