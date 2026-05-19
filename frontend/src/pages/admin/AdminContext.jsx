import { createContext, useContext, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { toast } from "sonner";
import { getBuyerDetails } from "./utils/helpers";
import { ConfirmDialog } from "./dialogs/ConfirmDialog";
import { EditProductDialog } from "./dialogs/EditProductDialog";
import { EditCategoryDialog } from "./dialogs/EditCategoryDialog";
import { AddCategoryDialog } from "./dialogs/AddCategoryDialog";
import { AddSubcategoryDialog } from "./dialogs/AddSubcategoryDialog";
import { useAdminDialogs } from "./hooks/useAdminDialogs";
import { useViewSheet } from "./hooks/useViewSheet";
import { SupplierDetailSheet } from "./sheets/SupplierDetailSheet";
import { ProductDetailSheet } from "./sheets/ProductDetailSheet";
import { RatingDetailSheet } from "./sheets/RatingDetailSheet";
import { BuyerDetailSheet } from "./sheets/BuyerDetailSheet";
import { store } from "@/store/store";
import { ratingApi } from "@/store/api/admin/ratingApi";
import { productApi } from "@/store/api/admin/productApi";
import { categoryApi, useCreateCategoryMutation } from "@/store/api/admin/categoryApi";
import { supplierApi } from "@/lib/api";
import { buyerApi } from "@/store/api/admin/buyerApi";

const AdminActionsContext = createContext({
  openConfirmDialog: () => {},
  openEditDialog: () => {},
  openViewSheet: () => {},
  openBuyerSheet: () => {},
  openAddCategoryDialog: () => {},
  openAddSubcategoryDialog: () => {},
});

export const useAdminActions = () => useContext(AdminActionsContext);

export const AdminProvider = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [buyersData, setBuyersData] = useState([]);
  const [ratingsData, setRatingsData] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);
  const [createCategory, { isLoading: isCreatingCategory }] = useCreateCategoryMutation();

  const {
    confirmDialog,
    setConfirmDialog,
    editDialog,
    setEditDialog,
    addCategoryDialog,
    setAddCategoryDialog,
    addSubcategoryDialog,
    setAddSubcategoryDialog,
    newCategory,
    setNewCategory,
    newSubcategory,
    setNewSubcategory,
    editForm,
    setEditForm,
  } = useAdminDialogs();

  const {
    viewSheet,
    setViewSheet,
    openViewSheet,
  } = useViewSheet();

  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        const apiSuppliers = await supplierApi.list();
        if (Array.isArray(apiSuppliers) && apiSuppliers.length > 0) {
          setSuppliers(apiSuppliers);
        }
      } catch (error) {
        console.error("Failed to load suppliers from backend:", error);
      }
    };

    loadSuppliers();
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const apiProducts = await productApi.list();
        if (Array.isArray(apiProducts) && apiProducts.length > 0) {
          setProducts(apiProducts);
        }
      } catch (error) {
        console.error("Failed to load products from backend:", error);
      }
    };

    loadProducts();
  }, []);

  const openConfirmDialog = (type, item, message) => {
    setConfirmDialog({ open: true, type, item, message });
  };

  const handleConfirmAction = async () => {
    const { type, item } = confirmDialog;

    try {
      switch (type) {
        case "approve-supplier":
          await supplierApi.updateStatus(item.id, "active");
          setSuppliers((prev) => prev.map((s) => s.id === item.id ? { ...s, status: "active" } : s));
          toast.success(`Supplier "${item.name}" approved successfully`);
          break;
        case "reject-supplier":
          await supplierApi.updateStatus(item.id, "rejected");
          setSuppliers((prev) => prev.map((s) => s.id === item.id ? { ...s, status: "rejected" } : s));
          toast.error(`Supplier "${item.name}" rejected`);
          break;
        case "suspend-supplier":
          await supplierApi.updateStatus(item.id, "suspended");
          setSuppliers((prev) => prev.map((s) => s.id === item.id ? { ...s, status: "suspended" } : s));
          toast.warning(`Supplier "${item.name}" suspended`);
          break;
        case "delete-supplier":
          await supplierApi.remove(item.id);
          setSuppliers((prev) => prev.filter((s) => s.id !== item.id));
          toast.success(`Supplier "${item.name}" deleted`);
          break;
        case "approve-product":
          await store.dispatch(
            productApi.endpoints.updateProductStatus.initiate({
              id: item.id,
              status: "approved",
            })
          ).unwrap();
          setProducts((prev) => prev.map((p) => p.id === item.id ? { ...p, status: "approved" } : p));
          toast.success(`Product "${item.name}" approved`);
          break;
        case "reject-product":
          await store.dispatch(
            productApi.endpoints.updateProductStatus.initiate({
              id: item.id,
              status: "rejected",
            })
          ).unwrap();
          setProducts((prev) => prev.map((p) => p.id === item.id ? { ...p, status: "rejected" } : p));
          toast.error(`Product "${item.name}" rejected`);
          break;
        case "delete-product":
          await store.dispatch(productApi.endpoints.deleteProduct.initiate(item.id)).unwrap();
          setProducts((prev) => prev.filter((p) => p.id !== item.id));
          toast.success(`Product "${item.name}" deleted`);
          break;
        case "suspend-product":
          await store.dispatch(
            productApi.endpoints.updateProductStatus.initiate({
              id: item.id,
              status: "suspended",
            })
          ).unwrap();
          setProducts((prev) => prev.map((p) => p.id === item.id ? { ...p, status: "suspended" } : p));
          toast.warning(`Product "${item.name}" suspended`);
          break;
        case "approve-rating":
          await store.dispatch(
            ratingApi.endpoints.updateRatingStatus.initiate({
              id: item.id,
              status: "approved",
            })
          ).unwrap();
          setRatingsData((prev) => prev.map((r) => r.id === item.id ? { ...r, status: "approved" } : r));
          toast.success("Rating approved and now visible");
          break;
        case "reject-rating":
          await store.dispatch(
            ratingApi.endpoints.updateRatingStatus.initiate({
              id: item.id,
              status: "rejected",
            })
          ).unwrap();
          setRatingsData((prev) => prev.map((r) => r.id === item.id ? { ...r, status: "rejected" } : r));
          toast.error("Rating rejected and hidden");
          break;
        case "suspend-rating":
          await store.dispatch(
            ratingApi.endpoints.updateRatingStatus.initiate({
              id: item.id,
              status: "suspended",
            })
          ).unwrap();
          toast.warning(`Rating for "${item.productName}" suspended`);
          break;
        case "remove-rating":
          await store.dispatch(ratingApi.endpoints.deleteRating.initiate(item.id)).unwrap();
          setRatingsData((prev) => prev.filter((r) => r.id !== item.id));
          toast.success("Rating removed");
          break;
        case "approve-reply":
          await store.dispatch(
            ratingApi.endpoints.updateReplyStatus.initiate({
              id: item.id,
              status: "approved",
            })
          ).unwrap();
          setRatingsData((prev) => prev.map((r) => r.id === item.id ? { ...r, replyStatus: "approved", supplierReplyStatus: "approved" } : r));
          toast.success("Supplier reply approved and now visible");
          break;
        case "reject-reply":
          await store.dispatch(
            ratingApi.endpoints.updateReplyStatus.initiate({
              id: item.id,
              status: "rejected",
            })
          ).unwrap();
          setRatingsData((prev) => prev.map((r) => r.id === item.id ? { ...r, replyStatus: "rejected", supplierReplyStatus: "rejected" } : r));
          toast.error("Supplier reply rejected");
          break;
        case "suspend-buyer":
          await store.dispatch(
            buyerApi.endpoints.updateBuyerStatus.initiate({
              id: item.id,
              status: "suspended",
            })
          ).unwrap();
          toast.warning(`Buyer "${item.name}" suspended`);
          break;
        case "activate-buyer":
          await store.dispatch(
            buyerApi.endpoints.updateBuyerStatus.initiate({
              id: item.id,
              status: "active",
            })
          ).unwrap();
          toast.success(`Buyer "${item.name}" activated`);
          break;
        case "delete-buyer":
          await store.dispatch(
            buyerApi.endpoints.deleteBuyer.initiate(item.id)
          ).unwrap();
          toast.success(`Buyer "${item.name}" deleted`);
          break;
        case "delete-category":
          await store.dispatch(
            categoryApi.endpoints.deleteCategory.initiate(item.id)
          ).unwrap();
          toast.success(`Category "${item.name}" deleted`);
          break;
        case "delete-subcategory":
          await store.dispatch(
            categoryApi.endpoints.deleteSubcategory.initiate({
              categoryId: item.categoryId,
              subcategoryId: item.subcategoryId,
            })
          ).unwrap();
          toast.success(`Subcategory "${item.name}" deleted`);
          break;
        default:
          break;
      }
    } catch (error) {
      toast.error(error?.data?.message || error.message || "Operation failed");
    }

    setConfirmDialog({ open: false, type: "", item: null, message: "" });
  };

  const openEditDialog = (type, item) => {
    setEditForm({ ...item });
    setEditDialog({ open: true, type, item });
  };

  const handleEditSave = async () => {
    const { type } = editDialog;

    switch (type) {
      case "product":
        try {
          const updatedProduct = await store.dispatch(
            productApi.endpoints.updateProduct.initiate({
              id: editForm.id,
              payload: editForm,
            })
          ).unwrap();
          setProducts((prev) => prev.map((p) => p.id === editForm.id ? { ...updatedProduct } : p));
          toast.success(`Product "${editForm.name}" updated`);
        } catch (error) {
          toast.error(error.message || "Failed to update product");
          return;
        }
        break;
      case "category":
        await store.dispatch(
          categoryApi.endpoints.updateCategory.initiate({
            id: editForm.id,
            payload: editForm,
          })
        ).unwrap();
        toast.success(`Category "${editForm.name}" updated`);
        break;
      case "subcategory":
        await store.dispatch(
          categoryApi.endpoints.updateSubcategory.initiate({
            categoryId: editForm.categoryId,
            subcategoryId: editForm.id,
            payload: editForm,
          })
        ).unwrap();
        toast.success(`Subcategory "${editForm.name}" updated`);
        break;
      default:
        break;
    }

    setEditDialog({ open: false, type: "", item: null });
  };

  const handleAddCategory = async () => {
    if (newCategory.name.trim()) {
      const payload = {
        name: newCategory.name,
        subcategories: newCategory.subcategories
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .map((name) => ({ name })),
        productCount: 0,
      };

      try {
        const created = await createCategory(payload).unwrap();
        setCategoriesData((prev) => [...prev, created]);
        toast.success(`Category "${newCategory.name}" added`);
        setNewCategory({ name: "", subcategories: "" });
        setAddCategoryDialog(false);
      } catch (error) {
        toast.error(error?.data?.message || error?.message || "Failed to add category");
      }
    }
  };

  const handleAddSubcategory = async () => {
    if (newSubcategory.trim() && addSubcategoryDialog.category) {
      const category = addSubcategoryDialog.category;

      await store.dispatch(
        categoryApi.endpoints.updateCategory.initiate({
          id: category.id,
          payload: {
            ...category,
            subcategories: [
              ...(category.subcategories || []),
              { name: newSubcategory },
            ],
          },
        })
      ).unwrap();

      toast.success(`Subcategory "${newSubcategory}" added to ${category.name}`);
      setNewSubcategory("");
      setAddSubcategoryDialog({ open: false, category: null });
    }
  };

  const handleViewSupplier = (supplier) => {
    setViewSheet({ open: false, type: "", item: null });
    setTimeout(() => {
      openViewSheet("supplier", supplier);
    }, 100);
  };

  const actions = {
    openConfirmDialog,
    openEditDialog,
    openViewSheet,
    openBuyerSheet: (item) => openViewSheet("buyer", item),
    openAddCategoryDialog: () => setAddCategoryDialog(true),
    openAddSubcategoryDialog: (category) => setAddSubcategoryDialog({ open: true, category }),
  };

  return (
    <AdminActionsContext.Provider value={actions}>
      <Outlet />

      <ConfirmDialog
        confirmDialog={confirmDialog}
        setConfirmDialog={setConfirmDialog}
        onConfirm={handleConfirmAction}
      />

      <EditProductDialog
        editDialog={editDialog}
        setEditDialog={setEditDialog}
        editForm={editForm}
        setEditForm={setEditForm}
        onSave={handleEditSave}
      />

      <EditCategoryDialog
        editDialog={editDialog}
        setEditDialog={setEditDialog}
        editForm={editForm}
        setEditForm={setEditForm}
        onSave={handleEditSave}
      />

      <AddCategoryDialog
        open={addCategoryDialog}
        setOpen={setAddCategoryDialog}
        newCategory={newCategory}
        setNewCategory={setNewCategory}
        onAddCategory={handleAddCategory}
        isAdding={isCreatingCategory}
      />

      <AddSubcategoryDialog
        addSubcategoryDialog={addSubcategoryDialog}
        setAddSubcategoryDialog={setAddSubcategoryDialog}
        newSubcategory={newSubcategory}
        setNewSubcategory={setNewSubcategory}
        onAddSubcategory={handleAddSubcategory}
      />

      <SupplierDetailSheet
        viewSheet={viewSheet}
        setViewSheet={setViewSheet}
      />

      <ProductDetailSheet
        viewSheet={viewSheet}
        setViewSheet={setViewSheet}
        handleViewSupplier={handleViewSupplier}
      />

      <RatingDetailSheet
        viewSheet={viewSheet}
        setViewSheet={setViewSheet}
      />

      <BuyerDetailSheet
        viewSheet={viewSheet}
        setViewSheet={setViewSheet}
      />
    </AdminActionsContext.Provider>
  );
};
