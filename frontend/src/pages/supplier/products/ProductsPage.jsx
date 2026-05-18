import { useState } from "react";
import { toast } from "sonner";
import { Edit, Eye, Package, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DataTable } from "@/components/shared/DataTable";
import { ActionButton, ActionButtonGroup } from "@/components/shared/ActionButton";
import { RatingStars } from "@/components/shared/RatingStars";
import { currentSupplier } from "@/data/mockData";
import {
  useDeleteSupplierProductMutation,
  useGetSupplierProductsQuery,
  useUpdateSupplierProductMutation,
} from "@/store/api/supplier/supplierProductApi";

const emptyEditForm = {
  name: "",
  category: "",
  subcategory: "",
  shortDescription: "",
  description: "",
  leadTime: "",
  countryOfOrigin: "",
  technicalSpecs: "",
};

export const SupplierProducts = () => {
  const supplierId = currentSupplier.id;
  const { data: products = [], isLoading, isError } = useGetSupplierProductsQuery(supplierId);
  const [updateSupplierProduct, { isLoading: isSaving }] = useUpdateSupplierProductMutation();
  const [deleteSupplierProduct, { isLoading: isDeleting }] = useDeleteSupplierProductMutation();
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewSheet, setViewSheet] = useState({ open: false, product: null });
  const [editDialog, setEditDialog] = useState({ open: false, product: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, product: null });
  const [editForm, setEditForm] = useState(emptyEditForm);

  const getProductId = (product) => product?.id || product?._id;

  const openEditDialog = (product) => {
    setEditForm({
      name: product.name || "",
      category: product.category || "",
      subcategory: product.subcategory || "",
      shortDescription: product.shortDescription || "",
      description: product.description || "",
      leadTime: product.leadTime || "",
      countryOfOrigin: product.countryOfOrigin || "",
      technicalSpecs: product.technicalSpecs || "",
    });
    setEditDialog({ open: true, product });
  };

  const saveProduct = async () => {
    const productId = getProductId(editDialog.product);
    if (!productId) {
      toast.error("Product id missing");
      return;
    }

    const payload = { ...editForm };

    try {
      const updatedProduct = await updateSupplierProduct({
        supplierId,
        productId,
        payload,
      }).unwrap();
      setEditDialog({ open: false, product: null });
      toast.success(`Product "${updatedProduct.name}" updated`);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update product");
    }
  };

  const deleteProduct = async (product) => {
    const productId = getProductId(product);
    if (!productId) {
      toast.error("Product id missing");
      return;
    }

    try {
      await deleteSupplierProduct({ supplierId, productId }).unwrap();
      setDeleteDialog({ open: false, product: null });
      toast.success(`Product "${product.name}" deleted`);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete product");
    }
  };

  const filteredProducts = statusFilter === "all" ? products : products.filter((product) => product.status === statusFilter);

  const columns = [
    {
      key: "name",
      label: "Product Name",
      render: (value, row) => (
        <div className="flex items-center gap-3">
          {row.image ? (
            <img src={row.image} alt={value} className="h-10 w-14 rounded-sm object-cover bg-muted" />
          ) : (
            <div className="h-10 w-14 rounded-sm bg-primary/10 flex items-center justify-center">
              <Package className="h-4 w-4 text-primary" />
            </div>
          )}
          <div>
            <p className="font-medium">{value}</p>
            <p className="text-xs text-muted-foreground">{row.subcategory}</p>
          </div>
        </div>
      ),
    },
    { key: "category", label: "Category" },
    { key: "rating", label: "Rating", render: (value) => value > 0 ? <RatingStars rating={value} size="sm" /> : <span className="text-xs text-muted-foreground">No ratings</span> },
    { key: "status", label: "Status", render: (value) => <StatusBadge status={value} /> },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <ActionButtonGroup>
          <ActionButton icon={Eye} label="View" testId={`view-product-${getProductId(row)}`} onClick={() => setViewSheet({ open: true, product: row })} />
          <ActionButton icon={Edit} label="Edit" testId={`edit-product-${getProductId(row)}`} onClick={() => openEditDialog(row)} />
          <ActionButton
            icon={Trash2}
            label="Delete"
            className="text-red-400 hover:text-red-300"
            testId={`delete-product-${getProductId(row)}`}
            onClick={() => setDeleteDialog({ open: true, product: row })}
          />
        </ActionButtonGroup>
      ),
    },
  ];

  const detailProduct = viewSheet.product;

  return (
    <div className="space-y-6" data-testid="supplier-product-management">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold font-['Barlow_Condensed'] uppercase tracking-wide mb-1">Product Management</h1>
          <p className="text-sm text-muted-foreground">Manage your product listings</p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px] bg-black/20" data-testid="product-status-filter">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {isLoading ? (
        <div className="dashboard-card">
          <div className="dashboard-card-content py-8 text-center text-sm text-muted-foreground">
            Loading products...
          </div>
        </div>
      ) : isError ? (
        <div className="dashboard-card">
          <div className="dashboard-card-content py-8 text-center text-sm text-destructive">
            Unable to load products.
          </div>
        </div>
      ) : (
        <DataTable columns={columns} data={filteredProducts} searchPlaceholder="Search products..." searchKey="name" pageSize={5} testId="supplier-products-table" />
      )}

      <Sheet open={viewSheet.open} onOpenChange={(open) => setViewSheet({ open, product: open ? viewSheet.product : null })}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">Product Details</SheetTitle>
            <SheetDescription>Complete product listing information</SheetDescription>
          </SheetHeader>

          {detailProduct && (
            <div className="mt-6 space-y-6">
              {detailProduct.image ? (
                <img src={detailProduct.image} alt={detailProduct.name} className="h-48 w-full rounded-md object-cover bg-muted" />
              ) : (
                <div className="h-48 w-full rounded-md bg-primary/10 flex items-center justify-center">
                  <Package className="h-10 w-10 text-primary" />
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold">{detailProduct.name}</h2>
                    <p className="text-sm text-muted-foreground">{detailProduct.category} / {detailProduct.subcategory || "Uncategorized"}</p>
                  </div>
                  <StatusBadge status={detailProduct.status} />
                </div>
                {detailProduct.rating > 0 ? <RatingStars rating={detailProduct.rating} size="sm" /> : <p className="text-xs text-muted-foreground">No ratings yet</p>}
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Description</p>
                <p className="mt-1 text-sm leading-6">{detailProduct.description || detailProduct.shortDescription || "No description available."}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Supplier</p>
                  <p className="mt-1 font-medium">{detailProduct.supplierName || currentSupplier.name}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Price</p>
                  <p className="mt-1 font-medium">{detailProduct.price || "RFQ"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Lead Time</p>
                  <p className="mt-1 font-medium">{detailProduct.leadTime || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Country</p>
                  <p className="mt-1 font-medium">{detailProduct.countryOfOrigin || "Not specified"}</p>
                </div>
              </div>

              {Array.isArray(detailProduct.specifications) && detailProduct.specifications.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Specifications</p>
                  <div className="mt-2 space-y-2">
                    {detailProduct.specifications.map((specification) => (
                      <p key={specification} className="rounded-sm border border-border bg-black/20 px-3 py-2 text-sm">
                        {specification}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {detailProduct.technicalSpecs && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Technical Specs</p>
                  <p className="mt-1 text-sm leading-6">{detailProduct.technicalSpecs}</p>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ open, product: open ? editDialog.product : null })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">Edit Product</DialogTitle>
            <DialogDescription>Changes to an approved listing will move it back to pending review.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="supplier-product-name">Product Name</Label>
              <Input id="supplier-product-name" value={editForm.name} onChange={(event) => setEditForm({ ...editForm, name: event.target.value })} className="bg-black/20" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="supplier-product-category">Category</Label>
                <Input id="supplier-product-category" value={editForm.category} onChange={(event) => setEditForm({ ...editForm, category: event.target.value })} className="bg-black/20" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier-product-subcategory">Subcategory</Label>
                <Input id="supplier-product-subcategory" value={editForm.subcategory} onChange={(event) => setEditForm({ ...editForm, subcategory: event.target.value })} className="bg-black/20" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier-product-short-description">Short Description</Label>
              <Input
                id="supplier-product-short-description"
                value={editForm.shortDescription}
                onChange={(event) => setEditForm({ ...editForm, shortDescription: event.target.value })}
                className="bg-black/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier-product-description">Description</Label>
              <Textarea
                id="supplier-product-description"
                value={editForm.description}
                onChange={(event) => setEditForm({ ...editForm, description: event.target.value })}
                className="min-h-24 bg-black/20"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="supplier-product-lead-time">Lead Time</Label>
                <Input id="supplier-product-lead-time" value={editForm.leadTime} onChange={(event) => setEditForm({ ...editForm, leadTime: event.target.value })} className="bg-black/20" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier-product-origin">Country of Origin</Label>
                <Input id="supplier-product-origin" value={editForm.countryOfOrigin} onChange={(event) => setEditForm({ ...editForm, countryOfOrigin: event.target.value })} className="bg-black/20" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier-product-technical-specs">Technical Specs</Label>
              <Textarea
                id="supplier-product-technical-specs"
                value={editForm.technicalSpecs}
                onChange={(event) => setEditForm({ ...editForm, technicalSpecs: event.target.value })}
                className="min-h-20 bg-black/20"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog({ open: false, product: null })} disabled={isSaving}>Cancel</Button>
            <Button onClick={saveProduct} disabled={isSaving || !editForm.name.trim()} data-testid="supplier-edit-product-save">
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, product: open ? deleteDialog.product : null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">Delete Product</DialogTitle>
            <DialogDescription>
              Delete "{deleteDialog.product?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, product: null })} disabled={isDeleting}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteProduct(deleteDialog.product)} disabled={isDeleting} data-testid="supplier-delete-product-confirm">
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
