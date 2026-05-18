import { useState } from "react";
import { Calendar, MessageSquare, Send, User, Eye } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DataTable } from "@/components/shared/DataTable";
import { ActionButton, ActionButtonGroup } from "@/components/shared/ActionButton";
import { currentSupplier, enquiries as allEnquiries } from "@/data/mockData";

export const SupplierEnquiries = () => {
  const [enquiries, setEnquiries] = useState(allEnquiries.filter((enquiry) => enquiry.supplierId === currentSupplier.id));
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewSheet, setViewSheet] = useState({ open: false, item: null });
  const [replySheet, setReplySheet] = useState({ open: false, item: null });
  const [replyText, setReplyText] = useState("");

  const filteredEnquiries = statusFilter === "all" ? enquiries : enquiries.filter((enquiry) => enquiry.status === statusFilter);

  const handleSendReply = () => {
    if (replyText.trim() && replySheet.item) {
      setEnquiries((prev) => prev.map((enquiry) =>
        enquiry.id === replySheet.item.id
          ? { ...enquiry, status: "replied", reply: replyText, replyDate: new Date().toISOString().split("T")[0] }
          : enquiry
      ));
      toast.success("Reply sent successfully");
      setReplyText("");
      setReplySheet({ open: false, item: null });
    }
  };

  const columns = [
    { key: "buyerName", label: "Buyer", render: (value, row) => <div><p className="font-medium">{value}</p><p className="text-xs text-muted-foreground">{row.buyerCompany}</p></div> },
    { key: "productName", label: "Product" },
    { key: "message", label: "Message", render: (value) => <p className="text-sm max-w-xs truncate">{value}</p> },
    { key: "date", label: "Date" },
    { key: "status", label: "Status", render: (value) => <StatusBadge status={value} /> },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <ActionButtonGroup>
          <ActionButton icon={Eye} label="View" testId={`view-enquiry-${row.id}`} onClick={() => setViewSheet({ open: true, item: row })} />
          <ActionButton icon={MessageSquare} label="Reply" className="text-primary hover:text-primary/80" testId={`reply-enquiry-${row.id}`} onClick={() => { setReplyText(""); setReplySheet({ open: true, item: row }); }} />
        </ActionButtonGroup>
      ),
    },
  ];

  return (
    <>
      <div className="space-y-6" data-testid="supplier-enquiries">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-['Barlow_Condensed'] uppercase tracking-wide mb-1">Enquiries</h1>
            <p className="text-sm text-muted-foreground">Manage buyer enquiries</p>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] bg-black/20" data-testid="enquiry-status-filter"><SelectValue placeholder="Filter" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="replied">Replied</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DataTable columns={columns} data={filteredEnquiries} searchPlaceholder="Search enquiries..." searchKey="buyerName" pageSize={5} testId="supplier-enquiries-table" />
      </div>

      <Sheet open={viewSheet.open} onOpenChange={(open) => setViewSheet({ ...viewSheet, open })}>
        <SheetContent className="w-[500px] sm:max-w-[500px] overflow-y-auto">
          <SheetHeader><SheetTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">Enquiry Details</SheetTitle></SheetHeader>
          {viewSheet.item && (
            <div className="mt-6 space-y-6">
              <div className="flex items-start justify-between">
                <div><h3 className="text-lg font-semibold">{viewSheet.item.productName}</h3><p className="text-sm text-muted-foreground">ID: {viewSheet.item.id}</p></div>
                <StatusBadge status={viewSheet.item.status} />
              </div>
              <Separator />
              <div className="p-4 bg-muted/30 rounded-sm">
                <div className="flex items-center gap-2"><User className="h-4 w-4 text-primary" /><span className="font-medium">{viewSheet.item.buyerName}</span></div>
                <p className="text-sm text-muted-foreground">{viewSheet.item.buyerCompany}</p>
              </div>
              <div><h4 className="text-xs uppercase text-muted-foreground mb-2">Message</h4><p className="text-sm p-3 bg-muted/20 rounded-sm">{viewSheet.item.message}</p></div>
              {viewSheet.item.reply && (
                <>
                  <Separator />
                  <div><h4 className="text-xs uppercase text-muted-foreground mb-2">Your Reply</h4><p className="text-sm p-3 bg-primary/10 rounded-sm">{viewSheet.item.reply}</p><p className="text-xs text-muted-foreground mt-1">Sent on {viewSheet.item.replyDate}</p></div>
                </>
              )}
              <div className="text-sm text-muted-foreground flex items-center gap-2"><Calendar className="h-4 w-4" />Received on {viewSheet.item.date}</div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Sheet open={replySheet.open} onOpenChange={(open) => setReplySheet({ ...replySheet, open })}>
        <SheetContent className="w-[500px] sm:max-w-[500px] overflow-y-auto">
          <SheetHeader><SheetTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">Reply to Enquiry</SheetTitle></SheetHeader>
          {replySheet.item && (
            <div className="mt-6 space-y-6">
              <div className="p-4 bg-muted/30 rounded-sm">
                <p className="text-xs uppercase text-muted-foreground mb-2">Original Message</p>
                <p className="text-sm">{replySheet.item.message}</p>
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Your Reply</Label>
                <Textarea value={replyText} onChange={(event) => setReplyText(event.target.value)} placeholder="Type your reply here..." className="bg-black/20 mt-2 min-h-[150px]" data-testid="enquiry-reply-textarea" />
              </div>
              <Button onClick={handleSendReply} className="w-full gap-2" data-testid="send-reply-btn"><Send className="h-4 w-4" />Send Reply</Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
