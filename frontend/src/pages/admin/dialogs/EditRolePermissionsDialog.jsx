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
import { useGetAdminPermissionsQuery } from "@/store/api/admin/permissionApi";

const groupPermissions = (permissions) => {
  const groups = new Map();
  for (const perm of permissions) {
    const group = perm.group || "Admin";
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push(perm);
  }
  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([group, list]) => [group, list.sort((x, y) => (x.label || "").localeCompare(y.label || ""))]);
};

export const EditRolePermissionsDialog = ({
  open,
  setOpen,
  role,
  onSave,
  isSaving = false,
}) => {
  const { data: permissions = [], isLoading } = useGetAdminPermissionsQuery();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(new Set());

  useEffect(() => {
    const current = Array.isArray(role?.permissions) ? role.permissions : [];
    setSelected(new Set(current));
  }, [role?.key, role?.permissions]);

  const filteredPermissions = useMemo(() => {
    const list = Array.isArray(permissions) ? permissions : [];
    const q = String(search || "").trim().toLowerCase();
    if (!q) return list;
    return list.filter((p) => String(p.label || "").toLowerCase().includes(q) || String(p.key || "").toLowerCase().includes(q));
  }, [permissions, search]);

  const grouped = useMemo(() => groupPermissions(filteredPermissions), [filteredPermissions]);
  const roleLabel = role?.label || role?.key || "Role";

  const toggle = (key) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleSave = () => onSave(Array.from(selected));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">
            Permissions: {roleLabel}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Search
            </Label>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-black/20 mt-1"
              placeholder="Search permissions..."
              data-testid="role-permission-search"
              disabled={isSaving}
            />
          </div>

          <div className="border border-white/10 rounded-md overflow-hidden">
            <ScrollArea className="h-[380px]">
              <div className="p-3 space-y-4">
                {isLoading ? (
                  <p className="text-sm text-muted-foreground">Loading permissions...</p>
                ) : grouped.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No permissions found.</p>
                ) : (
                  grouped.map(([group, list]) => (
                    <div key={group}>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                        {group}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {list.map((perm) => (
                          <label
                            key={perm.key}
                            className="flex items-start gap-2 rounded-md border border-white/10 bg-black/10 p-2 hover:bg-black/20 transition-colors"
                          >
                            <input
                              type="checkbox"
                              className="mt-0.5"
                              checked={selected.has(perm.key)}
                              onChange={() => toggle(perm.key)}
                              disabled={isSaving}
                              data-testid={`perm-${perm.key}`}
                            />
                            <div>
                              <p className="text-sm">{perm.label}</p>
                              <p className="text-xs text-muted-foreground">{perm.key}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
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
          <Button onClick={handleSave} disabled={isSaving} data-testid="role-permission-save-btn">
            {isSaving ? "Saving..." : "Save Permissions"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
