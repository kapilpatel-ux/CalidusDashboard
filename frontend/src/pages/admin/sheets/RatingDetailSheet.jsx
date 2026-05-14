import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export const RatingDetailSheet = ({
  viewSheet,
  setViewSheet,
}) => {
  return (
    <Sheet
      open={viewSheet.open && viewSheet.type === "rating"}
      onOpenChange={(open) =>
        setViewSheet({ ...viewSheet, open })
      }
    >
      <SheetContent className="w-[500px] sm:max-w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">
            Rating Details
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6">
          {/* paste rating sheet inner content here */}
        </div>
      </SheetContent>
    </Sheet>
  );
};