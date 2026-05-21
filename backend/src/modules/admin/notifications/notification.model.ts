import { Schema, model } from "mongoose";

const notificationSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    audience: { type: String, default: "admin" },
    type: { type: String, default: "info" },
    title: { type: String, default: "" },
    message: { type: String, default: "" },
    date: { type: String, default: "" },
    read: { type: Boolean, default: false },
    link: { type: String, default: "" },
  },
  { collection: "notifications", strict: false, versionKey: false },
);

notificationSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete (ret as { _id?: unknown })._id;
    return ret;
  },
});

export const NotificationModel = model("Notification", notificationSchema);
