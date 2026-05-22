import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGetAdminRolesQuery } from "@/store/api/admin/roleApi";

export const EditUserDialog = ({
  editDialog,
  setEditDialog,
  editForm,
  setEditForm,
  onSave,
}) => {
  const { data: roles = [], isLoading: isRolesLoading } = useGetAdminRolesQuery();

  return (
    <Dialog
      open={editDialog.open && editDialog.type === "user"}
      onOpenChange={(open) => setEditDialog({ ...editDialog, open })}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">
            Edit User
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Name
            </Label>
            <Input
              value={editForm.name || ""}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="bg-black/20 mt-1"
              data-testid="edit-user-name"
            />
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Email
            </Label>
            <Input
              value={editForm.email || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, email: e.target.value })
              }
              className="bg-black/20 mt-1"
              data-testid="edit-user-email"
            />
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Role
            </Label>
            <Select
              value={editForm.role || ""}
              onValueChange={(role) => setEditForm({ ...editForm, role })}
              disabled={isRolesLoading}
            >
              <SelectTrigger className="bg-black/20 mt-1" data-testid="edit-user-role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {(Array.isArray(roles) ? roles : []).map((role) => (
                  <SelectItem key={role.key} value={role.key}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setEditDialog({ ...editDialog, open: false })}
          >
            Cancel
          </Button>
          <Button onClick={onSave} data-testid="edit-user-save-btn">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
