import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export const ProductDetailSheet = ({
  viewSheet,
  setViewSheet,
  handleViewSupplier,
}) => {
  return (
    <Sheet
      open={viewSheet.open && viewSheet.type === "product"}
      onOpenChange={(open) =>
        setViewSheet({ ...viewSheet, open })
      }
    >
      <SheetContent className="w-[700px] sm:max-w-[700px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">
            Product Details
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6">
          {/* paste product sheet inner content here */}
        </div>
      </SheetContent>
    </Sheet>
  );
};