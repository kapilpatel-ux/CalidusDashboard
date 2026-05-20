import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ActionButton, ActionButtonGroup } from "@/components/shared/ActionButton";
import {
  FolderTree,
  Edit,
  Trash2,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetCategoriesForAdminQuery,
  useApproveCategoryMutation,
} from "@/store/api/admin/categoryApi";
import { useGetProductsQuery } from "@/store/api/admin/productApi";
import { useAdminActions } from "../AdminContext";

export const CategoryManagement = ({
  onEdit,
  onAddCategory,
  onAddProduct,
} = {}) => {
  const {
    openEditDialog,
    openAddCategoryDialog,
    openAddProductDialog,
    openConfirmDialog,
  } = useAdminActions();
  const handleEdit = onEdit || ((item) => openEditDialog("category", item));
  const handleAddCategory = onAddCategory || openAddCategoryDialog;
  const handleAddProduct = onAddProduct || openAddProductDialog;

  const { data: categories = [], isLoading } = useGetCategoriesForAdminQuery();
  const { data: products = [] } = useGetProductsQuery();
  const [approveCategory, { isLoading: isApproving }] = useApproveCategoryMutation();

  const productCountByCategory = (Array.isArray(products) ? products : []).reduce(
    (acc, product) => {
      const key = String(product?.category || "").trim();
      if (!key) return acc;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    },
    {}
  );
 
  if (isLoading) return <p>Loading categories...</p>;

  const pendingCategories = categories.filter((category) => category?.status === "pending");
  const approvedCategories = categories.filter((category) => category?.status !== "pending");

  const handleApprove = async (category) => {
    try {
      await approveCategory(category.id).unwrap();
      toast.success(`Category "${category.name}" approved`);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to approve category");
    }
  };
  
  return (
    <div className="space-y-6" data-testid="category-management">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold font-['Barlow_Condensed'] uppercase tracking-wide mb-1">
            Category Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage categories and products
          </p>
        </div>

        <Button onClick={handleAddCategory} data-testid="add-category-btn">
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {pendingCategories.length > 0 && (
        <div className="border border-border rounded-sm overflow-hidden" data-testid="pending-category-requests">
          <div className="flex items-center justify-between p-4 bg-muted/10">
            <div>
              <h2 className="font-semibold">Pending Category Requests</h2>
              <p className="text-xs text-muted-foreground">
                Approve supplier-submitted categories to make them available for products.
              </p>
            </div>
            <Badge variant="secondary">{pendingCategories.length} pending</Badge>
          </div>
          <div className="divide-y divide-border">
            {pendingCategories.map((category) => (
              <div key={category.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="font-medium truncate">{category.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Requested by: {category.requestedBy || "Supplier"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-amber-500/20 text-amber-400">Pending</Badge>
                  <Button
                    size="sm"
                    disabled={isApproving}
                    onClick={() => handleApprove(category)}
                    data-testid={`approve-category-${category.id}`}
                  >
                    Approve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {approvedCategories.map((category) => {
          const productCount =
            productCountByCategory[String(category?.name || "").trim()] || 0;
          return (
            <div
              key={category.id}
              className="border border-border rounded-sm overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-sm bg-primary/20 flex items-center justify-center">
                    <FolderTree className="h-5 w-5 text-primary" />
                  </div>

                  <div>
                    <h3 className="font-medium">{category.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {productCount} products
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant="secondary">
                    {productCount} Products
                  </Badge>

                  <ActionButtonGroup>
                    <ActionButton
                      icon={Plus}
                      label="Assign Product"
                      testId={`add-product-${category.id}`}
                      onClick={() => handleAddProduct(category)}
                    />

                    <ActionButton
                      icon={Edit}
                      label="Edit"
                      testId={`edit-category-${category.id}`}
                      onClick={() => handleEdit(category)}
                    />

                    <ActionButton
                      icon={Trash2}
                      label="Delete"
                      className="text-red-400 hover:text-red-300"
                      testId={`delete-category-${category.id}`}
                      onClick={() =>
                        openConfirmDialog(
                          "delete-category",
                          category,
                          `Delete category "${category.name}"?`
                        )
                      }
                    />
                  </ActionButtonGroup>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
