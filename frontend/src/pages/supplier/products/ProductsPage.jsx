import { useState } from "react";
import { toast } from "sonner";
import { Edit, Eye, Package, Plus, Trash2 } from "lucide-react";
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
import { useAuth } from "@/App";
import { currentSupplier } from "@/data/mockData";
import {
  useCreateSupplierProductMutation,
  useDeleteSupplierProductMutation,
  useGetSupplierProductsQuery,
  useUpdateSupplierProductMutation,
} from "@/store/api/supplier/supplierProductApi";

const emptyEditForm = {
  name: "",
  category: "",
  countryOfOrigin: "",
  keyFeatures: "",
  supplierName: "",
  supplierCountry: "",
  yearsInBusiness: "",
  activeProducts: "",
  layerCount: "",
  material: "",
  coating: "",
  temperatureRange: "",
  ipcClass: "",
  dimensions: "",
  weight: "",
  operatingTemperature: "",
  operationalRange: "",
  applicationUseCase: "",
};

const emptyAddForm = {
  name: "",
  category: "",
  countryOfOrigin: "",
  keyFeatures: "",
  supplierName: "",
  supplierCountry: "",
  yearsInBusiness: "",
  activeProducts: "",
  layerCount: "",
  material: "",
  coating: "",
  temperatureRange: "",
  ipcClass: "",
  dimensions: "",
  weight: "",
  operatingTemperature: "",
  operationalRange: "",
  applicationUseCase: "",
};

const productCategories = ["Electronics", "Aerospace", "Defense", "PCB", "Mechanical", "Communication", "General"];
const countryOptions = ["India", "United States", "United Kingdom", "Germany", "France", "Israel", "Singapore", "Japan"];
const applicationAreas = ["Aerospace", "Defense", "Industrial", "Naval", "Avionics", "Communication", "Automotive"];

const FormSection = ({ title, children }) => (
  <section className="bg-[#101214]">
    <div className="border-b border-[#29292E] px-5 py-5">
      <h2 className="font-['Barlow_Condensed'] text-[22px] font-semibold uppercase leading-none text-white">{title}</h2>
    </div>
    <div className="grid gap-x-8 gap-y-8 px-5 py-8 md:grid-cols-2">{children}</div>
  </section>
);

const ProductTextField = ({ label, value, onChange, placeholder, required = false }) => {
  const fieldId = `add-product-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <div className="space-y-3">
      <Label htmlFor={fieldId} className="text-[13px] font-medium uppercase tracking-normal text-[#A1A1AA] sm:text-[18px]">
        {label}
        {required && <span className="ml-1 text-[#3C83F6]">*</span>}
      </Label>
      <Input
        id={fieldId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-[51px] rounded-[5px] border-[#29292E] bg-[#0E1012] px-[15px] text-base text-white placeholder:text-[#9D9DA5]"
      />
    </div>
  );
};

const ProductSelectField = ({ label, value, onChange, placeholder, options, required = false }) => {
  const fieldId = `add-product-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <div className="space-y-3">
      <Label htmlFor={fieldId} className="text-[13px] font-medium uppercase tracking-normal text-[#A1A1AA] sm:text-[18px]">
        {label}
        {required && <span className="ml-1 text-[#3C83F6]">*</span>}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={fieldId} className="h-[51px] rounded-[5px] border-[#29292E] bg-[#0E1012] px-[15px] text-base text-[#9D9DA5]">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

const technicalSpecsToList = (technicalSpecs) =>
  technicalSpecs
    .split("\n")
    .map((specification) => specification.trim())
    .filter(Boolean);

const formatDetailLabel = (label) =>
  label
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (character) => character.toUpperCase());

const objectEntriesToDetails = (details = {}) =>
  Object.entries(details).filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== "");

