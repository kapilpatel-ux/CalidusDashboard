import { Schema, model } from "mongoose";

const supplierNotificationSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    supplierId: { type: String, default: "" },
    type: { type: String, default: "info" },
    title: { type: String, default: "" },
    message: { type: String, default: "" },
    date: { type: String, default: "" },
    read: { type: Boolean, default: false },
    link: { type: String, default: "" },
  },
  { collection: "notifications", strict: false, versionKey: false },
);

supplierNotificationSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete (ret as { _id?: unknown })._id;
    return ret;
  },
});

export const SupplierNotificationModel = model("SupplierNotification", supplierNotificationSchema);

