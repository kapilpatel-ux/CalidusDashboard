import { Schema, model } from "mongoose";

const buyerSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    status: { type: String, default: "active" },
  },
  { collection: "buyers", strict: false, versionKey: false },
);

buyerSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete (ret as { _id?: unknown })._id;
    return ret;
  },
});

export const BuyerModel = model("Buyer", buyerSchema);
