import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DataTable } from "@/components/shared/DataTable";
import { ActionButton, ActionButtonGroup } from "@/components/shared/ActionButton";
import { Eye, Calendar, User, Building2, Package, Hash } from "lucide-react";
import { useGetEnquiriesQuery } from "@/store/api/admin/enquiryApi";

export const EnquiryManagement = () => {
  const { data: enquiries = [], isLoading } = useGetEnquiriesQuery();
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewSheet, setViewSheet] = useState({ open: false, item: null });

  const filteredEnquiries = statusFilter === "all"
    ? enquiries
    : enquiries.filter((enquiry) => enquiry.status === statusFilter);

  const columns = [
    { key: "buyerName", label: "Buyer", render: (value, row) => <div><p className="font-medium">{value}</p><p className="text-xs text-muted-foreground">{row.buyerCompany}</p></div> },
    { key: "supplierName", label: "Supplier" },
    { key: "productName", label: "Product" },
    { key: "message", label: "Message", render: (value) => <p className="text-sm max-w-xs truncate">{value}</p> },
    { key: "date", label: "Date" },
    { key: "status", label: "Status", render: (value) => <StatusBadge status={value} /> },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <ActionButtonGroup>
          <ActionButton icon={Eye} label="View" testId={`view-admin-enquiry-${row.id}`} onClick={() => setViewSheet({ open: true, item: row })} />
        </ActionButtonGroup>
      ),
    },
  ];

  if (isLoading) return <p>Loading enquiries...</p>;

  return (
    <>
      <div className="space-y-6" data-testid="admin-enquiry-management">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold font-['Barlow_Condensed'] uppercase tracking-wide mb-1">Enquiry Management</h1>
            <p className="text-sm text-muted-foreground">Monitor buyer enquiries across suppliers</p>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] bg-black/20" data-testid="admin-enquiry-status-filter">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="replied">Replied</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DataTable columns={columns} data={filteredEnquiries} searchPlaceholder="Search enquiries..." searchKey="buyerName" pageSize={10} testId="admin-enquiries-table" />
      </div>

      <Sheet open={viewSheet.open} onOpenChange={(open) => setViewSheet({ ...viewSheet, open })}>
        <SheetContent className="w-[520px] sm:max-w-[520px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">Enquiry Details</SheetTitle>
          </SheetHeader>

          {viewSheet.item && (
            <div className="mt-6 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">{viewSheet.item.productName || "N/A"}</h3>
                  <p className="text-sm text-muted-foreground">ID: {viewSheet.item.id}</p>
                </div>
                <StatusBadge status={viewSheet.item.status} />
              </div>

              <Separator />

              <div className="grid grid-cols-1 gap-3">
                <div className="p-4 bg-muted/30 rounded-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-4 w-4 text-primary" />
                    <span className="font-medium">{viewSheet.item.buyerName || "N/A"}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{viewSheet.item.buyerCompany || "Buyer company not available"}</p>
                  <p className="text-xs text-muted-foreground mt-1">Buyer ID: {viewSheet.item.buyerId || "N/A"}</p>
                </div>

                <div className="p-4 bg-muted/30 rounded-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="h-4 w-4 text-primary" />
                    <span className="font-medium">{viewSheet.item.supplierName || "N/A"}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Supplier ID: {viewSheet.item.supplierId || "N/A"}</p>
                </div>

                <div className="p-4 bg-muted/30 rounded-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="h-4 w-4 text-primary" />
                    <span className="font-medium">{viewSheet.item.productName || "N/A"}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Product ID: {viewSheet.item.productId || "N/A"}</p>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Buyer Message</h4>
                <p className="text-sm leading-relaxed p-3 bg-muted/20 rounded-sm">{viewSheet.item.message || "No message available"}</p>
              </div>

              {viewSheet.item.reply && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Supplier Reply</h4>
                    <p className="text-sm leading-relaxed p-3 bg-primary/10 rounded-sm">{viewSheet.item.reply}</p>
                    <p className="text-xs text-muted-foreground mt-1">Sent on {viewSheet.item.replyDate || "N/A"}</p>
                  </div>
                </>
              )}

              <Separator />

              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Received on {viewSheet.item.date || "N/A"}
                </div>
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Current status: {viewSheet.item.status || "N/A"}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
