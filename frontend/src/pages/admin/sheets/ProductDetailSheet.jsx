import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { RatingStars } from "@/components/shared/RatingStars";
import {
  Package,
  Building2,
  MapPin,
  Clock,
  Tag,
  FileText,
  Video,
  Star,
} from "lucide-react";

export const ProductDetailSheet = ({
  viewSheet,
  setViewSheet,
  handleViewSupplier,
}) => {
  const product = viewSheet.data || viewSheet.item || viewSheet.product;

  const primaryImage =
    product?.images?.[product?.primaryImageIndex || 0]?.url ||
    product?.images?.[0]?.url ||
    product?.image;

  return (
    <Sheet
      open={viewSheet.open && viewSheet.type === "product"}
      onOpenChange={(open) => setViewSheet({ ...viewSheet, open })}
    >
      <SheetContent className="w-[700px] sm:max-w-[700px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">
            Product Details
          </SheetTitle>
        </SheetHeader>

        {!product ? (
          <p className="mt-6 text-sm text-muted-foreground">
            No product selected.
          </p>
        ) : (
          <div className="mt-6 space-y-6">
            {primaryImage && (
              <img
                src={primaryImage}
                alt={product.name}
                className="w-full h-56 rounded-lg object-cover bg-muted"
              />
            )}

            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold">{product.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {product.shortDescription || product.subcategory}
                  </p>
                </div>
                <StatusBadge status={product.status} />
              </div>

              <div className="mt-3">
                {product.rating > 0 ? (
                  <RatingStars rating={product.rating} size="sm" />
                ) : (
                  <span className="text-sm text-muted-foreground">
                    No ratings
                  </span>
                )}
              </div>
            </div>

            <Section title="Basic Information">
              <DetailRow label="Product ID" value={product.id} icon={Package} />
              <DetailRow label="Category" value={product.category} icon={Tag} />
              <DetailRow label="Subcategory" value={product.subcategory} />
              <DetailRow label="Price" value={product.price} />
              <DetailRow label="Availability" value={product.availability} />
              <DetailRow label="Lead Time" value={product.leadTime} icon={Clock} />
              <DetailRow label="Country Of Origin" value={product.countryOfOrigin} icon={MapPin} />
            </Section>

            <Section title="Supplier">
              <button
                type="button"
                onClick={() =>
                  handleViewSupplier?.({
                    id: product.supplierId,
                    name: product.supplierName,
                  })
                }
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <Building2 className="h-4 w-4" />
                {product.supplierName || "Unknown Supplier"}
              </button>
              <DetailRow label="Supplier ID" value={product.supplierId} />
            </Section>

            <Section title="Description">
              <p className="text-sm text-muted-foreground">
                {product.description || "No description available."}
              </p>
            </Section>

            <Section title="Technical Details">
              <DetailRow label="Technical Specs" value={product.technicalSpecs} />
              <DetailRow label="Application Use Case" value={product.applicationUseCase} />
              <DetailRow label="AI Summary" value={product.aiSummary} />
            </Section>

            <Section title="Specifications">
              {product.specifications?.length > 0 ? (
                <List items={product.specifications} />
              ) : (
                <Empty text="No specifications available." />
              )}
            </Section>

            <Section title="Certifications">
              {product.certifications?.length > 0 ? (
                <BadgeList items={product.certifications} />
              ) : (
                <Empty text="No certifications available." />
              )}
            </Section>

            <Section title="Industry Tags">
              {product.industryTags?.length > 0 ? (
                <BadgeList items={product.industryTags} />
              ) : (
                <Empty text="No industry tags available." />
              )}
            </Section>

            <Section title="Dimensions">
              {product.dimensions && Object.keys(product.dimensions).length > 0 ? (
                Object.entries(product.dimensions).map(([key, value]) => (
                  <DetailRow key={key} label={key} value={value} />
                ))
              ) : (
                <Empty text="No dimensions available." />
              )}
            </Section>

            <Section title="Documents">
              {product.datasheet && (
                <DocCard title="Datasheet" doc={product.datasheet} />
              )}

              {product.technicalDocs?.length > 0 ? (
                product.technicalDocs.map((doc, index) => (
                  <DocCard
                    key={doc.id || index}
                    title={doc.name || doc.title || `Technical Doc ${index + 1}`}
                    doc={doc}
                  />
                ))
              ) : !product.datasheet ? (
                <Empty text="No documents available." />
              ) : null}
            </Section>

            {product.videoUrl && (
              <Section title="Video">
                <a
                  href={product.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline text-sm"
                >
                  <Video className="h-4 w-4" />
                  Open Product Video
                </a>
              </Section>
            )}
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
      {value || value === 0 ? String(value) : "N/A"}
    </span>
  </div>
);

const BadgeList = ({ items }) => (
  <div className="flex flex-wrap gap-2">
    {items.map((item, index) => (
      <span
        key={index}
        className="rounded-full border border-white/10 px-3 py-1 text-xs bg-black/20"
      >
        {item}
      </span>
    ))}
  </div>
);

const List = ({ items }) => (
  <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
    {items.map((item, index) => (
      <li key={index}>{item}</li>
    ))}
  </ul>
);

const DocCard = ({ title, doc }) => (
  <div className="rounded-md border border-white/10 p-3 text-sm">
    <div className="flex items-center gap-2 font-medium">
      <FileText className="h-4 w-4" />
      {title}
    </div>
    {doc.url ? (
      <a
        href={doc.url}
        target="_blank"
        rel="noreferrer"
        className="text-primary hover:underline text-xs"
      >
        Open Document
      </a>
    ) : (
      <p className="text-xs text-muted-foreground mt-1">
        No document URL available.
      </p>
    )}
  </div>
);

const Empty = ({ text }) => (
  <p className="text-sm text-muted-foreground">{text}</p>
);