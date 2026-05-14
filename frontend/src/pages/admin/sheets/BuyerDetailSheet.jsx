import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export const BuyerDetailSheet = ({
  viewSheet,
  setViewSheet,
}) => {
  return (
    <Sheet
      open={viewSheet.open && viewSheet.type === "buyer"}
      onOpenChange={(open) =>
        setViewSheet({ ...viewSheet, open })
      }
    >
      <SheetContent className="w-[500px] sm:max-w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">
            Buyer Details
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6">
          {/* paste buyer sheet inner content here */}
        </div>
      </SheetContent>
    </Sheet>
  );
};