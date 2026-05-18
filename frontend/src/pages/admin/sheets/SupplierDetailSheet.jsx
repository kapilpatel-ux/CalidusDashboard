import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Building2,
  Mail,
  MapPin,
  Phone,
  Calendar,
  Eye,
  MessageSquare,
  Package,
  Star,
  FileText,
} from "lucide-react";

export const SupplierDetailSheet = ({ viewSheet, setViewSheet }) => {
  const supplier = viewSheet.data || viewSheet.item || viewSheet.supplier;

  return (
    <Sheet
      open={viewSheet.open && viewSheet.type === "supplier"}
      onOpenChange={(open) => setViewSheet({ ...viewSheet, open })}
    >
      <SheetContent className="w-[500px] sm:max-w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">
            Supplier Details
          </SheetTitle>
        </SheetHeader>

        {!supplier ? (
          <p className="mt-6 text-sm text-muted-foreground">
            No supplier selected.
          </p>
        ) : (
          <div className="mt-6 space-y-6">
            <div className="flex items-center gap-4">
              {supplier.image ? (
                <img
                  src={supplier.image}
                  alt={supplier.name}
                  className="h-16 w-16 rounded-md object-cover border"
                />
              ) : (
                <div className="h-16 w-16 rounded-md bg-primary/20 flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
              )}

              <div>
                <h2 className="text-xl font-semibold">{supplier.name}</h2>
                <p className="text-sm text-muted-foreground">{supplier.type}</p>
                <div className="mt-2">
                  <StatusBadge status={supplier.status} />
                </div>
              </div>
            </div>

            <Section title="Basic Information">
              <DetailRow label="Supplier ID" value={supplier.id} />
              <DetailRow label="Name" value={supplier.name} icon={Building2} />
              <DetailRow label="Type" value={supplier.type} />
              <DetailRow label="Country" value={supplier.country} icon={MapPin} />
              <DetailRow label="Email" value={supplier.email} icon={Mail} />
              <DetailRow label="Phone" value={supplier.phone} icon={Phone} />
              <DetailRow label="Join Date" value={supplier.joinDate} icon={Calendar} />
            </Section>

            <Section title="Performance">
              <DetailRow label="Products Count" value={supplier.productsCount} icon={Package} />
              <DetailRow label="Rating" value={supplier.rating} icon={Star} />
              <DetailRow label="Profile Views" value={supplier.profileViews} icon={Eye} />
              <DetailRow label="Total Enquiries" value={supplier.totalEnquiries} icon={MessageSquare} />
            </Section>

            <Section title="Documents">
              <DetailRow label="Document Status" value={supplier.documentStatus} icon={FileText} />

              {supplier.documents?.length > 0 ? (
                <div className="space-y-2 mt-3">
                  {supplier.documents.map((doc, index) => (
                    <div
                      key={doc.id || index}
                      className="rounded-md border border-white/10 p-3 text-sm"
                    >
                      <p className="font-medium">
                        {doc.name || doc.title || `Document ${index + 1}`}
                      </p>
                      <p className="text-muted-foreground">
                        Status: {doc.status || "N/A"}
                      </p>
                      {doc.expiryDate && (
                        <p className="text-muted-foreground">
                          Expiry: {doc.expiryDate}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mt-2">
                  No documents available.
                </p>
              )}
            </Section>

            <Section title="Certifications">
              {supplier.certifications?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {supplier.certifications.map((cert, index) => (
                    <span
                      key={index}
                      className="rounded-full border border-white/10 px-3 py-1 text-xs bg-black/20"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No certifications available.
                </p>
              )}
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
    <span className="font-medium text-right">{value ?? "N/A"}</span>
  </div>
);