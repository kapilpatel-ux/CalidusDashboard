import { Schema, model } from "mongoose";

const statusCheckSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    client_name: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { collection: "status_checks", versionKey: false },
);

statusCheckSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete (ret as { _id?: unknown })._id;
    return ret;
  },
});

export const StatusCheckModel = model("StatusCheck", statusCheckSchema);
