import { Schema, model } from "mongoose";

const productSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    supplierId: { type: String, required: true },
    supplierName: { type: String, required: true },
    category: { type: String, required: true },
    subcategory: { type: String, default: "General" },
    rating: { type: Number, default: 0 },
    status: { type: String, default: "pending" },
    price: { type: String, default: "RFQ" },
    description: { type: String, default: "" },
    shortDescription: { type: String, default: "" },
    specifications: { type: [String], default: [] },
    technicalSpecs: { type: String, default: "" },
    leadTime: { type: String, default: "" },
    countryOfOrigin: { type: String, default: "" },
    availability: { type: String, default: "in-stock" },
    dimensions: { type: Schema.Types.Mixed, default: {} },
    certifications: { type: [String], default: [] },
    industryTags: { type: [String], default: [] },
    applicationUseCase: { type: String, default: "" },
    aiSummary: { type: String, default: "" },
    images: { type: [Schema.Types.Mixed], default: [] },
    primaryImageIndex: { type: Number, default: 0 },
    datasheet: { type: Schema.Types.Mixed, default: null },
    technicalDocs: { type: [Schema.Types.Mixed], default: [] },
    videoUrl: { type: String, default: "" },
    image: { type: String, default: null },
    createdAt: { type: String, default: () => new Date().toISOString() },
    createdDate: { type: String, default: () => new Date().toISOString().split("T")[0] },
  },
  { collection: "products", strict: false, versionKey: false },
);

productSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete (ret as { _id?: unknown })._id;
    return ret;
  },
});

export const ProductModel = model("Product", productSchema);
