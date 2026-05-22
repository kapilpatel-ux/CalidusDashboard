import { Schema, model } from "mongoose";

const adminPermissionSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    label: { type: String, required: true },
    group: { type: String, default: "Admin" },
    isSystem: { type: Boolean, default: false },
  },
  { collection: "admin_permissions", timestamps: true, versionKey: false },
);

export type AdminPermission = {
  key: string;
  label: string;
  group?: string;
  isSystem?: boolean;
};

export const AdminPermissionModel = model("AdminPermission", adminPermissionSchema);

