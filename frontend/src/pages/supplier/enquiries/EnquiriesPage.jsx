import { useState } from "react";
import { ArrowDown, ArrowUp, Calendar, CheckCircle, Clock, MessageSquare, Send, User, Eye, Package, Building2, Mail, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DataTable } from "@/components/shared/DataTable";
import { ActionButton, ActionButtonGroup } from "@/components/shared/ActionButton";
import { useAuth } from "@/App";
import {
  useGetSupplierEnquiriesQuery,
  useReplyToSupplierEnquiryMutation,
  useUpdateSupplierEnquiryStatusMutation,
} from "@/store/api/supplier/supplierEnquiryApi";

const extractEnquiryMessage = (enquiry) => {
  const candidates = [
    enquiry?.message,
    enquiry?.enquiryMessage,
    enquiry?.buyerMessage,
    enquiry?.details,
    enquiry?.description,
  ];

  const pick = (value) => {
    if (typeof value === "string") return value;
    if (Array.isArray(value)) return value.filter(Boolean).join("\n");
    if (value && typeof value === "object") {
      if (typeof value.message === "string") return value.message;
      if (typeof value.text === "string") return value.text;
      if (typeof value.body === "string") return value.body;
    }
    return "";
  };

  let raw = "";
  for (const candidate of candidates) {
    raw = pick(candidate);
    if (raw) break;
  }

  const text = String(raw || "").trim();
  if (!text) return "";

  // Hide system-generated contact payloads (these aren't meaningful enquiry messages).
  // Example: "Contact email: ... Phone: ..."
  if (/^contact email\s*:/i.test(text)) return "";

  if ((text.startsWith("{") && text.endsWith("}")) || (text.startsWith("[") && text.endsWith("]"))) {
    try {
      const parsed = JSON.parse(text);
      const fromJson = pick(parsed);
      return String(fromJson || text).trim();
    } catch (_) {
      // ignore parse failures
    }
  }

  return text;
};

const DetailItem = ({ label, value }) => (
  <div className="rounded-sm border border-border bg-black/20 px-3 py-3">
    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
    <p className="mt-1 break-words text-sm font-medium">{value || "Not available"}</p>
  </div>
);

const getEnquiryTime = (enquiry = {}) => {
  const value = enquiry.date || enquiry.createdAt || enquiry.createdDate || "";
  const time = value ? new Date(value).getTime() : 0;
  return Number.isNaN(time) ? 0 : time;
};

