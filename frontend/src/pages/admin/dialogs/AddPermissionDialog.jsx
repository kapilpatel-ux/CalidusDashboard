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

export const AddPermissionDialog = ({
  open,
  setOpen,
  newPermission,
  setNewPermission,
  onAddPermission,
  isAdding = false,
}) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">
            Add Permission
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Permission Name
            </Label>
            <Input
              value={newPermission.label || ""}
              onChange={(e) => setNewPermission((prev) => ({ ...prev, label: e.target.value }))}
              className="bg-black/20 mt-1"
              placeholder="e.g. Export Reports"
              data-testid="add-permission-label"
              disabled={isAdding}
            />
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Group
            </Label>
            <Input
              value={newPermission.group || ""}
              onChange={(e) => setNewPermission((prev) => ({ ...prev, group: e.target.value }))}
              className="bg-black/20 mt-1"
              placeholder="Admin"
              data-testid="add-permission-group"
              disabled={isAdding}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isAdding}>
            Cancel
          </Button>
          <Button
            onClick={onAddPermission}
            disabled={isAdding || !String(newPermission.label || "").trim()}
            data-testid="add-permission-submit-btn"
          >
            {isAdding ? "Creating..." : "Create Permission"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

