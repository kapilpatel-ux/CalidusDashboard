import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const AddSubcategoryDialog = ({
  addSubcategoryDialog,
  setAddSubcategoryDialog,
  newSubcategory,
  setNewSubcategory,
  onAddSubcategory,
}) => {
  return (
    <Dialog
      open={addSubcategoryDialog.open}
      onOpenChange={(open) =>
        setAddSubcategoryDialog({ ...addSubcategoryDialog, open })
      }
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">
            Add Subcategory
          </DialogTitle>

          {addSubcategoryDialog.category && (
            <DialogDescription>
              Adding to: {addSubcategoryDialog.category.name}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Subcategory Name
            </Label>
            <Input
              value={newSubcategory}
              onChange={(e) => setNewSubcategory(e.target.value)}
              placeholder="Enter subcategory name"
              className="bg-black/20 mt-1"
              data-testid="new-subcategory-name"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() =>
              setAddSubcategoryDialog({ open: false, category: null })
            }
          >
            Cancel
          </Button>

          <Button
            onClick={onAddSubcategory}
            data-testid="add-subcategory-submit-btn"
          >
            Add Subcategory
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};