import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const EditPermissionDialog = ({
  editDialog,
  setEditDialog,
  editForm,
  setEditForm,
  onSave,
  isSaving = false,
}) => {
  const isOpen = editDialog.open && editDialog.type === "permission";
  const isSystem = Boolean(editForm?.isSystem);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => setEditDialog({ ...editDialog, open })}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">
            Edit Permission
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Permission Key
            </Label>
            <Input
              value={editForm.key || ""}
              className="bg-black/20 mt-1"
              disabled
              data-testid="edit-permission-key"
            />
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Permission Name
            </Label>
            <Input
              value={editForm.label || ""}
              onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
              className="bg-black/20 mt-1"
              disabled={isSaving || isSystem}
              data-testid="edit-permission-label"
            />
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Group
            </Label>
            <Input
              value={editForm.group || ""}
              onChange={(e) => setEditForm({ ...editForm, group: e.target.value })}
              className="bg-black/20 mt-1"
              disabled={isSaving || isSystem}
              data-testid="edit-permission-group"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setEditDialog({ ...editDialog, open: false })}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={onSave}
            disabled={isSaving || isSystem || !String(editForm.label || "").trim()}
            data-testid="edit-permission-save-btn"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

