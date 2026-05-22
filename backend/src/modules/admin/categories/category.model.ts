import { Schema, model } from "mongoose";

const categorySchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    supplierId: { type: String, default: "" },
    supplierName: { type: String, default: "" },
    status: { type: String, default: "pending" },
    subcategories: { type: [Schema.Types.Mixed], default: [] },
  },
  { collection: "categories", strict: false, versionKey: false },
);

categorySchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete (ret as { _id?: unknown })._id;
    return ret;
  },
});

export const CategoryModel = model("Category", categorySchema);
