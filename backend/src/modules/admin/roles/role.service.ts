import { AdminRoleModel } from "./role.model.js";
import { ensureDefaultAdminPermissions } from "../permissions/permission.service.js";

const DEFAULT_ADMIN_ROLES = [
  {
    key: "sub_admin",
    label: "Sub Admin",
    isSystem: true,
    permissions: [
      "admin.suppliermanagement",
      "admin.productmanagement",
      "admin.ratingsmoderation",
      "admin.categorymanagement",
      "admin.buyermanagement",
      "admin.enquirymanagement",
      "admin.notificationmanagement",
      "admin.usermanagement",
      "admin.profile",
    ],
  },
  {
    key: "content_manager",
    label: "Content Manager",
    isSystem: true,
    permissions: [
      "admin.suppliermanagement",
      "admin.productmanagement",
      "admin.ratingsmoderation",
      "admin.categorymanagement",
      "admin.buyermanagement",
      "admin.enquirymanagement",
      "admin.notificationmanagement",
      "admin.usermanagement",
      "admin.profile",
    ],
  },
] as const;

export const ensureDefaultAdminRoles = async () => {
  await ensureDefaultAdminPermissions();
  await Promise.all(
    DEFAULT_ADMIN_ROLES.map((role) =>
      AdminRoleModel.updateOne({ key: role.key }, { $setOnInsert: role }, { upsert: true }),
    ),
  );
};

export const normalizeRoleKey = (label: string) => {
  const cleaned = String(label || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return cleaned;
};
