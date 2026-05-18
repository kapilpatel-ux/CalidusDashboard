import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ActionButton, ActionButtonGroup } from "@/components/shared/ActionButton";
import {
  FolderTree,
  ChevronDown,
  ChevronRight,
  Edit,
  Trash2,
  Plus,
} from "lucide-react";
import {
  useGetCategoriesQuery,
  useDeleteCategoryMutation,
  useDeleteSubcategoryMutation,
} from "@/store/api/admin/categoryApi";
import { useAdminActions } from "../AdminContext";

export const CategoryManagement = ({
  onEdit,
  onEditSubcategory,
  onAddCategory,
  onAddSubcategory,
} = {}) => {
  const {
    openEditDialog,
    openAddCategoryDialog,
    openAddSubcategoryDialog,
    openConfirmDialog,
  } = useAdminActions();
  const handleEdit = onEdit || ((item) => openEditDialog("category", item));
  const handleEditSubcategory = onEditSubcategory || ((item) => openEditDialog("subcategory", item));
  const handleAddCategory = onAddCategory || openAddCategoryDialog;
  const handleAddSubcategory = onAddSubcategory || openAddSubcategoryDialog;

  const { data: categories = [], isLoading } = useGetCategoriesQuery();
 
  const [deleteCategory] = useDeleteCategoryMutation();
  const [deleteSubcategory] = useDeleteSubcategoryMutation();

  const [expandedCategories, setExpandedCategories] = useState([]);

  const toggleCategory = (categoryId) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  if (isLoading) return <p>Loading categories...</p>;
  
  return (
    <div className="space-y-6" data-testid="category-management">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold font-['Barlow_Condensed'] uppercase tracking-wide mb-1">
            Category Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage categories and subcategories
          </p>
        </div>

        <Button onClick={handleAddCategory} data-testid="add-category-btn">
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      <div className="space-y-4">
        {categories.map((category) => {
          const isExpanded = expandedCategories.includes(category.id);

          return (
            <div
              key={category.id}
              className="border border-border rounded-sm overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 bg-muted/20">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>

                  <div className="h-10 w-10 rounded-sm bg-primary/20 flex items-center justify-center">
                    <FolderTree className="h-5 w-5 text-primary" />
                  </div>

                  <div>
                    <h3 className="font-medium">{category.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {category.subcategories?.length || 0} subcategories •{" "}
                      {category.productCount || 0} products
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant="secondary">
                    {category.subcategories?.length || 0} Subs
                  </Badge>

                  <ActionButtonGroup>
                    <ActionButton
                      icon={Plus}
                      label="Add Subcategory"
                      testId={`add-subcategory-${category.id}`}
                      onClick={() => handleAddSubcategory(category)}
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

              {isExpanded && (
                <div className="p-4 border-t border-border bg-background">
                  {category.subcategories?.length > 0 ? (
                    <div className="space-y-2">
                      {category.subcategories.map((subcategory) => (
                        <div
                          key={subcategory.id}
                          className="flex items-center justify-between p-3 rounded-sm bg-muted/20"
                        >
                          <div>
                            <p className="font-medium text-sm">
                              {subcategory.name}
                            </p>
                          </div>

                          <ActionButtonGroup>
                            <ActionButton
                              icon={Edit}
                              label="Edit"
                              testId={`edit-subcategory-${subcategory.id}`}
                              onClick={() =>
                                handleEditSubcategory({
                                  ...subcategory,
                                  categoryId: category.id,
                                })
                              }
                            />

                            <ActionButton
                              icon={Trash2}
                              label="Delete"
                              className="text-red-400 hover:text-red-300"
                              testId={`delete-subcategory-${subcategory.id}`}
                              onClick={() =>
                                openConfirmDialog(
                                  "delete-subcategory",
                                  {
                                    categoryId: category.id,
                                    subcategoryId: subcategory.id,
                                    name: subcategory.name,
                                  },
                                  `Delete subcategory "${subcategory.name}"?`
                                )
                              }
                            />
                          </ActionButtonGroup>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No subcategories available
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
