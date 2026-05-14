import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export const SupplierDetailSheet = ({
  viewSheet,
  setViewSheet,
}) => {
  return (
    <Sheet
      open={viewSheet.open && viewSheet.type === "supplier"}
      onOpenChange={(open) =>
        setViewSheet({ ...viewSheet, open })
      }
    >
      <SheetContent className="w-[500px] sm:max-w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">
            Supplier Details
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6">
          {/* paste supplier sheet inner content here */}
        </div>
      </SheetContent>
    </Sheet>
  );
};