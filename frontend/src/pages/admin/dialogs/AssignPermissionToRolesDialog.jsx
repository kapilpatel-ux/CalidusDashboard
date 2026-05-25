import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGetAdminRolesQuery, useUpdateAdminRolePermissionsMutation } from "@/store/api/admin/roleApi";
import { toast } from "sonner";

export const AssignPermissionToRolesDialog = ({
  open,
  setOpen,
  permission,
}) => {
  const permissionKey = permission?.key;
  const permissionLabel = permission?.label || permissionKey || "Permission";
  const { data: roles = [], isLoading } = useGetAdminRolesQuery();
  const [updateRolePermissions, { isLoading: isSaving }] = useUpdateAdminRolePermissionsMutation();
  const [search, setSearch] = useState("");
  const [selectedRoles, setSelectedRoles] = useState(new Set());

  const rolesList = useMemo(() => (Array.isArray(roles) ? roles : []), [roles]);

  useEffect(() => {
    if (!open || !permissionKey) return;
    const initial = new Set(
      rolesList
        .filter((role) => Array.isArray(role?.permissions) && role.permissions.includes(permissionKey))
        .map((role) => role.key),
    );
    setSelectedRoles(initial);
  }, [open, permissionKey, rolesList]);

  const filteredRoles = useMemo(() => {
    const q = String(search || "").trim().toLowerCase();
    if (!q) return rolesList;
    return rolesList.filter((r) => {
      const label = String(r?.label || "").toLowerCase();
      const key = String(r?.key || "").toLowerCase();
      return label.includes(q) || key.includes(q);
    });
  }, [rolesList, search]);

  const toggleRole = (roleKey) => {
    setSelectedRoles((prev) => {
      const next = new Set(prev);
      if (next.has(roleKey)) next.delete(roleKey);
      else next.add(roleKey);
      return next;
    });
  };

  const handleSave = async () => {
    if (!permissionKey) return;
    try {
      const updates = rolesList.map((role) => {
        const current = Array.isArray(role?.permissions) ? role.permissions : [];
        const has = current.includes(permissionKey);
        const want = selectedRoles.has(role.key);
        if (has === want) return null;
        const next = want
          ? Array.from(new Set([...current, permissionKey]))
          : current.filter((p) => p !== permissionKey);
        return updateRolePermissions({ key: role.key, permissions: next }).unwrap();
      }).filter(Boolean);

      await Promise.all(updates);
      toast.success(`Updated roles for "${permissionLabel}"`);
      setOpen(false);
    } catch (error) {
      toast.error(error?.data?.message || error?.message || "Failed to update role permissions");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">
            Assign To Roles: {permissionLabel}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Search Roles
            </Label>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-black/20 mt-1"
              placeholder="Search roles..."
              disabled={isSaving}
              data-testid="assign-permission-role-search"
            />
          </div>

          <div className="border border-white/10 rounded-md overflow-hidden">
            <ScrollArea className="h-[360px]">
              <div className="p-3 space-y-2">
                {isLoading ? (
                  <p className="text-sm text-muted-foreground">Loading roles...</p>
                ) : filteredRoles.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No roles found.</p>
                ) : (
                  filteredRoles.map((role) => (
                    <label
                      key={role.key}
                      className="flex items-start gap-2 rounded-md border border-white/10 bg-black/10 p-2 hover:bg-black/20 transition-colors"
                    >
                      <input
                        type="checkbox"
                        className="mt-0.5"
                        checked={selectedRoles.has(role.key)}
                        onChange={() => toggleRole(role.key)}
                        disabled={isSaving}
                        data-testid={`assign-permission-role-${role.key}`}
                      />
                      <div>
                        <p className="text-sm">{role.label || "N/A"}</p>
                        <p className="text-xs text-muted-foreground">{role.key}</p>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !permissionKey} data-testid="assign-permission-save-btn">
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

