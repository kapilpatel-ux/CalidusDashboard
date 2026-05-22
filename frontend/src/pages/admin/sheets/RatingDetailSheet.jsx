import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { RatingStars } from "@/components/shared/RatingStars";
import { Package, User, Hash } from "lucide-react";

export const RatingDetailSheet = ({ viewSheet, setViewSheet }) => {
  const rating = viewSheet.data || viewSheet.item || viewSheet.rating;

  return (
    <Sheet
      open={viewSheet.open && viewSheet.type === "rating"}
      onOpenChange={(open) => setViewSheet({ ...viewSheet, open })}
    >
      <SheetContent className="w-[500px] sm:max-w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">
            Rating Details
          </SheetTitle>
        </SheetHeader>

        {!rating ? (
          <p className="mt-6 text-sm text-muted-foreground">No rating selected.</p>
        ) : (
          <div className="mt-6 space-y-6">
            <Section title="Rating Info">
              <DetailRow label="Rating ID" value={rating.id} icon={Hash} />
              <DetailRow label="Product" value={rating.productName} icon={Package} />
              <DetailRow label="Buyer" value={rating.buyerName} icon={User} />
              <DetailRow label="Status" value={<StatusBadge status={rating.status} />} />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Rating</p>
                <RatingStars rating={rating.rating || 0} size="sm" />
              </div>
            </Section>

            <Section title="Review">
              <p className="text-sm text-muted-foreground">
                {rating.review || rating.message || "No review available."}
              </p>
            </Section>

            <Section title="Extra Details">
              <DetailRow label="Product ID" value={rating.productId} />
              <DetailRow label="Buyer ID" value={rating.buyerId} />
              <DetailRow label="Supplier ID" value={rating.supplierId} />
              <DetailRow label="Created Date" value={rating.createdAt || rating.date} />
            </Section>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

const Section = ({ title, children }) => (
  <div>
    <h3 className="font-semibold mb-3">{title}</h3>
    <div className="space-y-3">{children}</div>
  </div>
);

const DetailRow = ({ label, value, icon: Icon }) => (
  <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-2 text-sm">
    <span className="text-muted-foreground flex items-center gap-2">
      {Icon && <Icon className="h-4 w-4" />}
      {label}
    </span>
    <span className="font-medium text-right">
      {value || value === 0 ? value : "N/A"}
    </span>
  </div>
);
