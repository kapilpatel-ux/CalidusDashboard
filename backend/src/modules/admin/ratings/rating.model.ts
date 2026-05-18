import { Schema, model } from "mongoose";

const ratingSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    status: { type: String, default: "pending" },
    replyStatus: { type: String, default: "pending" },
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
