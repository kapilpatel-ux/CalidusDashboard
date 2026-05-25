import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DataTable } from "@/components/shared/DataTable";
import { ActionButton, ActionButtonGroup } from "@/components/shared/ActionButton";
import { Building2, Calendar, Eye, Hash, Mail, MapPin, Package, Plus, Send, User } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/App";
import { currentBuyer } from "@/data/mockData";
import { useGetProductsQuery } from "@/store/api/admin/productApi";
import {
  useCreateBuyerEnquiryMutation,
  useGetBuyerEnquiriesQuery,
} from "@/store/api/buyer/buyerEnquiryApi";

export const BuyerEnquiries = () => {
  const { currentUser } = useAuth();
  const [statusFilter, setStatusFilter] = useState("all");
  const [newEnquiryDialog, setNewEnquiryDialog] = useState(false);
  const [viewSheet, setViewSheet] = useState({ open: false, item: null });
  const [newEnquiry, setNewEnquiry] = useState({ productId: "", message: "" });
  const buyerId = currentUser?.profileId || currentBuyer.id;
  const { data: enquiries = [], isLoading: isEnquiriesLoading, isError: isEnquiriesError } = useGetBuyerEnquiriesQuery(buyerId);
  const { data: products = [], isLoading: isProductsLoading } = useGetProductsQuery();
  const [createBuyerEnquiry, { isLoading: isCreating }] = useCreateBuyerEnquiryMutation();
  const approvedProducts = products.filter((product) => product.status === "approved");
  const selectedProduct = approvedProducts.find((product) => product.id === newEnquiry.productId);
  const selectedProductLabel = selectedProduct
    ? `${selectedProduct.name} - ${selectedProduct.supplierName}`
    : "Choose a product";

  const filteredEnquiries = statusFilter === "all"
    ? enquiries
    : enquiries.filter((enquiry) => enquiry.status === statusFilter);

  const handleSendEnquiry = async () => {
    if (newEnquiry.productId && newEnquiry.message.trim()) {
      try {
        await createBuyerEnquiry({
          buyerId,
          payload: {
            productId: newEnquiry.productId,
            message: newEnquiry.message,
          },
        }).unwrap();
        toast.success("Enquiry sent successfully");
        setNewEnquiry({ productId: "", message: "" });
        setNewEnquiryDialog(false);
      } catch (error) {
        toast.error(error?.data?.message || "Unable to send enquiry");
      }
    }
  };

  const columns = [
    { key: "productName", label: "Product" },
    { key: "supplierName", label: "Supplier" },
    { key: "message", label: "Message", render: (value) => <p className="text-sm max-w-xs truncate">{value}</p> },
    { key: "date", label: "Date" },
    { key: "status", label: "Status", render: (value) => <StatusBadge status={value} /> },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <ActionButtonGroup>
          <ActionButton
            icon={Eye}
            label="View Enquiry"
            testId={`view-enquiry-${row.id}`}
            onClick={() => setViewSheet({ open: true, item: row })}
          />
        </ActionButtonGroup>
      ),
    },
  ];

  const DetailItem = ({ label, value, icon: Icon }) => (
    <div className="rounded-sm border border-border bg-black/20 px-3 py-3">
      <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-medium">{value || "Not available"}</p>
    </div>
  );

  const selectedEnquiry = viewSheet.item || {};

  return (
    <>
      <div className="space-y-6" data-testid="buyer-enquiries">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold font-['Barlow_Condensed'] uppercase tracking-wide mb-1">My Enquiries</h1>
            <p className="text-sm text-muted-foreground">Track your enquiry history and responses</p>
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] bg-black/20" data-testid="enquiry-status-filter">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="replied">Replied</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setNewEnquiryDialog(true)} className="gap-2" data-testid="new-enquiry-btn">
              <Plus className="h-4 w-4" />
              New Enquiry
            </Button>
          </div>
        </div>
        {isEnquiriesLoading ? (
          <div className="dashboard-card">
            <div className="dashboard-card-content py-8 text-center text-sm text-muted-foreground">
              Loading enquiries...
            </div>
          </div>
        ) : isEnquiriesError ? (
          <div className="dashboard-card">
            <div className="dashboard-card-content py-8 text-center text-sm text-destructive">
              Unable to load enquiries.
            </div>
          </div>
        ) : (
          <DataTable columns={columns} data={filteredEnquiries} searchPlaceholder="Search enquiries..." searchKey="productName" pageSize={10} testId="buyer-enquiries-table" />
        )}
      </div>

      <Dialog open={newEnquiryDialog} onOpenChange={setNewEnquiryDialog}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-lg min-w-0 overflow-hidden">
          <DialogHeader className="min-w-0">
            <DialogTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">Send New Enquiry</DialogTitle>
            <DialogDescription>Send an enquiry to a supplier about a specific product</DialogDescription>
          </DialogHeader>
          <div className="min-w-0 space-y-4 py-4">
            <div className="min-w-0">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Select Product *</Label>
              <Select value={newEnquiry.productId} onValueChange={(value) => setNewEnquiry({ ...newEnquiry, productId: value })}>
                <SelectTrigger className="mt-1 w-full min-w-0 max-w-full overflow-hidden bg-black/20 [&>svg]:shrink-0" data-testid="enquiry-product-select">
                  <span className="block min-w-0 flex-1 truncate text-left">
                    {selectedProductLabel}
                  </span>
                </SelectTrigger>
                <SelectContent
                  align="start"
                  sideOffset={6}
                  className="w-[var(--radix-select-trigger-width)] max-w-[calc(100vw-2rem)] overflow-x-hidden"
                >
                  {approvedProducts.map((product) => (
                    <SelectItem key={product.id} value={product.id} className="min-w-0 whitespace-normal break-words pr-8">
                      <span className="min-w-0 break-words">
                        {product.name} - {product.supplierName}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isProductsLoading && <p className="text-xs text-muted-foreground mt-2">Loading products...</p>}
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Message *</Label>
              <Textarea
                value={newEnquiry.message}
                onChange={(event) => setNewEnquiry({ ...newEnquiry, message: event.target.value })}
                placeholder="Type your enquiry message..."
                className="mt-1 min-h-[150px] w-full max-w-full bg-black/20"
                data-testid="enquiry-message"
              />
            </div>
          </div>
          <DialogFooter className="min-w-0 flex-wrap gap-2">
            <Button variant="outline" onClick={() => setNewEnquiryDialog(false)}>Cancel</Button>
            <Button onClick={handleSendEnquiry} disabled={isCreating} className="gap-2" data-testid="send-enquiry-btn">
              <Send className="h-4 w-4" />
              {isCreating ? "Sending..." : "Send Enquiry"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={viewSheet.open} onOpenChange={(open) => setViewSheet({ ...viewSheet, open })}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">Enquiry Details</SheetTitle>
          </SheetHeader>
          {viewSheet.item && (
            <div className="mt-6 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold">{selectedEnquiry.productName || "Product not available"}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Enquiry ID: {selectedEnquiry.id || "Not available"}
                  </p>
                </div>
                <StatusBadge status={selectedEnquiry.status} />
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-semibold uppercase tracking-wide">Product Information</h4>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailItem label="Product Name" value={selectedEnquiry.productName} icon={Package} />
                  <DetailItem label="Product ID" value={selectedEnquiry.productId} icon={Hash} />
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-semibold uppercase tracking-wide">Supplier Information</h4>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailItem label="Supplier Name" value={selectedEnquiry.supplierName} icon={Building2} />
                  <DetailItem label="Supplier ID" value={selectedEnquiry.supplierId} icon={Hash} />
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-semibold uppercase tracking-wide">Buyer Information</h4>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailItem label="Buyer Name" value={selectedEnquiry.buyerName} icon={User} />
                  <DetailItem label="Buyer Company" value={selectedEnquiry.buyerCompany} icon={Building2} />
                  <DetailItem label="Buyer Email" value={selectedEnquiry.buyerEmail} icon={Mail} />
                  <DetailItem label="Buyer Country" value={selectedEnquiry.buyerCountry} icon={MapPin} />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Your Message</h4>
                <p className="min-h-[110px] whitespace-pre-wrap rounded-sm border border-border bg-muted/20 p-4 text-sm leading-6">
                  {selectedEnquiry.message || "No message available."}
                </p>
              </div>

              {selectedEnquiry.reply ? (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Supplier's Reply</h4>
                    <div className="rounded-sm border border-primary/20 bg-primary/10 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">{selectedEnquiry.supplierName || "Supplier"}</span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-6">{selectedEnquiry.reply}</p>
                      <p className="mt-3 text-xs text-muted-foreground">
                        Reply Date: {selectedEnquiry.replyDate || "Not available"}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-sm border border-dashed border-border bg-black/20 p-4 text-sm text-muted-foreground">
                  Supplier has not replied yet.
                </div>
              )}

              <Separator />
              <div className="grid gap-3 sm:grid-cols-2">
                <DetailItem label="Sent Date" value={selectedEnquiry.date} icon={Calendar} />
                <DetailItem label="Current Status" value={selectedEnquiry.status} />
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
