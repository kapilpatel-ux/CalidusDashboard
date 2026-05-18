import { Schema, model } from "mongoose";

const authUserSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "buyer", "supplier"], required: true },
    profileId: { type: String, default: "" },
    company: { type: String, default: "" },
    status: { type: String, default: "active" },
  },
  { collection: "users", timestamps: true, versionKey: false },
);

authUserSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete (ret as { _id?: unknown })._id;
    delete (ret as { passwordHash?: unknown }).passwordHash;
    return ret;
  },
});

export const AuthUserModel = model("AuthUser", authUserSchema);
