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
import { RatingStars } from "@/components/shared/RatingStars";
import { Calendar, Edit, Eye, Plus, Star } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/App";
import { currentBuyer } from "@/data/mockData";
import { useGetProductsQuery } from "@/store/api/admin/productApi";
import {
  useCreateBuyerRatingMutation,
  useGetBuyerRatingsQuery,
  useUpdateBuyerRatingMutation,
} from "@/store/api/buyer/buyerRatingApi";

export const BuyerRatings = () => {
  const { currentUser } = useAuth();
  const [submitRatingDialog, setSubmitRatingDialog] = useState(false);
  const [editRatingDialog, setEditRatingDialog] = useState({ open: false, item: null });
  const [viewSheet, setViewSheet] = useState({ open: false, item: null });
  const [newRating, setNewRating] = useState({ productId: "", rating: 5, review: "" });
  const [editRatingForm, setEditRatingForm] = useState({ rating: 5, review: "" });
  const buyerId = currentUser?.profileId || currentBuyer.id;
  const { data: ratings = [], isLoading: isRatingsLoading, isError: isRatingsError } = useGetBuyerRatingsQuery(buyerId);
  const { data: products = [], isLoading: isProductsLoading } = useGetProductsQuery();
  const [createBuyerRating, { isLoading: isCreating }] = useCreateBuyerRatingMutation();
  const [updateBuyerRating, { isLoading: isUpdating }] = useUpdateBuyerRatingMutation();
  const approvedProducts = products.filter((product) => product.status === "approved");

  const handleSubmitRating = async () => {
    if (newRating.productId && newRating.review.trim()) {
      try {
        await createBuyerRating({
          buyerId,
          payload: {
            productId: newRating.productId,
            rating: newRating.rating,
            review: newRating.review,
          },
        }).unwrap();
        toast.success("Rating submitted successfully");
        setNewRating({ productId: "", rating: 5, review: "" });
        setSubmitRatingDialog(false);
      } catch (error) {
        toast.error(error?.data?.message || "Unable to submit rating");
      }
    }
  };

  const openEditRating = (rating) => {
    setEditRatingForm({ rating: rating.rating, review: rating.review });
    setEditRatingDialog({ open: true, item: rating });
  };

  const handleEditRating = async () => {
    if (editRatingDialog.item) {
      try {
        await updateBuyerRating({
          buyerId,
          ratingId: editRatingDialog.item.id,
          payload: editRatingForm,
        }).unwrap();
        toast.success("Rating updated successfully");
        setEditRatingDialog({ open: false, item: null });
      } catch (error) {
        toast.error(error?.data?.message || "Unable to update rating");
      }
    }
  };

  return (
    <>
      <div className="space-y-6" data-testid="buyer-ratings">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-['Barlow_Condensed'] uppercase tracking-wide mb-1">My Ratings</h1>
            <p className="text-sm text-muted-foreground">View and submit product ratings</p>
          </div>
          <Button onClick={() => setSubmitRatingDialog(true)} className="gap-2" data-testid="add-rating-btn">
            <Plus className="h-4 w-4" />
            Submit Rating
          </Button>
        </div>

        <div className="space-y-4">
          {isRatingsLoading ? (
            <div className="dashboard-card">
              <div className="dashboard-card-content py-8 text-center text-sm text-muted-foreground">
                Loading ratings...
              </div>
            </div>
          ) : isRatingsError ? (
            <div className="dashboard-card">
              <div className="dashboard-card-content py-8 text-center text-sm text-destructive">
                Unable to load ratings.
              </div>
            </div>
          ) : ratings.length === 0 ? (
            <div className="dashboard-card">
              <div className="dashboard-card-content text-center py-8">
                <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No ratings submitted yet</p>
                <Button onClick={() => setSubmitRatingDialog(true)} className="gap-2" data-testid="submit-first-rating-btn">
                  <Plus className="h-4 w-4" />
                  Submit Your First Rating
                </Button>
              </div>
            </div>
          ) : (
            ratings.map((rating) => (
              <div key={rating.id} className="dashboard-card" data-testid={`rating-card-${rating.id}`}>
                <div className="dashboard-card-content">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium">{rating.productName}</p>
                      <p className="text-xs text-muted-foreground">Submitted on {rating.submissionDate}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={rating.status} />
                      <RatingStars rating={rating.rating} size="sm" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{rating.review}</p>
                  <div className="mt-4 pt-4 border-t border-border flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => setViewSheet({ open: true, item: rating })} data-testid={`view-rating-${rating.id}`}>
                      <Eye className="h-3 w-3" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => openEditRating(rating)} data-testid={`edit-rating-${rating.id}`}>
                      <Edit className="h-3 w-3" />
                      Edit Rating
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Dialog open={submitRatingDialog} onOpenChange={setSubmitRatingDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">Submit Rating</DialogTitle>
            <DialogDescription>Rate a product you have interacted with</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Select Product *</Label>
              <Select value={newRating.productId} onValueChange={(value) => setNewRating({ ...newRating, productId: value })}>
                <SelectTrigger className="bg-black/20 mt-1" data-testid="rating-product-select">
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
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Your Rating *</Label>
              <div className="flex items-center gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewRating({ ...newRating, rating: star })}
                    className="focus:outline-none transition-transform hover:scale-110"
                    data-testid={`rating-star-${star}`}
                  >
                    <Star className={`h-8 w-8 transition-colors ${
                      star <= newRating.rating ? "fill-amber-400 text-amber-400" : "text-muted hover:text-amber-400/50"
                    }`} />
                  </button>
                ))}
                <span className="ml-2 text-lg font-medium">{newRating.rating}.0</span>
              </div>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Your Review *</Label>
              <Textarea
                value={newRating.review}
                onChange={(event) => setNewRating({ ...newRating, review: event.target.value })}
                placeholder="Write your review..."
                className="bg-black/20 mt-1 min-h-[120px]"
                data-testid="rating-review-textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmitRatingDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmitRating} disabled={isCreating} data-testid="submit-rating-btn">
              {isCreating ? "Submitting..." : "Submit Rating"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editRatingDialog.open} onOpenChange={(open) => setEditRatingDialog({ ...editRatingDialog, open })}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">Edit Rating</DialogTitle>
            {editRatingDialog.item && (
              <DialogDescription>Editing review for {editRatingDialog.item.productName}</DialogDescription>
            )}
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Your Rating</Label>
              <div className="flex items-center gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setEditRatingForm({ ...editRatingForm, rating: star })}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star className={`h-8 w-8 transition-colors ${
                      star <= editRatingForm.rating ? "fill-amber-400 text-amber-400" : "text-muted hover:text-amber-400/50"
                    }`} />
                  </button>
                ))}
                <span className="ml-2 text-lg font-medium">{editRatingForm.rating}.0</span>
              </div>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Your Review</Label>
              <Textarea
                value={editRatingForm.review}
                onChange={(event) => setEditRatingForm({ ...editRatingForm, review: event.target.value })}
                className="bg-black/20 mt-1 min-h-[120px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRatingDialog({ open: false, item: null })}>Cancel</Button>
            <Button onClick={handleEditRating} disabled={isUpdating} data-testid="save-rating-btn">
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={viewSheet.open} onOpenChange={(open) => setViewSheet({ ...viewSheet, open })}>
        <SheetContent className="w-[500px] sm:max-w-[500px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">Rating Details</SheetTitle>
          </SheetHeader>
          {viewSheet.item && (
            <div className="mt-6 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{viewSheet.item.productName}</h3>
                  <p className="text-sm text-muted-foreground">Your review</p>
                </div>
                <StatusBadge status={viewSheet.item.status} />
              </div>
              <div className="p-4 bg-muted/30 rounded-sm text-center">
                <RatingStars rating={viewSheet.item.rating} size="lg" />
                <p className="text-3xl font-bold font-['Barlow_Condensed'] mt-2">{viewSheet.item.rating}.0</p>
              </div>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Your Review</h4>
                <p className="text-sm leading-relaxed">{viewSheet.item.review}</p>
              </div>
              <Separator />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Submitted on {viewSheet.item.submissionDate}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
