import { useState } from "react";
import { Calendar, MessageSquare, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { RatingStars } from "@/components/shared/RatingStars";
import { useAuth } from "@/App";
import {
  useGetSupplierRatingsQuery,
  useReplyToSupplierRatingMutation,
} from "@/store/api/supplier/supplierRatingApi";

export const SupplierRatings = () => {
  const { currentUser } = useAuth();
  const supplierId = currentUser?.profileId;
  const [viewSheet, setViewSheet] = useState({ open: false, item: null });
  const [replyDialog, setReplyDialog] = useState({ open: false, rating: null });
  const [replyText, setReplyText] = useState("");
  const {
    data: ratings = [],
    isLoading,
    isError,
  } = useGetSupplierRatingsQuery(supplierId, { skip: !supplierId });
  const [replyToSupplierRating, { isLoading: isSubmittingReply }] = useReplyToSupplierRatingMutation();

  const approvedRatings = ratings.filter((rating) => rating.status === "approved");
  const averageRating = approvedRatings.length > 0
    ? approvedRatings.reduce((sum, rating) => sum + Number(rating.rating || 0), 0) / approvedRatings.length
    : 0;

  const openReplyDialog = (rating) => {
    setReplyText(rating.supplierReply || "");
    setReplyDialog({ open: true, rating });
  };

  const submitReply = async () => {
    if (!replyText.trim()) {
      toast.error("Reply is required");
      return;
    }

    if (supplierId && replyDialog.rating) {
      try {
        await replyToSupplierRating({
          supplierId,
          ratingId: replyDialog.rating.id,
          reply: replyText,
        }).unwrap();
        toast.success("Reply submitted for admin approval");
        setReplyText("");
        setReplyDialog({ open: false, rating: null });
      } catch (error) {
        toast.error(error?.data?.message || "Unable to submit reply");
      }
    }
  };

  return (
    <>
      <div className="space-y-6" data-testid="supplier-ratings">
        <div>
          <h1 className="text-2xl font-bold font-['Barlow_Condensed'] uppercase tracking-wide mb-1">Ratings & Reviews</h1>
          <p className="text-sm text-muted-foreground">View and respond to customer reviews</p>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-content">
            <div className="flex items-center gap-8">
              <div className="text-center">
                <p className="text-5xl font-bold font-['Barlow_Condensed']">{averageRating.toFixed(1)}</p>
                <RatingStars rating={averageRating} size="md" showValue={false} />
                <p className="text-sm text-muted-foreground mt-1">Overall Rating</p>
              </div>
              <div className="flex-1 space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = ratings.filter((rating) => Math.floor(rating.rating) === star).length;
                  const percentage = ratings.length > 0 ? (count / ratings.length) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-sm w-3">{star}</span>
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <div className="flex-1 h-2 bg-muted rounded-sm overflow-hidden">
                        <div className="h-full bg-amber-400" style={{ width: `${percentage}%` }} />
                      </div>
                      <span className="text-sm text-muted-foreground w-8">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {!supplierId ? (
            <div className="dashboard-card">
              <div className="dashboard-card-content py-8 text-center text-sm text-destructive">
                Supplier profile not found.
              </div>
            </div>
          ) : isLoading ? (
            <div className="dashboard-card">
              <div className="dashboard-card-content py-8 text-center text-sm text-muted-foreground">
                Loading ratings...
              </div>
            </div>
          ) : isError ? (
            <div className="dashboard-card">
              <div className="dashboard-card-content py-8 text-center text-sm text-destructive">
                Unable to load ratings.
              </div>
            </div>
          ) : ratings.length === 0 ? (
            <div className="dashboard-card">
              <div className="dashboard-card-content py-8 text-center text-sm text-muted-foreground">
                No ratings yet.
              </div>
            </div>
          ) : (
            ratings.map((rating) => (
              <div key={rating.id} className="dashboard-card" data-testid={`rating-card-${rating.id}`}>
                <div className="dashboard-card-content">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium">{rating.buyerName}</p>
                      <p className="text-xs text-muted-foreground">{rating.productName}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={rating.status} />
                      <RatingStars rating={rating.rating} size="sm" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{rating.review}</p>
                  {rating.supplierReply && (
                    <div className="p-3 bg-primary/10 rounded-sm mb-3">
                      <div className="flex justify-between mb-1">
                        <p className="text-xs uppercase text-muted-foreground">Your Reply</p>
                        <StatusBadge status={rating.supplierReplyStatus || "pending"} />
                      </div>
                      <p className="text-sm">{rating.supplierReply}</p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setViewSheet({ open: true, item: rating })}>View Details</Button>
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => openReplyDialog(rating)}>
                      <MessageSquare className="h-3 w-3" />
                      Reply
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Sheet open={viewSheet.open} onOpenChange={(open) => setViewSheet({ ...viewSheet, open })}>
        <SheetContent className="w-[500px] sm:max-w-[500px] overflow-y-auto">
          <SheetHeader><SheetTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">Review Details</SheetTitle></SheetHeader>
          {viewSheet.item && (
            <div className="mt-6 space-y-6">
              <div><h3 className="text-lg font-semibold">{viewSheet.item.productName}</h3><p className="text-sm text-muted-foreground">by {viewSheet.item.buyerName}</p></div>
              <div className="p-4 bg-muted/30 rounded-sm text-center">
                <RatingStars rating={viewSheet.item.rating} size="lg" />
                <p className="text-3xl font-bold font-['Barlow_Condensed'] mt-2">{Number(viewSheet.item.rating || 0).toFixed(1)}</p>
              </div>
              <Separator />
              <div><h4 className="text-xs uppercase text-muted-foreground mb-2">Review</h4><p className="text-sm">{viewSheet.item.review}</p></div>
              <div className="text-sm text-muted-foreground flex items-center gap-2"><Calendar className="h-4 w-4" />Submitted on {viewSheet.item.submissionDate}</div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={replyDialog.open} onOpenChange={(open) => setReplyDialog({ ...replyDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">Reply to Review</DialogTitle>
            {replyDialog.rating && <DialogDescription>Responding to {replyDialog.rating.buyerName}'s review</DialogDescription>}
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Your Reply</Label>
            <Textarea value={replyText} onChange={(event) => setReplyText(event.target.value)} placeholder="Write your response..." className="bg-black/20 min-h-[120px]" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReplyDialog({ open: false, rating: null })}>Cancel</Button>
            <Button onClick={submitReply} disabled={isSubmittingReply}>
              {isSubmittingReply ? "Submitting..." : "Submit Reply"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