export const SupplierProducts = () => {
  const { currentUser } = useAuth();
  const supplierId = currentUser?.profileId || currentSupplier.id;
  const { data: products = [], isLoading, isError } = useGetSupplierProductsQuery(supplierId);
  const [createSupplierProduct, { isLoading: isCreating }] = useCreateSupplierProductMutation();
  const [updateSupplierProduct, { isLoading: isSaving }] = useUpdateSupplierProductMutation();
  const [deleteSupplierProduct, { isLoading: isDeleting }] = useDeleteSupplierProductMutation();
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewSheet, setViewSheet] = useState({ open: false, product: null });
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialog, setEditDialog] = useState({ open: false, product: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, product: null });
  const [addForm, setAddForm] = useState(emptyAddForm);
  const [editForm, setEditForm] = useState(emptyEditForm);

  const getProductId = (product) => product?.id || product?._id;
  const setAddField = (field, value) => setAddForm((current) => ({ ...current, [field]: value }));
  const setEditField = (field, value) => setEditForm((current) => ({ ...current, [field]: value }));

  const resetAddDialog = (open) => {
    setAddDialogOpen(open);
    if (!open) setAddForm(emptyAddForm);
  };

  const openEditDialog = (product) => {
    const supplierSnapshot = product.supplierSnapshot || {};
    const technicalDetails = product.technicalSpecificationDetails || {};

    setEditForm({
      name: product.name || "",
      category: product.category || "",
      countryOfOrigin: product.countryOfOrigin || "",
      keyFeatures: product.shortDescription || product.description || "",
      supplierName: supplierSnapshot.name || product.supplierName || currentSupplier.name || "",
      supplierCountry: supplierSnapshot.country || product.supplierCountry || product.countryOfOrigin || "",
      yearsInBusiness: supplierSnapshot.yearsInBusiness || "",
      activeProducts: supplierSnapshot.activeProducts || "",
      layerCount: technicalDetails.layerCount || "",
      material: technicalDetails.material || "",
      coating: technicalDetails.coating || "",
      temperatureRange: technicalDetails.temperatureRange || "",
      ipcClass: technicalDetails.ipcClass || "",
      dimensions: technicalDetails.dimensions || "",
      weight: technicalDetails.weight || "",
      operatingTemperature: technicalDetails.operatingTemperature || "",
      operationalRange: technicalDetails.operationalRange || "",
      applicationUseCase: product.applicationUseCase || "",
    });
    setEditDialog({ open: true, product });
  };

  const buildProductPayload = (form) => {
    const specifications = [
      form.layerCount && `Layer Count: ${form.layerCount}`,
      form.material && `Material: ${form.material}`,
      form.coating && `Coating: ${form.coating}`,
      form.temperatureRange && `Temperature Range: ${form.temperatureRange}`,
      form.ipcClass && `IPC Class: ${form.ipcClass}`,
      form.dimensions && `Dimensions: ${form.dimensions}`,
      form.weight && `Weight: ${form.weight}`,
      form.operatingTemperature && `Operating Temperature: ${form.operatingTemperature}`,
      form.operationalRange && `Operational Range: ${form.operationalRange}`,
      form.applicationUseCase && `Application Areas: ${form.applicationUseCase}`,
    ].filter(Boolean);

    return {
      name: form.name.trim(),
      category: form.category,
      countryOfOrigin: form.countryOfOrigin,
      shortDescription: form.keyFeatures,
      description: form.keyFeatures,
      specifications,
      technicalSpecs: specifications.join("\n"),
      applicationUseCase: form.applicationUseCase,
      supplierSnapshot: {
        name: form.supplierName,
        country: form.supplierCountry,
        yearsInBusiness: form.yearsInBusiness,
        activeProducts: form.activeProducts,
      },
      technicalSpecificationDetails: {
        layerCount: form.layerCount,
        material: form.material,
        coating: form.coating,
        temperatureRange: form.temperatureRange,
        ipcClass: form.ipcClass,
        dimensions: form.dimensions,
        weight: form.weight,
        operatingTemperature: form.operatingTemperature,
        operationalRange: form.operationalRange,
      },
    };
  };

  const saveProduct = async () => {
    const productId = getProductId(editDialog.product);
    if (!productId) {
      toast.error("Product id missing");
      return;
    }

    if (!editForm.name.trim() || !editForm.category.trim()) {
      toast.error("Product name and category are required");
      return;
    }

    const payload = buildProductPayload(editForm);

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

  const createProduct = async () => {
    if (!addForm.name.trim() || !addForm.category.trim()) {
      toast.error("Product name and category are required");
      return;
    }

    const payload = buildProductPayload(addForm);

    try {
      const createdProduct = await createSupplierProduct({ supplierId, payload }).unwrap();
      resetAddDialog(false);
      toast.success(`Product "${createdProduct.name}" created for review`);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to create product");
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

  const selectedProductId = getProductId(viewSheet.product);
  const detailProduct = selectedProductId
    ? products.find((product) => getProductId(product) === selectedProductId) || viewSheet.product
    : viewSheet.product;
  const supplierSnapshotDetails = objectEntriesToDetails(detailProduct?.supplierSnapshot);
  const technicalSpecificationDetails = objectEntriesToDetails(detailProduct?.technicalSpecificationDetails);

  return (
    <div className="space-y-6" data-testid="supplier-product-management">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold font-['Barlow_Condensed'] uppercase tracking-wide mb-1">Product Management</h1>
          <p className="text-sm text-muted-foreground">Manage your product listings</p>
        </div>
        <Button onClick={() => resetAddDialog(true)} className="h-10 bg-[#3C83F6] px-5 text-sm font-semibold hover:bg-[#2f72df]" data-testid="supplier-add-product-button">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
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
        <DataTable
          columns={columns}
          data={filteredProducts}
          searchPlaceholder="Search products..."
          searchKey="name"
          pageSize={5}
          testId="supplier-products-table"
          toolbarRight={
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
          }
        />
      )}

      <Dialog open={addDialogOpen} onOpenChange={resetAddDialog}>
        <DialogContent className="max-h-[90vh] max-w-6xl overflow-y-auto border-[#29292E] bg-[#090B0A] p-0 text-white">
          <DialogHeader className="px-6 pt-6 sm:px-8">
            <DialogTitle className="font-['Barlow_Condensed'] text-3xl font-semibold uppercase leading-none">Add New Product</DialogTitle>
            <DialogDescription className="sr-only">Create a product listing for admin review.</DialogDescription>
          </DialogHeader>

          <div className="space-y-7 px-6 pb-6 sm:px-8 sm:pb-8">
            <FormSection title="Overview">
              <ProductTextField label="Product Name" value={addForm.name} onChange={(value) => setAddField("name", value)} placeholder="Enter product name" required />
              <ProductSelectField label="Category" value={addForm.category} onChange={(value) => setAddField("category", value)} placeholder="Select category" options={productCategories} required />
              <ProductSelectField label="Country" value={addForm.countryOfOrigin} onChange={(value) => setAddField("countryOfOrigin", value)} placeholder="Select country" options={countryOptions} />
              <ProductTextField label="Key Features" value={addForm.keyFeatures} onChange={(value) => setAddField("keyFeatures", value)} placeholder="Enter key features" />
            </FormSection>

            <FormSection title="Supplier Snapshot">
              <ProductTextField label="Supplier Name" value={addForm.supplierName} onChange={(value) => setAddField("supplierName", value)} placeholder="Enter supplier name" />
              <ProductSelectField label="Country" value={addForm.supplierCountry} onChange={(value) => setAddField("supplierCountry", value)} placeholder="Select country" options={countryOptions} />
              <ProductTextField label="Years in Business" value={addForm.yearsInBusiness} onChange={(value) => setAddField("yearsInBusiness", value)} placeholder="Enter years in business" />
              <ProductTextField label="Active Products" value={addForm.activeProducts} onChange={(value) => setAddField("activeProducts", value)} placeholder="Enter active products" />
            </FormSection>

            <FormSection title="Technical Specifications">
              <ProductTextField label="Layer Count" value={addForm.layerCount} onChange={(value) => setAddField("layerCount", value)} placeholder="Up to 24 layers" />
              <ProductTextField label="Material" value={addForm.material} onChange={(value) => setAddField("material", value)} placeholder="FR-4 / Polyimide" />
              <ProductTextField label="Coating" value={addForm.coating} onChange={(value) => setAddField("coating", value)} placeholder="MIL-I-46058 Conformal" />
              <ProductTextField label="Temperature Range" value={addForm.temperatureRange} onChange={(value) => setAddField("temperatureRange", value)} placeholder="-55C to +125C" />
              <ProductTextField label="IPC Class" value={addForm.ipcClass} onChange={(value) => setAddField("ipcClass", value)} placeholder="Class 3 (Military)" />
              <ProductTextField label="Dimensions" value={addForm.dimensions} onChange={(value) => setAddField("dimensions", value)} placeholder="Custom" />
              <ProductTextField label="Weight" value={addForm.weight} onChange={(value) => setAddField("weight", value)} placeholder="Variable" />
              <ProductTextField label="Operating Temperature" value={addForm.operatingTemperature} onChange={(value) => setAddField("operatingTemperature", value)} placeholder="-55C to +125C" />
              <ProductTextField label="Operational Range" value={addForm.operationalRange} onChange={(value) => setAddField("operationalRange", value)} placeholder="N/A" />
              <ProductSelectField label="Application Areas" value={addForm.applicationUseCase} onChange={(value) => setAddField("applicationUseCase", value)} placeholder="Select application areas" options={applicationAreas} />
            </FormSection>
          </div>

          <DialogFooter className="border-t border-[#29292E] px-6 py-5 sm:px-8">
            <Button variant="outline" className="border-[#29292E] bg-transparent text-white hover:bg-white/10 hover:text-white" onClick={() => resetAddDialog(false)} disabled={isCreating}>Cancel</Button>
            <Button onClick={createProduct} disabled={isCreating || !addForm.name.trim() || !addForm.category.trim()} className="bg-[#3C83F6] px-6 text-white hover:bg-[#2f72df]" data-testid="supplier-add-product-submit">
              {isCreating ? "Adding..." : "Add Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

              {detailProduct.applicationUseCase && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Application Areas</p>
                  <p className="mt-1 text-sm leading-6">{detailProduct.applicationUseCase}</p>
                </div>
              )}

              {supplierSnapshotDetails.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Supplier Snapshot</p>
                  <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                    {supplierSnapshotDetails.map(([key, value]) => (
                      <div key={key} className="rounded-sm border border-border bg-black/20 px-3 py-2">
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{formatDetailLabel(key)}</p>
                        <p className="mt-1 font-medium">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {technicalSpecificationDetails.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Technical Specification Details</p>
                  <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                    {technicalSpecificationDetails.map(([key, value]) => (
                      <div key={key} className="rounded-sm border border-border bg-black/20 px-3 py-2">
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{formatDetailLabel(key)}</p>
                        <p className="mt-1 font-medium">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
        <DialogContent className="flex max-h-[95vh] max-w-6xl flex-col overflow-hidden border-[#29292E] bg-[#090B0A] p-0 text-white">
          <DialogHeader className="shrink-0 px-6 pt-6 sm:px-8">
            <DialogTitle className="font-['Barlow_Condensed'] text-3xl font-semibold uppercase leading-none">Edit Product</DialogTitle>
            <DialogDescription className="text-[#A1A1AA]">Changes to an approved listing will move it back to pending review.</DialogDescription>
          </DialogHeader>

          <div className="flex-1 space-y-7 overflow-y-auto px-6 py-6 sm:px-8">
            <FormSection title="Overview">
              <ProductTextField label="Product Name" value={editForm.name} onChange={(value) => setEditField("name", value)} placeholder="Enter product name" required />
              <ProductSelectField label="Category" value={editForm.category} onChange={(value) => setEditField("category", value)} placeholder="Select category" options={productCategories} required />
              <ProductSelectField label="Country" value={editForm.countryOfOrigin} onChange={(value) => setEditField("countryOfOrigin", value)} placeholder="Select country" options={countryOptions} />
              <ProductTextField label="Key Features" value={editForm.keyFeatures} onChange={(value) => setEditField("keyFeatures", value)} placeholder="Enter key features" />
            </FormSection>

            <FormSection title="Supplier Snapshot">
              <ProductTextField label="Supplier Name" value={editForm.supplierName} onChange={(value) => setEditField("supplierName", value)} placeholder="Enter supplier name" />
              <ProductSelectField label="Country" value={editForm.supplierCountry} onChange={(value) => setEditField("supplierCountry", value)} placeholder="Select country" options={countryOptions} />
              <ProductTextField label="Years in Business" value={editForm.yearsInBusiness} onChange={(value) => setEditField("yearsInBusiness", value)} placeholder="Enter years in business" />
              <ProductTextField label="Active Products" value={editForm.activeProducts} onChange={(value) => setEditField("activeProducts", value)} placeholder="Enter active products" />
            </FormSection>

            <FormSection title="Technical Specifications">
              <ProductTextField label="Layer Count" value={editForm.layerCount} onChange={(value) => setEditField("layerCount", value)} placeholder="Up to 24 layers" />
              <ProductTextField label="Material" value={editForm.material} onChange={(value) => setEditField("material", value)} placeholder="FR-4 / Polyimide" />
              <ProductTextField label="Coating" value={editForm.coating} onChange={(value) => setEditField("coating", value)} placeholder="MIL-I-46058 Conformal" />
              <ProductTextField label="Temperature Range" value={editForm.temperatureRange} onChange={(value) => setEditField("temperatureRange", value)} placeholder="-55C to +125C" />
              <ProductTextField label="IPC Class" value={editForm.ipcClass} onChange={(value) => setEditField("ipcClass", value)} placeholder="Class 3 (Military)" />
              <ProductTextField label="Dimensions" value={editForm.dimensions} onChange={(value) => setEditField("dimensions", value)} placeholder="Custom" />
              <ProductTextField label="Weight" value={editForm.weight} onChange={(value) => setEditField("weight", value)} placeholder="Variable" />
              <ProductTextField label="Operating Temperature" value={editForm.operatingTemperature} onChange={(value) => setEditField("operatingTemperature", value)} placeholder="-55C to +125C" />
              <ProductTextField label="Operational Range" value={editForm.operationalRange} onChange={(value) => setEditField("operationalRange", value)} placeholder="N/A" />
              <ProductSelectField label="Application Areas" value={editForm.applicationUseCase} onChange={(value) => setEditField("applicationUseCase", value)} placeholder="Select application areas" options={applicationAreas} />
            </FormSection>
          </div>

          <DialogFooter className="shrink-0 border-t border-[#29292E] px-6 py-5 sm:px-8">
            <Button variant="outline" className="border-[#29292E] bg-transparent text-white hover:bg-white/10 hover:text-white" onClick={() => setEditDialog({ open: false, product: null })} disabled={isSaving}>Cancel</Button>
            <Button onClick={saveProduct} disabled={isSaving || !editForm.name.trim() || !editForm.category.trim()} className="bg-[#3C83F6] px-6 text-white hover:bg-[#2f72df]" data-testid="supplier-edit-product-save">
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
