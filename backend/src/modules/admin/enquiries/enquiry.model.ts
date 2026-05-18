import { Schema, model } from "mongoose";

const enquirySchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    productId: { type: String, default: "" },
    productName: { type: String, default: "" },
    supplierId: { type: String, default: "" },
    supplierName: { type: String, default: "" },
    buyerId: { type: String, default: "" },
    buyerName: { type: String, default: "" },
    buyerCompany: { type: String, default: "" },
    message: { type: String, default: "" },
    date: { type: String, default: "" },
    status: { type: String, default: "pending" },
    reply: { type: String, default: null },
    replyDate: { type: String, default: null },
  },
  { collection: "enquiries", strict: false, versionKey: false },
);

enquirySchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete (ret as { _id?: unknown })._id;
    return ret;
  },
});

export const EnquiryModel = model("Enquiry", enquirySchema);
