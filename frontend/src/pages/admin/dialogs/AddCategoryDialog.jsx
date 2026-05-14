import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const AddCategoryDialog = ({
  open,
  setOpen,
  newCategory,
  setNewCategory,
  onAddCategory,
}) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">
            Add New Category
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Category Name
            </Label>
            <Input
              value={newCategory.name}
              onChange={(e) =>
                setNewCategory({ ...newCategory, name: e.target.value })
              }
              placeholder="Enter category name"
              className="bg-black/20 mt-1"
              data-testid="new-category-name"
            />
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Subcategories (comma separated)
            </Label>
            <Textarea
              value={newCategory.subcategories}
              onChange={(e) =>
                setNewCategory({
                  ...newCategory,
                  subcategories: e.target.value,
                })
              }
              placeholder="Sub 1, Sub 2, Sub 3"
              className="bg-black/20 mt-1"
              data-testid="new-category-subcategories"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={onAddCategory} data-testid="add-category-submit-btn">
            Add Category
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};