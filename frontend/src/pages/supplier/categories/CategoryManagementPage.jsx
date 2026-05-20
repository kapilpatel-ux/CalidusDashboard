import { useMemo, useState } from "react";
import { toast } from "sonner";
import { FolderTree, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/App";
import { suppliers } from "@/data/mockData";
import { useGetSupplierCategoriesQuery, useRequestCategoryMutation } from "@/store/api/supplier/categoryRequestApi";

export const SupplierCategoryManagement = () => {
  const { currentUser } = useAuth();
  const currentSupplier = suppliers[0];
  const supplierId = currentUser?.profileId || currentSupplier.id;

  const { data: categories = [], isLoading } = useGetSupplierCategoriesQuery(supplierId);
  const [requestCategory, { isLoading: isRequesting }] = useRequestCategoryMutation();

  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [requestedName, setRequestedName] = useState("");

  const supplierCategories = useMemo(
    () =>
      (Array.isArray(categories) ? categories : [])
        .map((category) => ({
          id: category?.id,
          name: String(category?.name || "").trim(),
          status: category?.status || "pending",
          requestedAt: category?.requestedAt,
          approvedAt: category?.approvedAt,
        }))
        .filter((category) => category.id && category.name)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [categories],
  );

  const pendingRequests = supplierCategories.filter((category) => category.status === "pending");
  const approvedCategories = supplierCategories.filter((category) => category.status !== "pending");

  const submitRequest = async () => {
    const name = String(requestedName || "").trim();
    if (!name) return;
    try {
      await requestCategory({ supplierId, payload: { name } }).unwrap();
      toast.success("Category request submitted for admin approval");
      setRequestedName("");
      setRequestDialogOpen(false);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to submit category request");
    }
  };

  if (isLoading) return <p>Loading categories...</p>;

  return (
    <div className="space-y-6" data-testid="supplier-category-management">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold font-['Barlow_Condensed'] uppercase tracking-wide mb-1">
            Category Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Categories you request appear here with status until approved by admin.
          </p>
        </div>

        <Button onClick={() => setRequestDialogOpen(true)} data-testid="supplier-request-category-open">
          <Plus className="h-4 w-4 mr-2" />
          Request Category
        </Button>
      </div>

      {pendingRequests.length > 0 && (
        <div className="border border-border rounded-sm overflow-hidden" data-testid="supplier-pending-category-requests">
          <div className="flex items-center justify-between p-4 bg-muted/10">
            <div>
              <h2 className="font-semibold">My Pending Requests</h2>
              <p className="text-xs text-muted-foreground">Waiting for admin approval</p>
            </div>
            <Badge variant="secondary">{pendingRequests.length} pending</Badge>
          </div>
          <div className="divide-y divide-border">
            {pendingRequests.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-4">
                <div className="min-w-0">
                  <p className="font-medium truncate">{category.name}</p>
                  {category.requestedAt && (
                    <p className="text-xs text-muted-foreground">Requested: {category.requestedAt}</p>
                  )}
                </div>
                <Badge className="bg-amber-500/20 text-amber-400">Pending</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4" data-testid="supplier-approved-categories">
        {approvedCategories.length === 0 ? (
          <div className="rounded-sm border border-border bg-muted/10 p-6 text-sm text-muted-foreground">
            No approved categories requested by you yet.
          </div>
        ) : (
          approvedCategories.map((category) => (
            <div key={category.id} className="border border-border rounded-sm overflow-hidden">
              <div className="flex items-center justify-between p-4 bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-sm bg-primary/20 flex items-center justify-center">
                    <FolderTree className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{category.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {category.approvedAt ? `Approved: ${category.approvedAt}` : "Approved"}
                    </p>
                  </div>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-400">Approved</Badge>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">Request New Category</DialogTitle>
            <DialogDescription>
              If you request a category, it will be pending until an admin approves it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Category Name</Label>
            <Input
              value={requestedName}
              onChange={(e) => setRequestedName(e.target.value)}
              placeholder="Enter category name"
              data-testid="supplier-request-category-name"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestDialogOpen(false)} disabled={isRequesting}>
              Cancel
            </Button>
            <Button
              onClick={submitRequest}
              disabled={isRequesting || !String(requestedName || "").trim()}
              data-testid="supplier-request-category-submit"
            >
              {isRequesting ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
