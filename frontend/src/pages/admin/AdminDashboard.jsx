import { useEffect, useState } from "react";
import { useNavigation } from "@/App";
import { toast } from "sonner";
import { AdminOverview } from "./Overview";
import { SupplierManagement } from "./SupplierManagement";
import { ProductManagement } from "./ProductManagement";
import { RatingsModeration } from "./RatingsModeration";
import { CategoryManagement } from "./CategoryManagement";
import { BuyerManagement } from "./BuyerManagement";
import { PlatformInsights } from "./PlatformInsights";
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


import { productApi, supplierApi } from "@/lib/api";
import { getDocumentExpiryStats } from '../../data/mockData';

export const AdminDashboard = () => {
  const { activeSection, setActiveSection } = useNavigation();
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [buyersData, setBuyersData] = useState([]);
  const [ratingsData, setRatingsData] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);
  
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

  const documentStats = getDocumentExpiryStats(suppliers);
  
  const stats = {
    totalSuppliers: suppliers.length,
    totalBuyers: buyersData.length,
    totalProducts: products.length,
    pendingSupplierApprovals: suppliers.filter(s => s.status === 'pending').length,
    pendingProductApprovals: products.filter(p => p.status === 'pending').length,
    pendingRatings: ratingsData.filter(r => r.status === 'pending').length,
    totalCategories: categoriesData.length,
    expiredDocuments: documentStats.expired,
    expiringDocuments: documentStats.expiring7 + documentStats.expiring15 + documentStats.expiring30
  };

  const openConfirmDialog = (type, item, message) => {
    setConfirmDialog({ open: true, type, item, message });
  };

  const handleConfirmAction = async () => {
    const { type, item } = confirmDialog;
    
    try {
      switch (type) {
        case "approve-supplier":
          await supplierApi.updateStatus(item.id, "active");
          setSuppliers(prev => prev.map(s => s.id === item.id ? { ...s, status: "active" } : s));
          toast.success(`Supplier "${item.name}" approved successfully`);
          break;
        case "reject-supplier":
          await supplierApi.updateStatus(item.id, "rejected");
          setSuppliers(prev => prev.map(s => s.id === item.id ? { ...s, status: "rejected" } : s));
          toast.error(`Supplier "${item.name}" rejected`);
          break;
        case "suspend-supplier":
          await supplierApi.updateStatus(item.id, "suspended");
          setSuppliers(prev => prev.map(s => s.id === item.id ? { ...s, status: "suspended" } : s));
          toast.warning(`Supplier "${item.name}" suspended`);
          break;
        case "delete-supplier":
          await supplierApi.remove(item.id);
          setSuppliers(prev => prev.filter(s => s.id !== item.id));
          toast.success(`Supplier "${item.name}" deleted`);
          break;
        case "approve-product":
        await productApi.updateStatus(item.id, "approved");
        setProducts(prev => prev.map(p => p.id === item.id ? { ...p, status: "approved" } : p));
        toast.success(`Product "${item.name}" approved`);
        break;
        case "reject-product":
        await productApi.updateStatus(item.id, "rejected");
        setProducts(prev => prev.map(p => p.id === item.id ? { ...p, status: "rejected" } : p));
        toast.error(`Product "${item.name}" rejected`);
        break;
        case "delete-product":
        await productApi.remove(item.id);
        setProducts(prev => prev.filter(p => p.id !== item.id));
        toast.success(`Product "${item.name}" deleted`);
        break;
      case "approve-rating":
        setRatingsData(prev => prev.map(r => r.id === item.id ? { ...r, status: "approved" } : r));
        toast.success("Rating approved and now visible");
        break;
      case "reject-rating":
        setRatingsData(prev => prev.map(r => r.id === item.id ? { ...r, status: "rejected" } : r));
        toast.error("Rating rejected and hidden");
        break;
      case "remove-rating":
        setRatingsData(prev => prev.filter(r => r.id !== item.id));
        toast.success("Rating removed");
        break;
      case "approve-reply":
        setRatingsData(prev => prev.map(r => r.id === item.id ? { ...r, supplierReplyStatus: "approved" } : r));
        toast.success("Supplier reply approved and now visible");
        break;
      case "reject-reply":
        setRatingsData(prev => prev.map(r => r.id === item.id ? { ...r, supplierReplyStatus: "rejected", supplierReply: null } : r));
        toast.error("Supplier reply rejected");
        break;
      case "suspend-buyer":
        setBuyersData(prev => prev.map(b => b.id === item.id ? { ...b, status: "suspended" } : b));
        toast.warning(`Buyer "${item.name}" suspended`);
        break;
      case "delete-buyer":
        setBuyersData(prev => prev.filter(b => b.id !== item.id));
        toast.success(`Buyer "${item.name}" deleted`);
        break;
      case "delete-category":
        setCategoriesData(prev => prev.filter(c => c.id !== item.id));
        toast.success(`Category "${item.name}" deleted`);
        break;
      case "delete-subcategory":
        setCategoriesData(prev => prev.map(c => 
          c.id === item.categoryId 
            ? { ...c, subcategories: c.subcategories.filter(s => s.id !== item.id) }
            : c
        ));
        toast.success(`Subcategory "${item.name}" deleted`);
        break;
      default:
        break;
      }
    } catch (error) {
      toast.error(error.message || "Supplier operation failed");
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
          const updatedProduct = await productApi.update(editForm.id, editForm);
          setProducts(prev => prev.map(p => p.id === editForm.id ? { ...updatedProduct } : p));
          toast.success(`Product "${editForm.name}" updated`);
        } catch (error) {
          toast.error(error.message || "Failed to update product");
          return;
        }
        break;
      case "category":
        setCategoriesData(prev => prev.map(c => c.id === editForm.id ? { ...editForm } : c));
        toast.success(`Category "${editForm.name}" updated`);
        break;
      case "subcategory":
        setCategoriesData(prev => prev.map(c => 
          c.id === editForm.categoryId 
            ? { ...c, subcategories: c.subcategories.map(s => s.id === editForm.id ? { ...editForm } : s) }
            : c
        ));
        toast.success(`Subcategory "${editForm.name}" updated`);
        break;
      default:
        break;
    }
    
    setEditDialog({ open: false, type: "", item: null });
  };

  const handleAddCategory = () => {
    if (newCategory.name.trim()) {
      const newCat = {
        id: `CAT${String(categoriesData.length + 1).padStart(3, '0')}`,
        name: newCategory.name,
        subcategories: newCategory.subcategories
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
          .map((name, idx) => ({ id: `SUB${Date.now()}${idx}`, name })),
        productCount: 0
      };
      setCategoriesData(prev => [...prev, newCat]);
      toast.success(`Category "${newCategory.name}" added`);
      setNewCategory({ name: "", subcategories: "" });
      setAddCategoryDialog(false);
    }
  };

  const handleAddSubcategory = () => {
    if (newSubcategory.trim() && addSubcategoryDialog.category) {
      const newSub = { id: `SUB${Date.now()}`, name: newSubcategory };
      setCategoriesData(prev => prev.map(c => 
        c.id === addSubcategoryDialog.category.id 
          ? { ...c, subcategories: [...c.subcategories, newSub] }
          : c
      ));
      toast.success(`Subcategory "${newSubcategory}" added to ${addSubcategoryDialog.category.name}`);
      setNewSubcategory("");
      setAddSubcategoryDialog({ open: false, category: null });
    }
  };

  // Navigate to supplier detail from product view
  const handleViewSupplier = (supplier) => {
    setViewSheet({ open: false, type: "", item: null });
    setTimeout(() => {
      openViewSheet("supplier", supplier);
    }, 100);
  };

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return <AdminOverview onNavigate={setActiveSection} />;
      case "suppliers":
        return (
          <SupplierManagement
            onView={(item) => openViewSheet("supplier", item)}
          />
        );
      case "products":
        return (
            <ProductManagement
              onView={(item) => openViewSheet("product", item)}
              onEdit={(item) => openEditDialog("product", item)}
            />
        );
      case "ratings":
        return (
          <RatingsModeration
            onView={(item) => openViewSheet("rating", item)}
          />
        );
      case "categories":
        return (
          <CategoryManagement
            onEdit={(item) => openEditDialog("category", item)}
            onEditSubcategory={(item) => openEditDialog("subcategory", item)}
            onAddCategory={() => setAddCategoryDialog(true)}
            onAddSubcategory={(category) =>
              setAddSubcategoryDialog({ open: true, category })
            }
          />
        );
      case "buyers":
        return (
          <BuyerManagement
            onView={(item) =>
              openViewSheet("buyer", { ...item, ...getBuyerDetails(item) })
            }
          />
        );
      case "analytics":
        return <PlatformInsights />;
      default:
        return <AdminOverview onNavigate={setActiveSection} />;
    }
  };

  return (
    <>
      {renderContent()}

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

    </>
  );
};

export default AdminDashboard;
