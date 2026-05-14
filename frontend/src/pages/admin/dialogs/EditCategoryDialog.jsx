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

export const EditCategoryDialog = ({
  editDialog,
  setEditDialog,
  editForm,
  setEditForm,
  onSave,
}) => {
  return (
    <>
      <Dialog
        open={editDialog.open && editDialog.type === "category"}
        onOpenChange={(open) => setEditDialog({ ...editDialog, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">
              Edit Category
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Category Name
              </Label>
              <Input
                value={editForm.name || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                className="bg-black/20 mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialog({ ...editDialog, open: false })}
            >
              Cancel
            </Button>
            <Button onClick={onSave} data-testid="edit-category-save-btn">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={editDialog.open && editDialog.type === "subcategory"}
        onOpenChange={(open) => setEditDialog({ ...editDialog, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">
              Edit Subcategory
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Subcategory Name
              </Label>
              <Input
                value={editForm.name || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                className="bg-black/20 mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialog({ ...editDialog, open: false })}
            >
              Cancel
            </Button>
            <Button onClick={onSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};