import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useMemo, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { useGetProductsQuery } from "@/store/api/admin/productApi";

export const AddProductDialog = ({
  open,
  setOpen,
  newProduct,
  setNewProduct,
  onAddProduct,
  isAdding = false,
}) => {
  const { data: products = [], isLoading: isProductsLoading } =
    useGetProductsQuery(undefined, { skip: !open });

  const productOptions = useMemo(
    () => (Array.isArray(products) ? products : []),
    [products],
  );
  const selectedIds = Array.isArray(newProduct.productIds)
    ? newProduct.productIds
    : [];
  const initializedCategoryRef = useRef("");

  useEffect(() => {
    if (!open) {
      initializedCategoryRef.current = "";
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (isProductsLoading) return;

    const categoryName = String(newProduct.category || "").trim();
    if (!categoryName) return;

    if (initializedCategoryRef.current === categoryName) return;

    const preselected = productOptions
      .filter((p) => String(p?.category || "").trim() === categoryName)
      .map((p) => p.id);

    setNewProduct((prev) => ({ ...prev, productIds: preselected }));
    initializedCategoryRef.current = categoryName;
  }, [open, isProductsLoading, newProduct.category, productOptions, setNewProduct]);

  const toggleSelected = (productId) => {
    setNewProduct((prev) => {
      const prevIds = Array.isArray(prev.productIds) ? prev.productIds : [];
      const nextIds = prevIds.includes(productId)
        ? prevIds.filter((id) => id !== productId)
        : [...prevIds, productId];
      return { ...prev, productIds: nextIds };
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">
            Assign Product
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Products
            </Label>
            <div className="mt-1 rounded-sm border border-border bg-black/20">
              <ScrollArea className="h-56">
                {isProductsLoading ? (
                  <div className="p-3 text-sm text-muted-foreground">Loading products...</div>
                ) : productOptions.length === 0 ? (
                  <div className="p-3 text-sm text-muted-foreground">No products available</div>
                ) : (
                  <div className="divide-y divide-border">
                    {productOptions.map((p) => {
                      const checked = selectedIds.includes(p.id);
                      return (
                        <button
                          type="button"
                          key={p.id}
                          className="w-full flex items-center gap-3 p-3 text-left hover:bg-muted/30 transition-colors"
                          onClick={() => toggleSelected(p.id)}
                          data-testid={`assign-product-${p.id}`}
                        >
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSelected(p.id);
                            }}
                          >
                            <Checkbox checked={checked} />
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{p.name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {p.supplierName ? p.supplierName : "Unknown supplier"}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Selected: {selectedIds.length}
            </p>
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Category
            </Label>
            <Input
              value={newProduct.category || ""}
              disabled
              className="bg-black/20 mt-1"
              data-testid="new-product-category"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isAdding}>
            Cancel
          </Button>
          <Button
            onClick={onAddProduct}
            disabled={
              isAdding ||
              selectedIds.length === 0 ||
              !String(newProduct.category || "").trim()
            }
            data-testid="add-product-submit-btn"
          >
            {isAdding ? "Assigning..." : "Assign Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
