import { Schema, model } from "mongoose";

const ratingSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    productId: { type: String, default: "" },
    productName: { type: String, default: "" },
    supplierId: { type: String, default: "" },
    supplierName: { type: String, default: "" },
    buyerId: { type: String, default: "" },
    buyerName: { type: String, default: "" },
    rating: { type: Number, default: 0 },
    review: { type: String, default: "" },
    submissionDate: { type: String, default: "" },
    status: { type: String, default: "pending" },
    supplierReply: { type: String, default: null },
    supplierReplyStatus: { type: String, default: null },
    replyStatus: { type: String, default: "pending" },
    isEditable: { type: Boolean, default: true },
  },
  { collection: "ratings", strict: false, versionKey: false },
);

ratingSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete (ret as { _id?: unknown })._id;
    return ret;
  },
});

export const RatingModel = model("Rating", ratingSchema);
