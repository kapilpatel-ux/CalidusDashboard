import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  Send,
  Calendar,
  Hash,
} from "lucide-react";

export const BuyerDetailSheet = ({ viewSheet, setViewSheet }) => {
  const buyer = viewSheet.data || viewSheet.item || viewSheet.buyer;

  return (
    <Sheet
      open={viewSheet.open && viewSheet.type === "buyer"}
      onOpenChange={(open) => setViewSheet({ ...viewSheet, open })}
    >
      <SheetContent className="w-[500px] sm:max-w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">
            Buyer Details
          </SheetTitle>
        </SheetHeader>

        {!buyer ? (
          <p className="mt-6 text-sm text-muted-foreground">
            No buyer selected.
          </p>
        ) : (
          <div className="mt-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-md bg-primary/20 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>

              <div>
                <h2 className="text-xl font-semibold">
                  {buyer.name || buyer.contactPerson || "N/A"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {buyer.company || buyer.companyName || "Buyer"}
                </p>
                <div className="mt-2">
                  <StatusBadge status={buyer.status} />
                </div>
              </div>
            </div>

            <Section title="Basic Information">
              <DetailRow label="Buyer ID" value={buyer.id} icon={Hash} />
              <DetailRow label="Name" value={buyer.name || buyer.contactPerson} icon={User} />
              <DetailRow label="Company" value={buyer.company || buyer.companyName} icon={Building2} />
              <DetailRow label="Email" value={buyer.email} icon={Mail} />
              <DetailRow label="Phone" value={buyer.phone} icon={Phone} />
              <DetailRow label="Country" value={buyer.country} icon={MapPin} />
              <DetailRow label="Status" value={<StatusBadge status={buyer.status} />} />
            </Section>

            <Section title="Activity">
              <DetailRow label="Enquiries Sent" value={buyer.enquiriesSent} icon={Send} />
              <DetailRow label="Join Date" value={buyer.joinDate} icon={Calendar} />
              <DetailRow label="Last Active" value={buyer.lastActive} />
            </Section>

            {/* <Section title="Extra Details">
              <DetailRow label="Industry" value={buyer.industry} />
              <DetailRow label="Designation" value={buyer.designation} />
              <DetailRow label="Website" value={buyer.website} />
              <DetailRow label="Address" value={buyer.address} />
            </Section> */}
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