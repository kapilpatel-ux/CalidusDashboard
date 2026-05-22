import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { HttpError } from "../../../utils/httpError.js";
import { AdminPermissionModel } from "./permission.model.js";
import { ensureDefaultAdminPermissions, normalizePermissionKey } from "./permission.service.js";
import { AdminRoleModel } from "../roles/role.model.js";

export const listAdminPermissions = asyncHandler(async (_req: Request, res: Response) => {
  await ensureDefaultAdminPermissions();
  const permissions = await AdminPermissionModel.find({}, { _id: 0 })
    .sort({ isSystem: -1, group: 1, label: 1 })
    .lean();
  res.json(permissions);
});

export const createAdminPermission = asyncHandler(async (req: Request, res: Response) => {
  await ensureDefaultAdminPermissions();
  const label = String(req.body.label || "").trim();
  const group = String(req.body.group || "Admin").trim() || "Admin";

  const key = `admin.${normalizePermissionKey(label)}`;
  if (!key || key === "admin.") throw new HttpError(400, "Invalid permission name");

  const existing = await AdminPermissionModel.findOne({ key }, { _id: 0 }).lean();
  if (existing) throw new HttpError(409, "Permission already exists");

  const created = await AdminPermissionModel.create({ key, label, group, isSystem: false });
  res.status(201).json({ key: created.key, label: created.label, group: created.group, isSystem: created.isSystem });
});

export const updateAdminPermission = asyncHandler(async (req: Request, res: Response) => {
  await ensureDefaultAdminPermissions();
  const permissionKey = String(req.params.permissionKey || "").trim();
  if (!permissionKey) throw new HttpError(400, "Permission key is required");

  const existing = await AdminPermissionModel.findOne({ key: permissionKey }).lean();
  if (!existing) throw new HttpError(404, "Permission not found");
  if (existing.isSystem) throw new HttpError(400, "System permissions cannot be edited");

  const label = String(req.body.label || "").trim();
  const group = String(req.body.group || existing.group || "Admin").trim() || "Admin";
  if (!label) throw new HttpError(400, "Permission name is required");

  const updated = await AdminPermissionModel.findOneAndUpdate(
    { key: permissionKey },
    { $set: { label, group } },
    { new: true, projection: { _id: 0 } },
  ).lean();

  res.json(updated);
});

export const deleteAdminPermission = asyncHandler(async (req: Request, res: Response) => {
  await ensureDefaultAdminPermissions();
  const permissionKey = String(req.params.permissionKey || "").trim();
  if (!permissionKey) throw new HttpError(400, "Permission key is required");

  const existing = await AdminPermissionModel.findOne({ key: permissionKey }).lean();
  if (!existing) throw new HttpError(404, "Permission not found");
  if (existing.isSystem) throw new HttpError(400, "System permissions cannot be deleted");

  const inUse = await AdminRoleModel.exists({ permissions: permissionKey });
  if (inUse) throw new HttpError(409, "Permission is assigned to roles and cannot be deleted");

  await AdminPermissionModel.deleteOne({ key: permissionKey });
  res.json({ ok: true });
});

