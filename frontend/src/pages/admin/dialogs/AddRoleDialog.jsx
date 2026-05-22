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

export const AddRoleDialog = ({
  open,
  setOpen,
  newRole,
  setNewRole,
  onAddRole,
  isAdding = false,
}) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">
            Add Role
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Role Name
            </Label>
            <Input
              value={newRole.label || ""}
              onChange={(e) => setNewRole((prev) => ({ ...prev, label: e.target.value }))}
              className="bg-black/20 mt-1"
              placeholder="e.g. Finance Manager"
              data-testid="add-role-name"
              disabled={isAdding}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isAdding}>
            Cancel
          </Button>
          <Button
            onClick={onAddRole}
            disabled={isAdding || !String(newRole.label || "").trim()}
            data-testid="add-role-submit-btn"
          >
            {isAdding ? "Creating..." : "Create Role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

