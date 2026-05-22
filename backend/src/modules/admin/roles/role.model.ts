import { Schema, model } from "mongoose";

const adminRoleSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    label: { type: String, required: true },
    isSystem: { type: Boolean, default: false },
    permissions: { type: [String], default: [] },
  },
  { collection: "admin_roles", timestamps: true, versionKey: false },
);

export type AdminRole = {
  key: string;
  label: string;
  isSystem?: boolean;
  permissions?: string[];
};

export const AdminRoleModel = model("AdminRole", adminRoleSchema);
