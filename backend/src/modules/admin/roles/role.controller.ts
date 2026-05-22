import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { HttpError } from "../../../utils/httpError.js";
import { AdminRoleModel } from "./role.model.js";
import { ensureDefaultAdminRoles, normalizeRoleKey } from "./role.service.js";
import { AuthUserModel } from "../../auth/auth.model.js";
import { ensureDefaultAdminPermissions } from "../permissions/permission.service.js";
import { AdminPermissionModel } from "../permissions/permission.model.js";

export const listAdminRoles = asyncHandler(async (_req: Request, res: Response) => {
  await ensureDefaultAdminRoles();
  const roles = await AdminRoleModel.find({}, { _id: 0 }).sort({ isSystem: -1, label: 1 }).lean();
  res.json(roles);
});

export const createAdminRole = asyncHandler(async (req: Request, res: Response) => {
  await ensureDefaultAdminRoles();
  const label = String(req.body.label || "").trim();
  const key = normalizeRoleKey(label);

  if (!key) throw new HttpError(400, "Invalid role name");
  if (key === "admin" || key === "buyer" || key === "supplier") {
    throw new HttpError(400, `"${key}" is a reserved role`);
  }

  const existing = await AdminRoleModel.findOne({ key }, { _id: 0 }).lean();
  if (existing) throw new HttpError(409, "Role already exists");

  const created = await AdminRoleModel.create({ key, label, isSystem: false });
  res.status(201).json({ key: created.key, label: created.label, isSystem: created.isSystem });
});

export const updateAdminRole = asyncHandler(async (req: Request, res: Response) => {
  await ensureDefaultAdminRoles();
  const roleKey = String(req.params.roleKey || "").trim();
  if (!roleKey) throw new HttpError(400, "Role key is required");

  const existing = await AdminRoleModel.findOne({ key: roleKey }).lean();
  if (!existing) throw new HttpError(404, "Role not found");
  if (existing.isSystem) throw new HttpError(400, "System roles cannot be edited");

  const label = String(req.body.label || "").trim();
  if (!label) throw new HttpError(400, "Role name is required");

  const updated = await AdminRoleModel.findOneAndUpdate(
    { key: roleKey },
    { $set: { label } },
    { new: true, projection: { _id: 0 } },
  ).lean();

  res.json(updated);
});

export const deleteAdminRole = asyncHandler(async (req: Request, res: Response) => {
  await ensureDefaultAdminRoles();
  const roleKey = String(req.params.roleKey || "").trim();
  if (!roleKey) throw new HttpError(400, "Role key is required");

  const existing = await AdminRoleModel.findOne({ key: roleKey }).lean();
  if (!existing) throw new HttpError(404, "Role not found");
  if (existing.isSystem) throw new HttpError(400, "System roles cannot be deleted");

  const inUse = await AuthUserModel.exists({ role: roleKey });
  if (inUse) throw new HttpError(409, "Role is assigned to users and cannot be deleted");

  await AdminRoleModel.deleteOne({ key: roleKey });
  res.json({ ok: true });
});

export const updateAdminRolePermissions = asyncHandler(async (req: Request, res: Response) => {
  await ensureDefaultAdminRoles();
  await ensureDefaultAdminPermissions();
  const roleKey = String(req.params.roleKey || "").trim();
  if (!roleKey) throw new HttpError(400, "Role key is required");

  const existing = await AdminRoleModel.findOne({ key: roleKey }).lean();
  if (!existing) throw new HttpError(404, "Role not found");

  const permsRaw: unknown = (req.body as { permissions?: unknown }).permissions;
  const perms: unknown[] = Array.isArray(permsRaw) ? permsRaw : [];
  const cleaned = perms
    .map((p: unknown) => String(p).trim())
    .filter((p): p is string => Boolean(p));
  const unique: string[] = Array.from(new Set(cleaned));

  const knownPermissions = await AdminPermissionModel.find(
    { key: { $in: unique } },
    { _id: 0, key: 1 },
  ).lean();
  const knownSet = new Set(knownPermissions.map((p) => p.key));
  const unknown = unique.filter((p) => !knownSet.has(p));
  if (unknown.length > 0) throw new HttpError(400, `Unknown permission(s): ${unknown.join(", ")}`);

  const updated = await AdminRoleModel.findOneAndUpdate(
    { key: roleKey },
    { $set: { permissions: unique } },
    { new: true, projection: { _id: 0 } },
  ).lean();

  res.json(updated);
});
