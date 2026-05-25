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
import { Building2, Calendar, Edit, Eye, Hash, Package, Plus, Star } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/App";
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
  const buyerId = currentUser?.profileId || currentUser?.id;
  const { data: ratings = [], isLoading: isRatingsLoading, isError: isRatingsError } = useGetBuyerRatingsQuery(buyerId, { skip: !buyerId });
  const { data: products = [], isLoading: isProductsLoading } = useGetProductsQuery();
  const [createBuyerRating, { isLoading: isCreating }] = useCreateBuyerRatingMutation();
  const [updateBuyerRating, { isLoading: isUpdating }] = useUpdateBuyerRatingMutation();
  const approvedProducts = products.filter((product) => product.status === "approved");

  const selectedProduct = approvedProducts.find((product) => product.id === newRating.productId);
  const selectedProductLabel = selectedProduct
    ? `${selectedProduct.name} - ${selectedProduct.supplierName}`
    : "Choose a product";

  const handleSubmitRating = async () => {
    if (!newRating.productId) {
      toast.error("Please select a product");
      return;
    }

    if (!newRating.review.trim()) {
      toast.error("Please write your review");
      return;
    }

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
  };

  const openEditRating = (rating) => {
    setEditRatingForm({ rating: rating.rating, review: rating.review });
    setEditRatingDialog({ open: true, item: rating });
  };

  const handleEditRating = async () => {
    if (!editRatingForm.review.trim()) {
      toast.error("Please write your review");
      return;
    }

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

  const DetailItem = ({ label, value, icon: Icon }) => (
    <div className="rounded-sm border border-border bg-black/20 px-3 py-3">
      <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-medium">{value || "Not available"}</p>
    </div>
  );

  const selectedRating = viewSheet.item || {};

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
          {!buyerId ? (
            <div className="dashboard-card">
              <div className="dashboard-card-content py-8 text-center text-sm text-destructive">
                Buyer profile not found.
              </div>
            </div>
          ) : isRatingsLoading ? (
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
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="font-medium">{rating.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        {rating.supplierName ? `Supplier: ${rating.supplierName}` : "Supplier not available"}
                      </p>
                      <p className="text-xs text-muted-foreground">Submitted on {rating.submissionDate || "N/A"}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
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
        <DialogContent className="w-[calc(100vw-2rem)] max-w-lg min-w-0 overflow-hidden">
          <DialogHeader className="min-w-0">
            <DialogTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">Submit Rating</DialogTitle>
            <DialogDescription>Rate a product you have interacted with</DialogDescription>
          </DialogHeader>
          <div className="min-w-0 space-y-4 py-4">
            <div className="min-w-0">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Select Product *</Label>
              <Select value={newRating.productId} onValueChange={(value) => setNewRating({ ...newRating, productId: value })}>
                <SelectTrigger className="mt-1 w-full min-w-0 max-w-full overflow-hidden bg-black/20 [&>svg]:shrink-0" data-testid="rating-product-select">
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
                className="mt-1 min-h-[120px] w-full max-w-full bg-black/20"
                data-testid="rating-review-textarea"
              />
            </div>
          </div>
          <DialogFooter className="min-w-0 flex-wrap gap-2">
            <Button variant="outline" onClick={() => setSubmitRatingDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmitRating} disabled={isCreating || !newRating.productId || !newRating.review.trim()} data-testid="submit-rating-btn">
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
            <Button onClick={handleEditRating} disabled={isUpdating || !editRatingForm.review.trim()} data-testid="save-rating-btn">
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={viewSheet.open} onOpenChange={(open) => setViewSheet({ ...viewSheet, open })}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">Rating Details</SheetTitle>
          </SheetHeader>
          {viewSheet.item && (
            <div className="mt-6 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold">{selectedRating.productName || "Product not available"}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Rating ID: {selectedRating.id || "Not available"}
                  </p>
                </div>
                <StatusBadge status={selectedRating.status} />
              </div>

              <div className="p-4 bg-muted/30 rounded-sm text-center">
                <RatingStars rating={Number(selectedRating.rating || 0)} size="lg" />
                <p className="text-3xl font-bold font-['Barlow_Condensed'] mt-2">
                  {Number(selectedRating.rating || 0).toFixed(1)}
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-semibold uppercase tracking-wide">Product Information</h4>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailItem label="Product Name" value={selectedRating.productName} icon={Package} />
                  <DetailItem label="Product ID" value={selectedRating.productId} icon={Hash} />
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-semibold uppercase tracking-wide">Supplier Information</h4>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailItem label="Supplier Name" value={selectedRating.supplierName} icon={Building2} />
                  <DetailItem label="Supplier ID" value={selectedRating.supplierId} icon={Hash} />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Your Review</h4>
                <p className="min-h-[110px] whitespace-pre-wrap rounded-sm border border-border bg-muted/20 p-4 text-sm leading-6">
                  {selectedRating.review || "No review available."}
                </p>
              </div>

              {selectedRating.supplierReply && selectedRating.supplierReplyStatus === "approved" && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Supplier Reply</h4>
                    <div className="rounded-sm border border-primary/20 bg-primary/10 p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">{selectedRating.supplierName || "Supplier"}</span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-6">{selectedRating.supplierReply}</p>
                    </div>
                  </div>
                </>
              )}

              <Separator />

              <div className="grid gap-3 sm:grid-cols-2">
                <DetailItem label="Submitted Date" value={selectedRating.submissionDate} icon={Calendar} />
                <DetailItem label="Current Status" value={selectedRating.status} />
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
