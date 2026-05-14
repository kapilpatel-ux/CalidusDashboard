import { Schema, model } from "mongoose";

const supplierSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    country: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    certifications: { type: [String], default: [] },
    status: { type: String, default: "pending" },
    joinDate: { type: String, required: true },
    profileViews: { type: Number, default: 0 },
    totalEnquiries: { type: Number, default: 0 },
    image: { type: String, default: null },
    productsCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    documents: { type: [Schema.Types.Mixed], default: [] },
    documentStatus: { type: String, default: "active" },
  },
  { collection: "suppliers", strict: false, versionKey: false },
);

supplierSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete (ret as { _id?: unknown })._id;
    return ret;
  },
});

export const SupplierModel = model("Supplier", supplierSchema);
