import { useState } from "react";
import { useNavigation } from "@/App";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DataTable } from "@/components/shared/DataTable";
import { ActionButton, ActionButtonGroup } from "@/components/shared/ActionButton";
import { RatingStars } from "@/components/shared/RatingStars";
import {
  Building2, Users, Package, Clock, Star, FolderTree, Eye, Check, X, Ban, Trash2, Edit, Plus,
  ChevronRight, ChevronDown, TrendingUp, Mail, Phone, MapPin, Award, Calendar, AlertTriangle,
  FileWarning, FileX, FileCheck, Globe, Truck, Shield, Tag, Layers, Ruler, Weight, Box,
  FileText, Video, Image, ExternalLink, Download
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area,
} from "recharts";
import {
  suppliers as initialSuppliers, products as initialProducts, buyers as initialBuyers,
  ratings as initialRatings, categories as initialCategories, analyticsData, enquiries,
  getDocumentExpiryStats,
} from "@/data/mockData";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-sm p-3 shadow-lg">
        <p className="text-sm font-medium mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-xs text-muted-foreground">
            <span style={{ color: entry.color }}>{entry.name}: </span>{entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Helper function to get supplier by ID
const getSupplierById = (supplierId, suppliers) => {
  return suppliers.find(s => s.id === supplierId) || null;
};

// Helper function to get supplier's product count
const getSupplierProductCount = (supplierId, products) => {
  return products.filter(p => p.supplierId === supplierId).length;
};

export const AdminDashboard = () => {
  const { activeSection, setActiveSection } = useNavigation();
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [products, setProducts] = useState(initialProducts);
  const [buyersData, setBuyersData] = useState(initialBuyers);
  const [ratingsData, setRatingsData] = useState(initialRatings);
  const [categoriesData, setCategoriesData] = useState(initialCategories);
  
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: "", item: null, message: "" });
  const [editDialog, setEditDialog] = useState({ open: false, type: "", item: null });
  const [addCategoryDialog, setAddCategoryDialog] = useState(false);
  const [addSubcategoryDialog, setAddSubcategoryDialog] = useState({ open: false, category: null });
  const [viewSheet, setViewSheet] = useState({ open: false, type: "", item: null });
  
  const [newCategory, setNewCategory] = useState({ name: "", subcategories: "" });
  const [newSubcategory, setNewSubcategory] = useState("");
  const [editForm, setEditForm] = useState({});

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

  const handleConfirmAction = () => {
    const { type, item } = confirmDialog;
    
    switch (type) {
      case "approve-supplier":
        setSuppliers(prev => prev.map(s => s.id === item.id ? { ...s, status: "active" } : s));
        toast.success(`Supplier "${item.name}" approved successfully`);
        break;
      case "reject-supplier":
        setSuppliers(prev => prev.map(s => s.id === item.id ? { ...s, status: "rejected" } : s));
        toast.error(`Supplier "${item.name}" rejected`);
        break;
      case "suspend-supplier":
        setSuppliers(prev => prev.map(s => s.id === item.id ? { ...s, status: "suspended" } : s));
        toast.warning(`Supplier "${item.name}" suspended`);
        break;
      case "delete-supplier":
        setSuppliers(prev => prev.filter(s => s.id !== item.id));
        toast.success(`Supplier "${item.name}" deleted`);
        break;
      case "approve-product":
        setProducts(prev => prev.map(p => p.id === item.id ? { ...p, status: "approved" } : p));
        toast.success(`Product "${item.name}" approved`);
        break;
      case "reject-product":
        setProducts(prev => prev.map(p => p.id === item.id ? { ...p, status: "rejected" } : p));
        toast.error(`Product "${item.name}" rejected`);
        break;
      case "delete-product":
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
    
    setConfirmDialog({ open: false, type: "", item: null, message: "" });
  };

  const openViewSheet = (type, item) => {
    // Enrich product with supplier data when viewing
    if (type === "product" && item.supplierId) {
      const supplier = getSupplierById(item.supplierId, suppliers);
      const productCount = getSupplierProductCount(item.supplierId, products);
      setViewSheet({ 
        open: true, 
        type, 
        item: { 
          ...item, 
          supplier,
          supplierProductCount: productCount
        } 
      });
    } else {
      setViewSheet({ open: true, type, item });
    }
  };

  const openEditDialog = (type, item) => {
    setEditForm({ ...item });
    setEditDialog({ open: true, type, item });
  };

  const handleEditSave = () => {
    const { type } = editDialog;
    
    switch (type) {
      case "product":
        setProducts(prev => prev.map(p => p.id === editForm.id ? { ...editForm } : p));
        toast.success(`Product "${editForm.name}" updated`);
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

  // Get buyer's enquiries and ratings for the detail view
  const getBuyerDetails = (buyer) => {
    const buyerEnquiries = enquiries.filter(e => e.buyerId === buyer.id);
    const buyerRatings = ratingsData.filter(r => r.buyerId === buyer.id);
    return { enquiries: buyerEnquiries, ratings: buyerRatings };
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
        return <AdminOverview stats={stats} analyticsData={analyticsData} documentStats={documentStats} onNavigate={setActiveSection} />;
      case "suppliers":
        return (
          <SupplierManagement 
            suppliers={suppliers} 
            onView={(item) => openViewSheet("supplier", item)}
            onApprove={(item) => openConfirmDialog("approve-supplier", item, `Approve supplier "${item.name}"?`)}
            onReject={(item) => openConfirmDialog("reject-supplier", item, `Reject supplier "${item.name}"?`)}
            onSuspend={(item) => openConfirmDialog("suspend-supplier", item, `Suspend supplier "${item.name}"?`)}
            onDelete={(item) => openConfirmDialog("delete-supplier", item, `Delete supplier "${item.name}"?`)}
          />
        );
      case "products":
        return (
          <ProductManagement 
            products={products}
            suppliers={suppliers}
            categories={categoriesData}
            onView={(item) => openViewSheet("product", item)}
            onApprove={(item) => openConfirmDialog("approve-product", item, `Approve product "${item.name}"?`)}
            onReject={(item) => openConfirmDialog("reject-product", item, `Reject product "${item.name}"?`)}
            onEdit={(item) => openEditDialog("product", item)}
            onDelete={(item) => openConfirmDialog("delete-product", item, `Delete product "${item.name}"?`)}
          />
        );
      case "ratings":
        return (
          <RatingsModeration 
            ratings={ratingsData} 
            onView={(item) => openViewSheet("rating", item)}
            onApprove={(item) => openConfirmDialog("approve-rating", item, "Approve this rating?")}
            onReject={(item) => openConfirmDialog("reject-rating", item, "Reject this rating?")}
            onRemove={(item) => openConfirmDialog("remove-rating", item, "Remove this rating?")}
            onApproveReply={(item) => openConfirmDialog("approve-reply", item, "Approve supplier's reply?")}
            onRejectReply={(item) => openConfirmDialog("reject-reply", item, "Reject supplier's reply?")}
          />
        );
      case "categories":
        return (
          <CategoryManagement 
            categories={categoriesData} 
            onEdit={(item) => openEditDialog("category", item)}
            onEditSubcategory={(item) => openEditDialog("subcategory", item)}
            onDelete={(item) => openConfirmDialog("delete-category", item, `Delete category "${item.name}"?`)}
            onDeleteSubcategory={(item) => openConfirmDialog("delete-subcategory", item, `Delete subcategory "${item.name}"?`)}
            onAddCategory={() => setAddCategoryDialog(true)}
            onAddSubcategory={(category) => setAddSubcategoryDialog({ open: true, category })}
          />
        );
      case "buyers":
        return (
          <BuyerManagement 
            buyers={buyersData} 
            onView={(item) => openViewSheet("buyer", { ...item, ...getBuyerDetails(item) })}
            onSuspend={(item) => openConfirmDialog("suspend-buyer", item, `Suspend buyer "${item.name}"?`)}
            onDelete={(item) => openConfirmDialog("delete-buyer", item, `Delete buyer "${item.name}"?`)}
          />
        );
      case "analytics":
        return <PlatformInsights analyticsData={analyticsData} />;
      default:
        return <AdminOverview stats={stats} analyticsData={analyticsData} documentStats={documentStats} onNavigate={setActiveSection} />;
    }
  };

  return (
    <>
      {renderContent()}
      
      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-['Barlow_Condensed'] uppercase tracking-wide flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              Confirm Action
            </DialogTitle>
            <DialogDescription className="pt-2">{confirmDialog.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmDialog({ ...confirmDialog, open: false })} data-testid="confirm-cancel-btn">Cancel</Button>
            <Button onClick={handleConfirmAction} data-testid="confirm-action-btn">Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={editDialog.open && editDialog.type === "product"} onOpenChange={(open) => setEditDialog({ ...editDialog, open })}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">Edit Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Product Name</Label>
              <Input value={editForm.name || ""} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="bg-black/20 mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Category</Label>
                <Input value={editForm.category || ""} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} className="bg-black/20 mt-1" />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Status</Label>
                <Select value={editForm.status || "pending"} onValueChange={(value) => setEditForm({ ...editForm, status: value })}>
                  <SelectTrigger className="bg-black/20 mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Description</Label>
              <Textarea value={editForm.description || ""} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className="bg-black/20 mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog({ ...editDialog, open: false })}>Cancel</Button>
            <Button onClick={handleEditSave} data-testid="edit-product-save-btn">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={editDialog.open && editDialog.type === "category"} onOpenChange={(open) => setEditDialog({ ...editDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">Edit Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Category Name</Label>
              <Input value={editForm.name || ""} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="bg-black/20 mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog({ ...editDialog, open: false })}>Cancel</Button>
            <Button onClick={handleEditSave} data-testid="edit-category-save-btn">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Subcategory Dialog */}
      <Dialog open={editDialog.open && editDialog.type === "subcategory"} onOpenChange={(open) => setEditDialog({ ...editDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">Edit Subcategory</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Subcategory Name</Label>
              <Input value={editForm.name || ""} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="bg-black/20 mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog({ ...editDialog, open: false })}>Cancel</Button>
            <Button onClick={handleEditSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Category Dialog */}
      <Dialog open={addCategoryDialog} onOpenChange={setAddCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">Add New Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Category Name</Label>
              <Input value={newCategory.name} onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} placeholder="Enter category name" className="bg-black/20 mt-1" data-testid="new-category-name" />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Subcategories (comma separated)</Label>
              <Textarea value={newCategory.subcategories} onChange={(e) => setNewCategory({ ...newCategory, subcategories: e.target.value })} placeholder="Sub 1, Sub 2, Sub 3" className="bg-black/20 mt-1" data-testid="new-category-subcategories" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddCategoryDialog(false)}>Cancel</Button>
            <Button onClick={handleAddCategory} data-testid="add-category-submit-btn">Add Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Subcategory Dialog */}
      <Dialog open={addSubcategoryDialog.open} onOpenChange={(open) => setAddSubcategoryDialog({ ...addSubcategoryDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">Add Subcategory</DialogTitle>
            {addSubcategoryDialog.category && (
              <DialogDescription>Adding to: {addSubcategoryDialog.category.name}</DialogDescription>
            )}
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Subcategory Name</Label>
              <Input value={newSubcategory} onChange={(e) => setNewSubcategory(e.target.value)} placeholder="Enter subcategory name" className="bg-black/20 mt-1" data-testid="new-subcategory-name" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddSubcategoryDialog({ open: false, category: null })}>Cancel</Button>
            <Button onClick={handleAddSubcategory} data-testid="add-subcategory-submit-btn">Add Subcategory</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Supplier Sheet */}
      <Sheet open={viewSheet.open && viewSheet.type === "supplier"} onOpenChange={(open) => setViewSheet({ ...viewSheet, open })}>
        <SheetContent className="w-[500px] sm:max-w-[500px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">Supplier Details</SheetTitle>
          </SheetHeader>
          {viewSheet.item && (
            <div className="mt-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-sm bg-primary/20 flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{viewSheet.item.name}</h3>
                  <p className="text-sm text-muted-foreground">{viewSheet.item.type}</p>
                  <StatusBadge status={viewSheet.item.status} className="mt-1" />
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Contact Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-muted-foreground" />{viewSheet.item.email}</div>
                  <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-muted-foreground" />{viewSheet.item.phone}</div>
                  <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-muted-foreground" />{viewSheet.item.country}</div>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted/30 rounded-sm">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Products</p>
                  <p className="text-2xl font-bold font-['Barlow_Condensed']">{viewSheet.item.productsCount}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-sm">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Rating</p>
                  <RatingStars rating={viewSheet.item.rating} size="sm" />
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Documents</h4>
                {viewSheet.item.documents?.map((doc, idx) => (
                  <div key={idx} className={`p-3 rounded-sm flex items-center justify-between ${
                    doc.status === 'expired' ? 'bg-red-500/10 border border-red-500/20' :
                    doc.status === 'expiring' ? 'bg-amber-500/10 border border-amber-500/20' :
                    'bg-muted/30'
                  }`}>
                    <div className="flex items-center gap-2">
                      {doc.status === 'expired' ? <FileX className="h-4 w-4 text-red-400" /> :
                       doc.status === 'expiring' ? <FileWarning className="h-4 w-4 text-amber-400" /> :
                       <FileCheck className="h-4 w-4 text-emerald-400" />}
                      <span className="text-sm">{doc.name}</span>
                    </div>
                    <span className={`text-xs ${
                      doc.status === 'expired' ? 'text-red-400' :
                      doc.status === 'expiring' ? 'text-amber-400' :
                      'text-muted-foreground'
                    }`}>
                      {doc.status === 'expired' ? 'EXPIRED' : `Expires: ${doc.expiryDate}`}
                    </span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-3">
                <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Certifications</h4>
                <div className="flex flex-wrap gap-2">
                  {viewSheet.item.certifications?.map((cert, idx) => (
                    <span key={idx} className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-sm">
                      <Award className="h-3 w-3" />{cert}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* ENHANCED View Product Sheet - Matches Supplier Input Data Structure */}
      <Sheet open={viewSheet.open && viewSheet.type === "product"} onOpenChange={(open) => setViewSheet({ ...viewSheet, open })}>
        <SheetContent className="w-[700px] sm:max-w-[700px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">Product Details</SheetTitle>
          </SheetHeader>
          {viewSheet.item && (
            <div className="mt-6">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                  <TabsTrigger value="specs" className="text-xs">Specs</TabsTrigger>
                  <TabsTrigger value="media" className="text-xs">Media</TabsTrigger>
                  <TabsTrigger value="supplier" className="text-xs">Supplier</TabsTrigger>
                </TabsList>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-6 mt-0">
                  {/* Product Image Gallery */}
                  {viewSheet.item.images?.length > 0 ? (
                    <div className="grid grid-cols-4 gap-2">
                      {viewSheet.item.images.slice(0, 4).map((img, idx) => (
                        <img 
                          key={idx} 
                          src={img.url || img} 
                          alt={`${viewSheet.item.name} ${idx + 1}`} 
                          className={`w-full h-20 object-cover rounded-sm bg-muted ${idx === (viewSheet.item.primaryImageIndex || 0) ? 'ring-2 ring-primary' : ''}`} 
                        />
                      ))}
                    </div>
                  ) : (
                    <img src={viewSheet.item.image} alt={viewSheet.item.name} className="w-full h-48 object-cover rounded-sm bg-muted" />
                  )}

                  {/* Product Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">{viewSheet.item.name}</h3>
                      <p className="text-sm text-muted-foreground">{viewSheet.item.category} • {viewSheet.item.subcategory}</p>
                    </div>
                    <StatusBadge status={viewSheet.item.status} />
                  </div>

                  {/* Short Description */}
                  {viewSheet.item.shortDescription && (
                    <div className="p-3 bg-muted/20 rounded-sm">
                      <p className="text-sm">{viewSheet.item.shortDescription}</p>
                    </div>
                  )}

                  <Separator />

                  {/* Origin & Delivery */}
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3 flex items-center gap-2">
                      <Truck className="h-4 w-4" />Origin & Delivery
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-3 bg-muted/30 rounded-sm">
                        <p className="text-xs uppercase text-muted-foreground flex items-center gap-1"><Globe className="h-3 w-3" />Country</p>
                        <p className="text-sm font-medium mt-1">{viewSheet.item.countryOfOrigin || "N/A"}</p>
                      </div>
                      <div className="p-3 bg-muted/30 rounded-sm">
                        <p className="text-xs uppercase text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />Lead Time</p>
                        <p className="text-sm font-medium mt-1">{viewSheet.item.leadTime || "N/A"}</p>
                      </div>
                      <div className="p-3 bg-muted/30 rounded-sm">
                        <p className="text-xs uppercase text-muted-foreground flex items-center gap-1"><Package className="h-3 w-3" />Availability</p>
                        <p className="text-sm font-medium mt-1 capitalize">{viewSheet.item.availability?.replace('-', ' ') || "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Detailed Description */}
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">Detailed Description</h4>
                    <p className="text-sm">{viewSheet.item.description || "No description provided"}</p>
                  </div>

                  {/* Application / Use Case */}
                  {viewSheet.item.applicationUseCase && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">Application / Use Case</h4>
                        <p className="text-sm">{viewSheet.item.applicationUseCase}</p>
                      </div>
                    </>
                  )}

                  {/* Industry Tags */}
                  {viewSheet.item.industryTags?.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3 flex items-center gap-2">
                          <Tag className="h-4 w-4" />Industry Tags
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {viewSheet.item.industryTags.map((tag, idx) => (
                            <Badge key={idx} variant="secondary">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Rating */}
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">Product Rating</p>
                      {viewSheet.item.rating > 0 ? (
                        <RatingStars rating={viewSheet.item.rating} size="md" />
                      ) : (
                        <span className="text-sm text-muted-foreground">No ratings yet</span>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* SPECS TAB */}
                <TabsContent value="specs" className="space-y-6 mt-0">
                  {/* Technical Specifications */}
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3 flex items-center gap-2">
                      <Layers className="h-4 w-4" />Technical Specifications
                    </h4>
                    {viewSheet.item.specifications?.length > 0 ? (
                      <div className="space-y-2">
                        {viewSheet.item.specifications.map((spec, idx) => {
                          // Handle both string format "Key: Value" and object format {key, value}
                          const isString = typeof spec === 'string';
                          const [key, ...valueParts] = isString ? spec.split(':') : [spec.key, spec.value];
                          const value = isString ? valueParts.join(':').trim() : spec.value;
                          return (
                            <div key={idx} className="flex items-center justify-between p-2 bg-muted/20 rounded-sm">
                              <span className="text-sm text-muted-foreground">{key?.trim() || spec}</span>
                              <span className="text-sm font-medium">{value || ''}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No specifications provided</p>
                    )}
                  </div>

                  <Separator />

                  {/* Dimensions & Physical Details */}
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3 flex items-center gap-2">
                      <Ruler className="h-4 w-4" />Dimensions & Physical Details
                    </h4>
                    {viewSheet.item.dimensions ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {viewSheet.item.dimensions.length && (
                          <div className="p-3 bg-muted/30 rounded-sm">
                            <p className="text-xs uppercase text-muted-foreground flex items-center gap-1"><Ruler className="h-3 w-3" />Length</p>
                            <p className="text-sm font-medium mt-1">{viewSheet.item.dimensions.length}</p>
                          </div>
                        )}
                        {viewSheet.item.dimensions.width && (
                          <div className="p-3 bg-muted/30 rounded-sm">
                            <p className="text-xs uppercase text-muted-foreground flex items-center gap-1"><Ruler className="h-3 w-3" />Width</p>
                            <p className="text-sm font-medium mt-1">{viewSheet.item.dimensions.width}</p>
                          </div>
                        )}
                        {viewSheet.item.dimensions.height && (
                          <div className="p-3 bg-muted/30 rounded-sm">
                            <p className="text-xs uppercase text-muted-foreground flex items-center gap-1"><Ruler className="h-3 w-3" />Height</p>
                            <p className="text-sm font-medium mt-1">{viewSheet.item.dimensions.height}</p>
                          </div>
                        )}
                        {viewSheet.item.dimensions.weight && (
                          <div className="p-3 bg-muted/30 rounded-sm">
                            <p className="text-xs uppercase text-muted-foreground flex items-center gap-1"><Weight className="h-3 w-3" />Weight</p>
                            <p className="text-sm font-medium mt-1">{viewSheet.item.dimensions.weight}</p>
                          </div>
                        )}
                        {viewSheet.item.dimensions.volume && (
                          <div className="p-3 bg-muted/30 rounded-sm">
                            <p className="text-xs uppercase text-muted-foreground flex items-center gap-1"><Box className="h-3 w-3" />Volume</p>
                            <p className="text-sm font-medium mt-1">{viewSheet.item.dimensions.volume}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No dimension data provided</p>
                    )}
                  </div>

                  <Separator />

                  {/* Certifications */}
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3 flex items-center gap-2">
                      <Shield className="h-4 w-4" />Certifications & Compliance
                    </h4>
                    {viewSheet.item.certifications?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {viewSheet.item.certifications.map((cert, idx) => (
                          <Badge key={idx} variant="outline" className="gap-1">
                            <Award className="h-3 w-3" />{cert}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No certifications listed</p>
                    )}
                  </div>
                </TabsContent>

                {/* MEDIA TAB */}
                <TabsContent value="media" className="space-y-6 mt-0">
                  {/* Product Images */}
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3 flex items-center gap-2">
                      <Image className="h-4 w-4" />Product Images
                    </h4>
                    {viewSheet.item.images?.length > 0 ? (
                      <div className="grid grid-cols-3 gap-3">
                        {viewSheet.item.images.map((img, idx) => (
                          <div key={idx} className={`relative rounded-sm overflow-hidden ${idx === (viewSheet.item.primaryImageIndex || 0) ? 'ring-2 ring-primary' : ''}`}>
                            <img src={img.url || img} alt={`Product ${idx + 1}`} className="w-full h-24 object-cover bg-muted" />
                            {idx === (viewSheet.item.primaryImageIndex || 0) && (
                              <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] px-1 rounded">Primary</span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 border-2 border-dashed border-border rounded-sm text-center">
                        <Image className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">No images uploaded</p>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Documents */}
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4" />Documents
                    </h4>
                    <div className="space-y-2">
                      {/* Datasheet */}
                      <div className="p-3 bg-muted/30 rounded-sm flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Product Datasheet</span>
                        </div>
                        {viewSheet.item.datasheet ? (
                          <Button variant="ghost" size="sm" className="gap-1">
                            <Download className="h-3 w-3" />Download
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">Not uploaded</span>
                        )}
                      </div>

                      {/* Technical Documents */}
                      {viewSheet.item.technicalDocs?.length > 0 ? (
                        viewSheet.item.technicalDocs.map((doc, idx) => (
                          <div key={idx} className="p-3 bg-muted/30 rounded-sm flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Layers className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{doc.name}</span>
                            </div>
                            <Button variant="ghost" size="sm" className="gap-1">
                              <Download className="h-3 w-3" />Download
                            </Button>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 bg-muted/30 rounded-sm flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Layers className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Technical Documents</span>
                          </div>
                          <span className="text-xs text-muted-foreground">None uploaded</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Video */}
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3 flex items-center gap-2">
                      <Video className="h-4 w-4" />Product Video
                    </h4>
                    {viewSheet.item.videoUrl ? (
                      <div className="p-3 bg-muted/30 rounded-sm">
                        <a href={viewSheet.item.videoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                          <ExternalLink className="h-4 w-4" />Watch Product Video
                        </a>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No video available</p>
                    )}
                  </div>
                </TabsContent>

                {/* SUPPLIER TAB */}
                <TabsContent value="supplier" className="space-y-6 mt-0">
                  {viewSheet.item.supplier ? (
                    <>
                      {/* Supplier Header */}
                      <div className="p-4 bg-primary/5 border border-primary/20 rounded-sm">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 rounded-sm bg-primary/20 flex items-center justify-center">
                            <Building2 className="h-7 w-7 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold">{viewSheet.item.supplier.name}</h3>
                            <p className="text-sm text-muted-foreground">{viewSheet.item.supplier.type}</p>
                            <StatusBadge status={viewSheet.item.supplier.status} className="mt-1" />
                          </div>
                          <Button variant="outline" size="sm" className="gap-1" onClick={() => handleViewSupplier(viewSheet.item.supplier)} data-testid="view-supplier-profile-btn">
                            <Eye className="h-3 w-3" />View Profile
                          </Button>
                        </div>
                      </div>

                      {/* Supplier Stats */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-3 bg-muted/30 rounded-sm text-center">
                          <p className="text-xs uppercase text-muted-foreground">Rating</p>
                          <div className="mt-1">
                            <RatingStars rating={viewSheet.item.supplier.rating} size="sm" />
                          </div>
                        </div>
                        <div className="p-3 bg-muted/30 rounded-sm text-center">
                          <p className="text-xs uppercase text-muted-foreground">Total Products</p>
                          <p className="text-2xl font-bold font-['Barlow_Condensed'] mt-1">{viewSheet.item.supplierProductCount || viewSheet.item.supplier.productsCount}</p>
                        </div>
                        <div className="p-3 bg-muted/30 rounded-sm text-center">
                          <p className="text-xs uppercase text-muted-foreground">Country</p>
                          <p className="text-sm font-medium mt-1">{viewSheet.item.supplier.country}</p>
                        </div>
                      </div>

                      <Separator />

                      {/* Contact Info */}
                      <div>
                        <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">Contact Information</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-muted-foreground" />{viewSheet.item.supplier.email}</div>
                          <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-muted-foreground" />{viewSheet.item.supplier.phone}</div>
                          <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-muted-foreground" />{viewSheet.item.supplier.country}</div>
                        </div>
                      </div>

                      <Separator />

                      {/* Certifications */}
                      <div>
                        <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">Supplier Certifications</h4>
                        <div className="flex flex-wrap gap-2">
                          {viewSheet.item.supplier.certifications?.map((cert, idx) => (
                            <Badge key={idx} variant="outline" className="gap-1">
                              <Award className="h-3 w-3" />{cert}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-8 text-center">
                      <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Supplier information not available</p>
                      <p className="text-sm text-muted-foreground mt-1">Supplier: {viewSheet.item.supplierName || 'Unknown'}</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* View Rating Sheet */}
      <Sheet open={viewSheet.open && viewSheet.type === "rating"} onOpenChange={(open) => setViewSheet({ ...viewSheet, open })}>
        <SheetContent className="w-[500px] sm:max-w-[500px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">Rating Details</SheetTitle>
          </SheetHeader>
          {viewSheet.item && (
            <div className="mt-6 space-y-6">
              <div className="flex items-start justify-between">
                <div><h3 className="text-lg font-semibold">{viewSheet.item.productName}</h3><p className="text-sm text-muted-foreground">by {viewSheet.item.buyerName}</p></div>
                <StatusBadge status={viewSheet.item.status} />
              </div>
              <div className="p-4 bg-muted/30 rounded-sm text-center">
                <RatingStars rating={viewSheet.item.rating} size="lg" />
                <p className="text-3xl font-bold font-['Barlow_Condensed'] mt-2">{viewSheet.item.rating}.0</p>
              </div>
              <Separator />
              <div><h4 className="text-xs uppercase text-muted-foreground mb-2">Review</h4><p className="text-sm">{viewSheet.item.review}</p></div>
              {viewSheet.item.supplierReply && (
                <>
                  <Separator />
                  <div className={`p-3 rounded-sm ${viewSheet.item.supplierReplyStatus === 'approved' ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs uppercase text-muted-foreground">Supplier Reply</h4>
                      <StatusBadge status={viewSheet.item.supplierReplyStatus || 'pending'} />
                    </div>
                    <p className="text-sm">{viewSheet.item.supplierReply}</p>
                  </div>
                </>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* View Buyer Sheet */}
      <Sheet open={viewSheet.open && viewSheet.type === "buyer"} onOpenChange={(open) => setViewSheet({ ...viewSheet, open })}>
        <SheetContent className="w-[500px] sm:max-w-[500px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">Buyer Details</SheetTitle>
          </SheetHeader>
          {viewSheet.item && (
            <div className="mt-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-sm bg-primary/20 flex items-center justify-center">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{viewSheet.item.name}</h3>
                  <p className="text-sm text-muted-foreground">{viewSheet.item.company}</p>
                  <StatusBadge status={viewSheet.item.status} className="mt-1" />
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-muted-foreground" />{viewSheet.item.email}</div>
                <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-muted-foreground" />{viewSheet.item.phone}</div>
                <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-muted-foreground" />{viewSheet.item.country}</div>
                <div className="flex items-center gap-2 text-sm"><Calendar className="h-4 w-4 text-muted-foreground" />Member since {viewSheet.item.joinDate}</div>
              </div>
              <Separator />
              <div>
                <h4 className="text-xs uppercase text-muted-foreground mb-3">Enquiry History ({viewSheet.item.enquiries?.length || 0})</h4>
                {viewSheet.item.enquiries?.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {viewSheet.item.enquiries.map(e => (
                      <div key={e.id} className="p-2 bg-muted/30 rounded-sm">
                        <p className="text-sm font-medium">{e.productName}</p>
                        <p className="text-xs text-muted-foreground">{e.supplierName} • {e.date}</p>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted-foreground">No enquiries</p>}
              </div>
              <Separator />
              <div>
                <h4 className="text-xs uppercase text-muted-foreground mb-3">Ratings Given ({viewSheet.item.ratings?.length || 0})</h4>
                {viewSheet.item.ratings?.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {viewSheet.item.ratings.map(r => (
                      <div key={r.id} className="p-2 bg-muted/30 rounded-sm flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{r.productName}</p>
                          <p className="text-xs text-muted-foreground">{r.submissionDate}</p>
                        </div>
                        <RatingStars rating={r.rating} size="sm" />
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted-foreground">No ratings</p>}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

// Admin Overview Section
const AdminOverview = ({ stats, analyticsData, documentStats, onNavigate }) => {
  return (
    <div className="space-y-8" data-testid="admin-overview">
      <div>
        <h1 className="text-2xl font-bold font-['Barlow_Condensed'] uppercase tracking-wide mb-1">Platform Command Center</h1>
        <p className="text-sm text-muted-foreground">Monitor and manage all platform activities</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Suppliers" value={stats.totalSuppliers} icon={Building2} trend="up" trendValue="+12%" testId="stat-total-suppliers" />
        <StatCard title="Total Buyers" value={stats.totalBuyers} icon={Users} trend="up" trendValue="+8%" testId="stat-total-buyers" />
        <StatCard title="Total Products" value={stats.totalProducts} icon={Package} trend="up" trendValue="+15%" testId="stat-total-products" />
        <StatCard title="Categories" value={stats.totalCategories} icon={FolderTree} testId="stat-total-categories" />
      </div>

      {/* Document Expiry Card - Only Expired */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <button onClick={() => onNavigate('suppliers')} className="stat-card bg-red-500/5 border-red-500/20 text-left hover:border-red-500/40 transition-colors" data-testid="stat-expired-docs">
          <div className="flex items-center gap-3">
            <FileX className="h-5 w-5 text-red-400" />
            <div>
              <p className="data-label">Expired Documents</p>
              <p className="text-2xl font-bold font-['Barlow_Condensed']">{documentStats.expired}</p>
            </div>
          </div>
        </button>
      </div>

      {/* Pending Approvals */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button onClick={() => onNavigate('suppliers')} className="stat-card bg-amber-500/5 border-amber-500/20 text-left hover:border-amber-500/40 transition-colors">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-amber-400" />
            <div>
              <p className="data-label">Pending Supplier Approvals</p>
              <p className="text-2xl font-bold font-['Barlow_Condensed']">{stats.pendingSupplierApprovals}</p>
            </div>
          </div>
        </button>
        <button onClick={() => onNavigate('products')} className="stat-card bg-amber-500/5 border-amber-500/20 text-left hover:border-amber-500/40 transition-colors">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-amber-400" />
            <div>
              <p className="data-label">Pending Product Approvals</p>
              <p className="text-2xl font-bold font-['Barlow_Condensed']">{stats.pendingProductApprovals}</p>
            </div>
          </div>
        </button>
        <button onClick={() => onNavigate('ratings')} className="stat-card bg-amber-500/5 border-amber-500/20 text-left hover:border-amber-500/40 transition-colors">
          <div className="flex items-center gap-3">
            <Star className="h-5 w-5 text-amber-400" />
            <div>
              <p className="data-label">Pending Ratings</p>
              <p className="text-2xl font-bold font-['Barlow_Condensed']">{stats.pendingRatings}</p>
            </div>
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3 className="dashboard-card-title">Category Demand Trends</h3>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="dashboard-card-content">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={analyticsData.categoryDemandTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="month" stroke="#666" fontSize={11} />
                <YAxis stroke="#666" fontSize={11} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="uav" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="UAV" />
                <Area type="monotone" dataKey="electronics" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Electronics" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3 className="dashboard-card-title">Top Rated Suppliers</h3>
            <Star className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="dashboard-card-content">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analyticsData.topRatedSuppliers} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis type="number" domain={[0, 5]} stroke="#666" fontSize={11} />
                <YAxis type="category" dataKey="name" stroke="#666" fontSize={11} width={120} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="rating" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Rating" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

// Supplier Management Section
const SupplierManagement = ({ suppliers, onView, onApprove, onReject, onSuspend, onDelete }) => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [docFilter, setDocFilter] = useState("all");
  
  const filteredSuppliers = suppliers.filter(s => {
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    const matchesDoc = docFilter === "all" || s.documentStatus === docFilter;
    return matchesStatus && matchesDoc;
  });

  const getDocStatusBadge = (status) => {
    switch (status) {
      case 'expired': return <span className="status-badge bg-red-500/20 text-red-400 border-red-500/30">EXPIRED</span>;
      case 'expiring': return <span className="status-badge bg-amber-500/20 text-amber-400 border-amber-500/30">EXPIRING</span>;
      default: return <span className="status-badge bg-emerald-500/20 text-emerald-400 border-emerald-500/30">ACTIVE</span>;
    }
  };

  const columns = [
    { 
      key: "name", label: "Supplier Name",
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-sm bg-primary/20 flex items-center justify-center">
            <Building2 className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-medium">{value}</p>
            <p className="text-xs text-muted-foreground">{row.email}</p>
          </div>
        </div>
      )
    },
    { key: "type", label: "Type" },
    { key: "country", label: "Country" },
    { key: "productsCount", label: "Products" },
    { key: "documentStatus", label: "Doc Status", render: (value) => getDocStatusBadge(value) },
    { key: "status", label: "Status", render: (value) => <StatusBadge status={value} /> },
    {
      key: "actions", label: "Actions",
      render: (_, row) => (
        <ActionButtonGroup>
          <ActionButton icon={Eye} label="View Profile" testId={`view-supplier-${row.id}`} onClick={() => onView(row)} />
          {row.status === "pending" && (
            <>
              <ActionButton icon={Check} label="Approve" className="text-emerald-400 hover:text-emerald-300" testId={`approve-supplier-${row.id}`} onClick={() => onApprove(row)} />
              <ActionButton icon={X} label="Reject" className="text-red-400 hover:text-red-300" testId={`reject-supplier-${row.id}`} onClick={() => onReject(row)} />
            </>
          )}
          {row.status === "active" && (
            <ActionButton icon={Ban} label="Suspend" className="text-amber-400 hover:text-amber-300" testId={`suspend-supplier-${row.id}`} onClick={() => onSuspend(row)} />
          )}
          <ActionButton icon={Trash2} label="Delete" className="text-red-400 hover:text-red-300" testId={`delete-supplier-${row.id}`} onClick={() => onDelete(row)} />
        </ActionButtonGroup>
      )
    },
  ];

  return (
    <div className="space-y-6" data-testid="supplier-management">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold font-['Barlow_Condensed'] uppercase tracking-wide mb-1">Supplier Management</h1>
          <p className="text-sm text-muted-foreground">Manage supplier registrations and accounts</p>
        </div>
        <div className="flex gap-2">
          <Select value={docFilter} onValueChange={setDocFilter}>
            <SelectTrigger className="w-[150px] bg-black/20" data-testid="doc-status-filter">
              <SelectValue placeholder="Doc Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Docs</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expiring">Expiring</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] bg-black/20" data-testid="supplier-status-filter">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DataTable columns={columns} data={filteredSuppliers} searchPlaceholder="Search suppliers..." searchKey="name" pageSize={5} testId="suppliers-table" />
    </div>
  );
};

// ENHANCED Product Management Section with Supplier Column & Filters
const ProductManagement = ({ products, suppliers, categories, onView, onApprove, onReject, onEdit, onDelete }) => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  // Get unique supplier names from products
  const uniqueSuppliers = [...new Set(products.map(p => p.supplierName))].filter(Boolean);
  
  // Get unique categories from products
  const uniqueCategories = [...new Set(products.map(p => p.category))].filter(Boolean);
  
  const filteredProducts = products.filter(p => {
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    const matchesSupplier = supplierFilter === "all" || p.supplierName === supplierFilter;
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
    return matchesStatus && matchesSupplier && matchesCategory;
  });

  const columns = [
    { 
      key: "name", label: "Product Name",
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <img src={row.image} alt={value} className="h-10 w-14 rounded-sm object-cover bg-muted" />
          <div>
            <p className="font-medium">{value}</p>
            <p className="text-xs text-muted-foreground">{row.subcategory}</p>
          </div>
        </div>
      )
    },
    { 
      key: "supplierName", label: "Supplier",
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{value || 'Unknown'}</span>
        </div>
      )
    },
    { key: "category", label: "Category" },
    { key: "rating", label: "Rating", render: (value) => value > 0 ? <RatingStars rating={value} size="sm" /> : <span className="text-xs text-muted-foreground">No ratings</span> },
    { key: "status", label: "Status", render: (value) => <StatusBadge status={value} /> },
    {
      key: "actions", label: "Actions",
      render: (_, row) => (
        <ActionButtonGroup>
          <ActionButton icon={Eye} label="View" testId={`view-product-${row.id}`} onClick={() => onView(row)} />
          {row.status === "pending" && (
            <>
              <ActionButton icon={Check} label="Approve" className="text-emerald-400 hover:text-emerald-300" testId={`approve-product-${row.id}`} onClick={() => onApprove(row)} />
              <ActionButton icon={X} label="Reject" className="text-red-400 hover:text-red-300" testId={`reject-product-${row.id}`} onClick={() => onReject(row)} />
            </>
          )}
          <ActionButton icon={Edit} label="Edit" testId={`edit-product-${row.id}`} onClick={() => onEdit(row)} />
          <ActionButton icon={Trash2} label="Delete" className="text-red-400 hover:text-red-300" testId={`delete-product-${row.id}`} onClick={() => onDelete(row)} />
        </ActionButtonGroup>
      )
    },
  ];

  return (
    <div className="space-y-6" data-testid="product-management">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold font-['Barlow_Condensed'] uppercase tracking-wide mb-1">Product Management</h1>
          <p className="text-sm text-muted-foreground">Manage product listings and approvals</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Supplier Filter */}
          <Select value={supplierFilter} onValueChange={setSupplierFilter}>
            <SelectTrigger className="w-[180px] bg-black/20" data-testid="product-supplier-filter">
              <SelectValue placeholder="Supplier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Suppliers</SelectItem>
              {uniqueSuppliers.map(supplier => (
                <SelectItem key={supplier} value={supplier}>{supplier}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Category Filter */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px] bg-black/20" data-testid="product-category-filter">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {uniqueCategories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] bg-black/20" data-testid="product-status-filter">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DataTable columns={columns} data={filteredProducts} searchPlaceholder="Search products or suppliers..." searchKey="name" pageSize={5} testId="products-table" />
    </div>
  );
};

// Ratings Moderation Section
const RatingsModeration = ({ ratings, onView, onApprove, onReject, onRemove, onApproveReply, onRejectReply }) => {
  const [statusFilter, setStatusFilter] = useState("all");
  
  const filteredRatings = statusFilter === "all" ? ratings : ratings.filter(r => r.status === statusFilter);

  const columns = [
    { key: "productName", label: "Product" },
    { key: "buyerName", label: "Buyer" },
    { key: "rating", label: "Rating", render: (value) => <RatingStars rating={value} size="sm" /> },
    { key: "review", label: "Review", render: (value) => <p className="text-sm max-w-xs truncate">{value}</p> },
    { 
      key: "supplierReply", label: "Reply",
      render: (value, row) => value ? (
        <div className="flex items-center gap-1">
          <StatusBadge status={row.supplierReplyStatus || 'pending'} />
        </div>
      ) : <span className="text-xs text-muted-foreground">No reply</span>
    },
    { key: "status", label: "Status", render: (value) => <StatusBadge status={value} /> },
    {
      key: "actions", label: "Actions",
      render: (_, row) => (
        <ActionButtonGroup>
          <ActionButton icon={Eye} label="View" testId={`view-rating-${row.id}`} onClick={() => onView(row)} />
          {row.status === "pending" && (
            <>
              <ActionButton icon={Check} label="Approve" className="text-emerald-400 hover:text-emerald-300" testId={`approve-rating-${row.id}`} onClick={() => onApprove(row)} />
              <ActionButton icon={X} label="Reject" className="text-red-400 hover:text-red-300" testId={`reject-rating-${row.id}`} onClick={() => onReject(row)} />
            </>
          )}
          {row.supplierReply && row.supplierReplyStatus === 'pending' && (
            <>
              <ActionButton icon={Check} label="Approve Reply" className="text-blue-400 hover:text-blue-300" onClick={() => onApproveReply(row)} />
              <ActionButton icon={X} label="Reject Reply" className="text-orange-400 hover:text-orange-300" onClick={() => onRejectReply(row)} />
            </>
          )}
          <ActionButton icon={Trash2} label="Remove" className="text-red-400 hover:text-red-300" testId={`remove-rating-${row.id}`} onClick={() => onRemove(row)} />
        </ActionButtonGroup>
      )
    },
  ];

  return (
    <div className="space-y-6" data-testid="ratings-moderation">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-['Barlow_Condensed'] uppercase tracking-wide mb-1">Ratings Moderation</h1>
          <p className="text-sm text-muted-foreground">Review and moderate user ratings and supplier replies</p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px] bg-black/20" data-testid="rating-status-filter">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DataTable columns={columns} data={filteredRatings} searchPlaceholder="Search ratings..." searchKey="productName" pageSize={5} testId="ratings-table" />
    </div>
  );
};

// Category Management Section with Subcategory Support
const CategoryManagement = ({ categories, onEdit, onEditSubcategory, onDelete, onDeleteSubcategory, onAddCategory, onAddSubcategory }) => {
  const [expandedCategories, setExpandedCategories] = useState({});

  const toggleExpand = (catId) => {
    setExpandedCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  return (
    <div className="space-y-6" data-testid="category-management">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-['Barlow_Condensed'] uppercase tracking-wide mb-1">Category Management</h1>
          <p className="text-sm text-muted-foreground">Manage product categories and subcategories</p>
        </div>
        <Button onClick={onAddCategory} className="gap-2" data-testid="add-category-btn">
          <Plus className="h-4 w-4" />Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div key={category.id} className="dashboard-card" data-testid={`category-card-${category.id}`}>
            <div className="dashboard-card-header">
              <button onClick={() => toggleExpand(category.id)} className="flex items-center gap-2 text-left">
                {expandedCategories[category.id] ? <ChevronDown className="h-4 w-4 text-primary" /> : <ChevronRight className="h-4 w-4 text-primary" />}
                <FolderTree className="h-4 w-4 text-primary" />
                <h3 className="dashboard-card-title">{category.name}</h3>
              </button>
              <ActionButtonGroup>
                <ActionButton icon={Plus} label="Add Subcategory" testId={`add-subcategory-${category.id}`} onClick={() => onAddSubcategory(category)} />
                <ActionButton icon={Edit} label="Edit" testId={`edit-category-${category.id}`} onClick={() => onEdit(category)} />
                <ActionButton icon={Trash2} label="Delete" className="text-red-400 hover:text-red-300" testId={`delete-category-${category.id}`} onClick={() => onDelete(category)} />
              </ActionButtonGroup>
            </div>
            <div className="dashboard-card-content">
              <p className="text-xs text-muted-foreground mb-3">{category.productCount} products • {category.subcategories.length} subcategories</p>
              {expandedCategories[category.id] && (
                <div className="space-y-1 mt-3 pt-3 border-t border-border">
                  {category.subcategories.map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between py-1.5 px-2 hover:bg-muted/30 rounded-sm group">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ChevronRight className="h-3 w-3" />
                        {sub.name}
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <ActionButton icon={Edit} label="Edit" className="h-6 w-6" onClick={() => onEditSubcategory({ ...sub, categoryId: category.id })} />
                        <ActionButton icon={Trash2} label="Delete" className="h-6 w-6 text-red-400" onClick={() => onDeleteSubcategory({ ...sub, categoryId: category.id })} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Buyer Management Section
const BuyerManagement = ({ buyers, onView, onSuspend, onDelete }) => {
  const [statusFilter, setStatusFilter] = useState("all");
  
  const filteredBuyers = statusFilter === "all" ? buyers : buyers.filter(b => b.status === statusFilter);

  const columns = [
    { 
      key: "name", label: "Buyer Name",
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-sm bg-primary/20 flex items-center justify-center">
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-medium">{value}</p>
            <p className="text-xs text-muted-foreground">{row.email}</p>
          </div>
        </div>
      )
    },
    { key: "company", label: "Company" },
    { key: "country", label: "Country" },
    { key: "enquiriesSent", label: "Enquiries" },
    { key: "status", label: "Status", render: (value) => <StatusBadge status={value} /> },
    {
      key: "actions", label: "Actions",
      render: (_, row) => (
        <ActionButtonGroup>
          <ActionButton icon={Eye} label="View Profile" testId={`view-buyer-${row.id}`} onClick={() => onView(row)} />
          {row.status === "active" && (
            <ActionButton icon={Ban} label="Suspend" className="text-amber-400 hover:text-amber-300" testId={`suspend-buyer-${row.id}`} onClick={() => onSuspend(row)} />
          )}
          <ActionButton icon={Trash2} label="Delete" className="text-red-400 hover:text-red-300" testId={`delete-buyer-${row.id}`} onClick={() => onDelete(row)} />
        </ActionButtonGroup>
      )
    },
  ];

  return (
    <div className="space-y-6" data-testid="buyer-management">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-['Barlow_Condensed'] uppercase tracking-wide mb-1">Buyer Management</h1>
          <p className="text-sm text-muted-foreground">Manage buyer accounts and activities</p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px] bg-black/20" data-testid="buyer-status-filter">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DataTable columns={columns} data={filteredBuyers} searchPlaceholder="Search buyers..." searchKey="name" pageSize={5} testId="buyers-table" />
    </div>
  );
};

// Platform Insights Section
const PlatformInsights = ({ analyticsData }) => {
  return (
    <div className="space-y-6" data-testid="platform-insights">
      <div>
        <h1 className="text-2xl font-bold font-['Barlow_Condensed'] uppercase tracking-wide mb-1">Platform Insights</h1>
        <p className="text-sm text-muted-foreground">Analytics and trends across the platform</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="dashboard-card">
          <div className="dashboard-card-header"><h3 className="dashboard-card-title">Most Searched Components</h3></div>
          <div className="dashboard-card-content">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={analyticsData.mostSearchedComponents}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#666" fontSize={11} />
                <YAxis stroke="#666" fontSize={11} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="searches" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Searches" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="dashboard-card">
          <div className="dashboard-card-header"><h3 className="dashboard-card-title">Most Active Suppliers</h3></div>
          <div className="dashboard-card-content">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={analyticsData.mostActiveSuppliers}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#666" fontSize={11} />
                <YAxis stroke="#666" fontSize={11} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="products" fill="#3b82f6" name="Products" />
                <Bar dataKey="enquiries" fill="#10b981" name="Enquiries" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="dashboard-card lg:col-span-2">
          <div className="dashboard-card-header"><h3 className="dashboard-card-title">Monthly Enquiries Trend</h3></div>
          <div className="dashboard-card-content">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={analyticsData.monthlyEnquiries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="month" stroke="#666" fontSize={11} />
                <YAxis stroke="#666" fontSize={11} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="enquiries" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} name="Enquiries" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
