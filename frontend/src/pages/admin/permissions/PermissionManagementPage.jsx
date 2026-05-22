import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/DataTable";
import { ActionButton, ActionButtonGroup } from "@/components/shared/ActionButton";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useAdminActions } from "../AdminContext";
import { useGetAdminPermissionsQuery } from "@/store/api/admin/permissionApi";

export const PermissionManagement = () => {
  const { openAddPermissionDialog, openEditDialog, openConfirmDialog } = useAdminActions();
  const { data: permissions = [], isLoading } = useGetAdminPermissionsQuery();

  const data = useMemo(() => (Array.isArray(permissions) ? permissions : []), [permissions]);

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
      key: "group",
      label: "Group",
      render: (value) => <Badge variant="outline">{value || "Admin"}</Badge>,
    },
    {
      key: "isSystem",
      label: "Type",
      render: (value) =>
        value ? <Badge variant="secondary">System</Badge> : <Badge variant="outline">Custom</Badge>,
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <ActionButtonGroup>
          <ActionButton
            icon={Pencil}
            label="Edit"
            testId={`edit-permission-${row.key}`}
            onClick={() => openEditDialog("permission", row)}
            disabled={Boolean(row.isSystem)}
          />
          <ActionButton
            icon={Trash2}
            label="Delete"
            className="text-red-400 hover:text-red-300"
            testId={`delete-permission-${row.key}`}
            onClick={() =>
              openConfirmDialog(
                "delete-permission",
                row,
                `Delete permission "${row.label}"? This cannot be undone.`
              )
            }
            disabled={Boolean(row.isSystem)}
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
    </div>
  );
};

