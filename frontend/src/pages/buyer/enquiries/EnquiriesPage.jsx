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
import { Building2, Calendar, Eye, Plus, Send } from "lucide-react";
import { toast } from "sonner";
import { currentBuyer } from "@/data/mockData";
import { useGetProductsQuery } from "@/store/api/admin/productApi";
import {
  useCreateBuyerEnquiryMutation,
  useGetBuyerEnquiriesQuery,
} from "@/store/api/buyer/buyerEnquiryApi";

export const BuyerEnquiries = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [newEnquiryDialog, setNewEnquiryDialog] = useState(false);
  const [viewSheet, setViewSheet] = useState({ open: false, item: null });
  const [newEnquiry, setNewEnquiry] = useState({ productId: "", message: "" });
  const buyerId = currentBuyer.id;
  const { data: enquiries = [], isLoading: isEnquiriesLoading, isError: isEnquiriesError } = useGetBuyerEnquiriesQuery(buyerId);
  const { data: products = [], isLoading: isProductsLoading } = useGetProductsQuery();
  const [createBuyerEnquiry, { isLoading: isCreating }] = useCreateBuyerEnquiryMutation();
  const approvedProducts = products.filter((product) => product.status === "approved");

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
          <DataTable columns={columns} data={filteredEnquiries} searchPlaceholder="Search enquiries..." searchKey="productName" pageSize={5} testId="buyer-enquiries-table" />
        )}
      </div>

      <Dialog open={newEnquiryDialog} onOpenChange={setNewEnquiryDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">Send New Enquiry</DialogTitle>
            <DialogDescription>Send an enquiry to a supplier about a specific product</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Select Product *</Label>
              <Select value={newEnquiry.productId} onValueChange={(value) => setNewEnquiry({ ...newEnquiry, productId: value })}>
                <SelectTrigger className="bg-black/20 mt-1" data-testid="enquiry-product-select">
                  <SelectValue placeholder="Choose a product" />
                </SelectTrigger>
                <SelectContent>
                  {approvedProducts.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - {product.supplierName}
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
                className="bg-black/20 mt-1 min-h-[150px]"
                data-testid="enquiry-message"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewEnquiryDialog(false)}>Cancel</Button>
            <Button onClick={handleSendEnquiry} disabled={isCreating} className="gap-2" data-testid="send-enquiry-btn">
              <Send className="h-4 w-4" />
              {isCreating ? "Sending..." : "Send Enquiry"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={viewSheet.open} onOpenChange={(open) => setViewSheet({ ...viewSheet, open })}>
        <SheetContent className="w-[500px] sm:max-w-[500px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">Enquiry Details</SheetTitle>
          </SheetHeader>
          {viewSheet.item && (
            <div className="mt-6 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{viewSheet.item.productName}</h3>
                  <p className="text-sm text-muted-foreground">to {viewSheet.item.supplierName}</p>
                </div>
                <StatusBadge status={viewSheet.item.status} />
              </div>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Your Message</h4>
                <p className="text-sm leading-relaxed p-3 bg-muted/20 rounded-sm">{viewSheet.item.message}</p>
              </div>
              {viewSheet.item.reply && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Supplier's Reply</h4>
                    <div className="p-3 bg-primary/10 rounded-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">{viewSheet.item.supplierName}</span>
                      </div>
                      <p className="text-sm leading-relaxed">{viewSheet.item.reply}</p>
                    </div>
                  </div>
                </>
              )}
              <Separator />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Sent on {viewSheet.item.date}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
