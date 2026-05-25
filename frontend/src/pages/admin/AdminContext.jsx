import { createContext, useContext, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { toast } from "sonner";
import { getBuyerDetails } from "./utils/helpers";
import { ConfirmDialog } from "./dialogs/ConfirmDialog";
import { EditProductDialog } from "./dialogs/EditProductDialog";
import { EditCategoryDialog } from "./dialogs/EditCategoryDialog";
import { EditUserDialog } from "./dialogs/EditUserDialog";
import { EditRoleDialog } from "./dialogs/EditRoleDialog";
import { EditPermissionDialog } from "./dialogs/EditPermissionDialog";
import { AddCategoryDialog } from "./dialogs/AddCategoryDialog";
import { AddProductDialog } from "./dialogs/AddProductDialog";
import { AddUserDialog } from "./dialogs/AddUserDialog";
import { AddRoleDialog } from "./dialogs/AddRoleDialog";
import { AddPermissionDialog } from "./dialogs/AddPermissionDialog";
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
import { supplierApi as supplierRtkApi } from "@/store/api/admin/supplierApi";
import { buyerApi } from "@/store/api/admin/buyerApi";
import { userApi } from "@/store/api/admin/userApi";
import { roleApi } from "@/store/api/admin/roleApi";
import { permissionApi } from "@/store/api/admin/permissionApi";
import { buyerRatingApi } from "@/store/api/buyer/buyerRatingApi";

const invalidateBuyerRatingCache = () => {
  store.dispatch(buyerRatingApi.util.invalidateTags(["BuyerRating"]));
};

const AdminActionsContext = createContext({
  openConfirmDialog: () => {},
  openEditDialog: () => {},
  openViewSheet: () => {},
  openBuyerSheet: () => {},
  openAddCategoryDialog: () => {},
  openAddUserDialog: () => {},
  openAddRoleDialog: () => {},
  openAddPermissionDialog: () => {},
  openAddProductDialog: () => {},
});

export const useAdminActions = () => useContext(AdminActionsContext);

export const AdminProvider = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [buyersData, setBuyersData] = useState([]);
  const [ratingsData, setRatingsData] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);
  const [createCategory, { isLoading: isCreatingCategory }] = useCreateCategoryMutation();
  const [isAssigningProducts, setIsAssigningProducts] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [isCreatingPermission, setIsCreatingPermission] = useState(false);
  const [isUpdatingPermission, setIsUpdatingPermission] = useState(false);

  const {
    confirmDialog,
    setConfirmDialog,
    editDialog,
    setEditDialog,
    addCategoryDialog,
    setAddCategoryDialog,
    addUserDialog,
    setAddUserDialog,
    addRoleDialog,
    setAddRoleDialog,
    addPermissionDialog,
    setAddPermissionDialog,
    newCategory,
    setNewCategory,
    newUser,
    setNewUser,
    newRole,
    setNewRole,
    newPermission,
    setNewPermission,
    addProductDialog,
    setAddProductDialog,
    newProduct,
    setNewProduct,
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
        const apiSuppliers = await store
          .dispatch(
            supplierRtkApi.endpoints.getSuppliers.initiate(undefined, {
              forceRefetch: true,
            })
          )
          .unwrap();
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
          await store.dispatch(
            supplierRtkApi.endpoints.updateSupplierStatus.initiate({
              id: item.id,
              status: "active",
            })
          ).unwrap();
          setSuppliers((prev) => prev.map((s) => s.id === item.id ? { ...s, status: "active" } : s));
          toast.success(`Supplier "${item.name}" approved successfully`);
          break;
        case "reject-supplier":
          await store.dispatch(
            supplierRtkApi.endpoints.updateSupplierStatus.initiate({
              id: item.id,
              status: "rejected",
            })
          ).unwrap();
          setSuppliers((prev) => prev.map((s) => s.id === item.id ? { ...s, status: "rejected" } : s));
          toast.error(`Supplier "${item.name}" rejected`);
          break;
        case "suspend-supplier":
          await store.dispatch(
            supplierRtkApi.endpoints.updateSupplierStatus.initiate({
              id: item.id,
              status: "suspended",
            })
          ).unwrap();
          setSuppliers((prev) => prev.map((s) => s.id === item.id ? { ...s, status: "suspended" } : s));
          toast.warning(`Supplier "${item.name}" suspended`);
          break;
        case "delete-supplier":
          await store.dispatch(
            supplierRtkApi.endpoints.deleteSupplier.initiate(item.id)
          ).unwrap();
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
          invalidateBuyerRatingCache();
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
          invalidateBuyerRatingCache();
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
          invalidateBuyerRatingCache();
          toast.warning(`Rating for "${item.productName}" suspended`);
          break;
        case "remove-rating":
          await store.dispatch(ratingApi.endpoints.deleteRating.initiate(item.id)).unwrap();
          invalidateBuyerRatingCache();
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
        case "approve-buyer":
          await store.dispatch(
            buyerApi.endpoints.updateBuyerStatus.initiate({
              id: item.id,
              status: "active",
            })
          ).unwrap();
          toast.success(`Buyer "${item.name}" approved`);
          break;
        case "reject-buyer":
          await store.dispatch(
            buyerApi.endpoints.updateBuyerStatus.initiate({
              id: item.id,
              status: "rejected",
            })
          ).unwrap();
          toast.error(`Buyer "${item.name}" rejected`);
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
        case "suspend-user":
          await store.dispatch(
            userApi.endpoints.updateUserStatus.initiate({
              id: item.id,
              status: "suspended",
            })
          ).unwrap();
          toast.warning(`User "${item.name || item.email}" suspended`);
          break;
        case "activate-user":
          await store.dispatch(
            userApi.endpoints.updateUserStatus.initiate({
              id: item.id,
              status: "active",
            })
          ).unwrap();
          toast.success(`User "${item.name || item.email}" activated`);
          break;
        case "delete-role":
          await store.dispatch(roleApi.endpoints.deleteAdminRole.initiate(item.key)).unwrap();
          toast.success(`Role "${item.label}" deleted`);
          break;
        case "delete-permission":
          await store.dispatch(permissionApi.endpoints.deleteAdminPermission.initiate(item.key)).unwrap();
          toast.success(`Permission "${item.label}" deleted`);
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
      case "user":
        try {
          await store
            .dispatch(
              userApi.endpoints.updateUser.initiate({
                id: editForm.id,
                payload: {
                  name: editForm.name,
                  email: editForm.email,
                  role: editForm.role,
                },
              })
            )
            .unwrap();
          toast.success(`User "${editForm.name || editForm.email}" updated`);
        } catch (error) {
          toast.error(error?.data?.message || error?.message || "Failed to update user");
          return;
        }
        break;
      case "role":
        try {
          setIsUpdatingRole(true);
          await store
            .dispatch(
              roleApi.endpoints.updateAdminRole.initiate({
                key: editForm.key,
                payload: { label: editForm.label },
              })
            )
            .unwrap();
          toast.success(`Role "${editForm.label}" updated`);
        } catch (error) {
          toast.error(error?.data?.message || error?.message || "Failed to update role");
          return;
        } finally {
          setIsUpdatingRole(false);
        }
        break;
      case "permission":
        try {
          setIsUpdatingPermission(true);
          await store
            .dispatch(
              permissionApi.endpoints.updateAdminPermission.initiate({
                key: editForm.key,
                payload: { label: editForm.label, group: editForm.group },
              })
            )
            .unwrap();
          toast.success(`Permission "${editForm.label}" updated`);
        } catch (error) {
          toast.error(error?.data?.message || error?.message || "Failed to update permission");
          return;
        } finally {
          setIsUpdatingPermission(false);
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
        subcategories: [],
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

  const handleAddUser = async () => {
    const payload = {
      name: String(newUser.name || "").trim(),
      email: String(newUser.email || "").trim(),
      phone: String(newUser.phone || "").trim(),
      password: String(newUser.password || ""),
      role: String(newUser.role || "").trim(),
    };

    if (!payload.name || !payload.email || !payload.phone || !payload.password || !payload.role) return;

    try {
      setIsCreatingUser(true);
      await store.dispatch(userApi.endpoints.createUser.initiate(payload)).unwrap();
      toast.success(`User "${payload.name}" created`);
      setAddUserDialog(false);
      setNewUser({ name: "", email: "", phone: "", password: "", role: "" });
    } catch (error) {
      toast.error(error?.data?.message || error?.message || "Failed to create user");
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleAddRole = async () => {
    const label = String(newRole.label || "").trim();
    if (!label) return;

    try {
      setIsCreatingRole(true);
      await store.dispatch(roleApi.endpoints.createAdminRole.initiate({ label })).unwrap();
      toast.success(`Role "${label}" created`);
      setAddRoleDialog(false);
      setNewRole({ label: "" });
    } catch (error) {
      toast.error(error?.data?.message || error?.message || "Failed to create role");
    } finally {
      setIsCreatingRole(false);
    }
  };

  const handleAddPermission = async () => {
    const label = String(newPermission.label || "").trim();
    const group = String(newPermission.group || "").trim();
    if (!label) return;

    try {
      setIsCreatingPermission(true);
      await store
        .dispatch(
          permissionApi.endpoints.createAdminPermission.initiate({
            label,
            ...(group ? { group } : {}),
          })
        )
        .unwrap();
      toast.success(`Permission "${label}" created`);
      setAddPermissionDialog(false);
      setNewPermission({ label: "", group: "" });
    } catch (error) {
      toast.error(error?.data?.message || error?.message || "Failed to create permission");
    } finally {
      setIsCreatingPermission(false);
    }
  };

  const handleAddProduct = async () => {
    const categoryName = newProduct.category?.trim();
    const productIds = Array.isArray(newProduct.productIds) ? newProduct.productIds : [];
    if (!categoryName || productIds.length === 0) return;

    setIsAssigningProducts(true);
    try {
      await Promise.all(
        productIds.map((id) =>
          store
            .dispatch(
              productApi.endpoints.updateProduct.initiate({
                id,
                payload: { category: categoryName },
              })
            )
            .unwrap()
        )
      );
      store.dispatch(
        productApi.util.updateQueryData("getProducts", undefined, (draft) => {
          if (!Array.isArray(draft)) return;
          for (const id of productIds) {
            const product = draft.find((p) => p?.id === id);
            if (product) product.category = categoryName;
          }
        })
      );
      toast.success(`${productIds.length} product(s) assigned to category`);
      setAddProductDialog({ open: false, category: null });
      setNewProduct({ productIds: [], category: "" });
    } catch (error) {
      toast.error(error?.data?.message || error?.message || "Failed to assign products");
    } finally {
      setIsAssigningProducts(false);
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
    openAddUserDialog: () => setAddUserDialog(true),
    openAddRoleDialog: () => setAddRoleDialog(true),
    openAddPermissionDialog: () => setAddPermissionDialog(true),
    openAddProductDialog: (category) => {
      setAddProductDialog({ open: true, category });
      setNewProduct({
        productIds: [],
        category: category?.name || "",
      });
    },
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

      <EditUserDialog
        editDialog={editDialog}
        setEditDialog={setEditDialog}
        editForm={editForm}
        setEditForm={setEditForm}
        onSave={handleEditSave}
      />

      <EditRoleDialog
        editDialog={editDialog}
        setEditDialog={setEditDialog}
        editForm={editForm}
        setEditForm={setEditForm}
        onSave={handleEditSave}
        isSaving={isUpdatingRole}
      />

      <EditPermissionDialog
        editDialog={editDialog}
        setEditDialog={setEditDialog}
        editForm={editForm}
        setEditForm={setEditForm}
        onSave={handleEditSave}
        isSaving={isUpdatingPermission}
      />

      <AddCategoryDialog
        open={addCategoryDialog}
        setOpen={setAddCategoryDialog}
        newCategory={newCategory}
        setNewCategory={setNewCategory}
        onAddCategory={handleAddCategory}
        isAdding={isCreatingCategory}
      />

      <AddUserDialog
        open={addUserDialog}
        setOpen={setAddUserDialog}
        newUser={newUser}
        setNewUser={setNewUser}
        onAddUser={handleAddUser}
        isAdding={isCreatingUser}
      />

      <AddRoleDialog
        open={addRoleDialog}
        setOpen={setAddRoleDialog}
        newRole={newRole}
        setNewRole={setNewRole}
        onAddRole={handleAddRole}
        isAdding={isCreatingRole}
      />

      <AddPermissionDialog
        open={addPermissionDialog}
        setOpen={setAddPermissionDialog}
        newPermission={newPermission}
        setNewPermission={setNewPermission}
        onAddPermission={handleAddPermission}
        isAdding={isCreatingPermission}
      />

      <AddProductDialog
        open={addProductDialog.open}
        setOpen={(open) => setAddProductDialog({ ...addProductDialog, open })}
        newProduct={newProduct}
        setNewProduct={setNewProduct}
        onAddProduct={handleAddProduct}
        isAdding={isAssigningProducts}
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