export const SupplierEnquiries = () => {
  const { currentUser } = useAuth();
  const supplierId = currentUser?.profileId || currentUser?.id;

  const [statusFilter, setStatusFilter] = useState("all");
  const [viewSheet, setViewSheet] = useState({ open: false, item: null });
  const [replySheet, setReplySheet] = useState({ open: false, item: null });
  const [replyText, setReplyText] = useState("");
  const [dateSortDirection, setDateSortDirection] = useState("desc");
  const [statusConfirm, setStatusConfirm] = useState({ open: false, item: null, status: "" });

  const {
    data: enquiries = [],
    isLoading,
    isError,
  } = useGetSupplierEnquiriesQuery(supplierId);

  const [replyToSupplierEnquiry, { isLoading: isReplying }] =
    useReplyToSupplierEnquiryMutation();
  const [updateSupplierEnquiryStatus, { isLoading: isUpdatingStatus }] =
    useUpdateSupplierEnquiryStatusMutation();

  const filteredEnquiries = (statusFilter === "all"
    ? enquiries
    : enquiries.filter((enquiry) => enquiry.status === statusFilter))
    .slice()
    .sort((a, b) => {
      const sortValue = getEnquiryTime(a) - getEnquiryTime(b);
      return dateSortDirection === "asc" ? sortValue : -sortValue;
    });

  const handleSendReply = async () => {
    const reply = replyText.trim();

    if (reply && replySheet.item) {
      try {
        const updated = await replyToSupplierEnquiry({
          supplierId,
          enquiryId: replySheet.item.id,
          reply,
        }).unwrap();

        toast.success("Reply sent successfully");
        setReplyText("");
        setReplySheet({ open: false, item: null });

        setViewSheet((current) =>
          current.item?.id === updated.id ? { ...current, item: updated } : current
        );
      } catch (error) {
        toast.error(error?.data?.message || "Unable to send reply");
      }
    }
  };

  const openStatusConfirm = (item, status) => {
    setStatusConfirm({ open: true, item, status });
  };

  const handleConfirmStatusUpdate = async () => {
    if (!statusConfirm.item || !statusConfirm.status) return;

    try {
      const updated = await updateSupplierEnquiryStatus({
        supplierId,
        enquiryId: statusConfirm.item.id,
        status: statusConfirm.status,
      }).unwrap();

      toast.success(`Enquiry marked ${statusConfirm.status}`);
      setStatusConfirm({ open: false, item: null, status: "" });
      setViewSheet((current) =>
        current.item?.id === updated.id ? { ...current, item: updated } : current
      );
    } catch (error) {
      toast.error(error?.data?.message || "Unable to update enquiry status");
    }
  };

  const columns = [
    {
      key: "buyerName",
      label: "Buyer",
      render: (value, row) => (
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-xs text-muted-foreground">{row.buyerCompany}</p>
        </div>
      ),
    },
    { key: "productName", label: "Product" },
    {
      key: "message",
      label: "Message",
      render: (_value, row) => {
        const message = extractEnquiryMessage(row);
        return <p className="max-w-xs truncate text-sm">{message || "—"}</p>;
      },
    },
    {
      key: "date",
      label: (
        <button
          type="button"
          className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
          onClick={() => setDateSortDirection((current) => (current === "asc" ? "desc" : "asc"))}
          data-testid="enquiry-date-sort-btn"
        >
          Date
          {dateSortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
        </button>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => <StatusBadge status={value} />,
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <ActionButtonGroup>
          <ActionButton
            icon={Eye}
            label="View"
            testId={`view-enquiry-${row.id}`}
            onClick={() => setViewSheet({ open: true, item: row })}
          />
          <ActionButton
            icon={MessageSquare}
            label="Reply"
            className="text-primary hover:text-primary/80"
            testId={`reply-enquiry-${row.id}`}
            onClick={() => {
              setReplyText("");
              setReplySheet({ open: true, item: row });
            }}
          />
          <ActionButton
            icon={Clock}
            label="Mark Pending"
            testId={`pending-enquiry-${row.id}`}
            disabled={row.status === "pending"}
            onClick={() => openStatusConfirm(row, "pending")}
          />
          <ActionButton
            icon={CheckCircle}
            label="Mark Resolved"
            className="text-emerald-400 hover:text-emerald-300"
            testId={`resolve-enquiry-${row.id}`}
            disabled={row.status === "resolved"}
            onClick={() => openStatusConfirm(row, "resolved")}
          />
        </ActionButtonGroup>
      ),
    },
  ];

  return (
    <>
      <div className="space-y-6" data-testid="supplier-enquiries">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-1 font-['Barlow_Condensed'] text-2xl font-bold uppercase tracking-wide">
              Enquiries
            </h1>
            <p className="text-sm text-muted-foreground">Manage buyer enquiries</p>
          </div>
        </div>

        {isLoading ? (
          <p>Loading enquiries...</p>
        ) : isError ? (
          <p>Failed to load enquiries.</p>
        ) : (
          <DataTable
            columns={columns}
            data={filteredEnquiries}
            searchPlaceholder="Search enquiries..."
            searchKey="buyerName"
            pageSize={10}
            testId="supplier-enquiries-table"
            toolbarRight={
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] bg-black/20" data-testid="enquiry-status-filter">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="replied">Replied</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            }
          />
        )}
      </div>

      <Sheet open={viewSheet.open} onOpenChange={(open) => setViewSheet({ ...viewSheet, open })}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">
              Enquiry Details
            </SheetTitle>
          </SheetHeader>

          {viewSheet.item && (
            <div className="mt-6 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold">{viewSheet.item.productName}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Enquiry ID: {viewSheet.item.id}
                  </p>
                </div>
                <StatusBadge status={viewSheet.item.status} />
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-semibold uppercase tracking-wide">Buyer Details</h4>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailItem label="Buyer Name" value={viewSheet.item.buyerName} />
                  <DetailItem label="Buyer Company" value={viewSheet.item.buyerCompany} />
                  <DetailItem label="Buyer ID" value={viewSheet.item.buyerId} />
                  <DetailItem
                    label="Buyer Email"
                    value={viewSheet.item.buyerEmail || viewSheet.item.email}
                  />

                  <DetailItem
                    label="Buyer Country"
                    value={viewSheet.item.buyerCountry || viewSheet.item.country}
                  />
                  <DetailItem label="Received Date" value={viewSheet.item.date} />
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-semibold uppercase tracking-wide">Product Details</h4>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailItem label="Product Name" value={viewSheet.item.productName} />
                  <DetailItem label="Product ID" value={viewSheet.item.productId} />
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-semibold uppercase tracking-wide">Supplier Details</h4>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailItem label="Supplier Name" value={viewSheet.item.supplierName} />
                  <DetailItem label="Supplier ID" value={viewSheet.item.supplierId || supplierId} />
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
                  Buyer Message
                </h4>
                <p className="min-h-[120px] whitespace-pre-wrap rounded-sm border border-border bg-muted/20 p-4 text-sm leading-6">
                  {extractEnquiryMessage(viewSheet.item) || "No message available."}
                </p>
              </div>

              {viewSheet.item.reply ? (
                <div>
                  <h4 className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
                    Your Reply
                  </h4>
                  <p className="whitespace-pre-wrap rounded-sm border border-primary/20 bg-primary/10 p-4 text-sm leading-6">
                    {viewSheet.item.reply}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Reply Date: {viewSheet.item.replyDate || "Not available"}
                  </p>
                </div>
              ) : (
                <div className="rounded-sm border border-dashed border-border bg-black/20 p-4 text-sm text-muted-foreground">
                  No reply sent yet.
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Received on {viewSheet.item.date || "Not available"}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Sheet open={replySheet.open} onOpenChange={(open) => setReplySheet({ ...replySheet, open })}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-[500px]">
          <SheetHeader>
            <SheetTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">
              Reply to Enquiry
            </SheetTitle>
          </SheetHeader>

          {replySheet.item && (
            <div className="mt-6 space-y-6">
              <div className="rounded-sm bg-muted/30 p-4">
                <p className="mb-2 text-xs uppercase text-muted-foreground">Original Message</p>
                <p className="text-sm leading-6 whitespace-pre-wrap">{extractEnquiryMessage(replySheet.item) || "No message available."}</p>
              </div>

              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Your Reply
                </Label>
                <Textarea
                  value={replyText}
                  onChange={(event) => setReplyText(event.target.value)}
                  placeholder="Type your reply here..."
                  className="mt-2 min-h-[180px] bg-black/20"
                  data-testid="enquiry-reply-textarea"
                />
              </div>

              <Button
                onClick={handleSendReply}
                disabled={isReplying || !replyText.trim()}
                className="w-full gap-2"
                data-testid="send-reply-btn"
              >
                <Send className="h-4 w-4" />
                {isReplying ? "Sending..." : "Send Reply"}
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={statusConfirm.open} onOpenChange={(open) => setStatusConfirm({ ...statusConfirm, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">Update Enquiry Status</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark this enquiry as {statusConfirm.status || "selected"}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusConfirm({ open: false, item: null, status: "" })} disabled={isUpdatingStatus}>
              Cancel
            </Button>
            <Button onClick={handleConfirmStatusUpdate} disabled={isUpdatingStatus} data-testid="confirm-enquiry-status-btn">
              {isUpdatingStatus ? "Updating..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
