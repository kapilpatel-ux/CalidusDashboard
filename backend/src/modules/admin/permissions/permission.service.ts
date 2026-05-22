import { AdminPermissionModel } from "./permission.model.js";

const DEFAULT_ADMIN_PERMISSIONS = [
  { key: "admin.suppliermanagement", label: "Supplier Management", group: "Admin", isSystem: true },
  { key: "admin.productmanagement", label: "Product Management", group: "Admin", isSystem: true },
  { key: "admin.ratingsmoderation", label: "Ratings Moderation", group: "Admin", isSystem: true },
  { key: "admin.categorymanagement", label: "Category Management", group: "Admin", isSystem: true },
  { key: "admin.buyermanagement", label: "Buyer Management", group: "Admin", isSystem: true },
  { key: "admin.enquirymanagement", label: "Enquiry Management", group: "Admin", isSystem: true },
  { key: "admin.notificationmanagement", label: "Notification Management", group: "Admin", isSystem: true },
  { key: "admin.usermanagement", label: "User Management", group: "Admin", isSystem: true },
  { key: "admin.rolemanagement", label: "Role Management", group: "Admin", isSystem: true },
  { key: "admin.permissionmanagement", label: "Permission Management", group: "Admin", isSystem: true },
  { key: "admin.platforminsights", label: "Platform Insights", group: "Admin", isSystem: true },
  { key: "admin.overview", label: "Overview", group: "Admin", isSystem: true },
  { key: "admin.profile", label: "Profile", group: "Admin", isSystem: true },
] as const;

export const ensureDefaultAdminPermissions = async () => {
  await Promise.all(
    DEFAULT_ADMIN_PERMISSIONS.map((perm) =>
      AdminPermissionModel.updateOne({ key: perm.key }, { $setOnInsert: perm }, { upsert: true }),
    ),
  );
};

export const normalizePermissionKey = (input: string) => {
  const cleaned = String(input || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return cleaned;
};

