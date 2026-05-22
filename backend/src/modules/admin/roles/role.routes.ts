import { Router } from "express";
import { validateBody } from "../../../middleware/validate.js";
import {
  createAdminRole,
  deleteAdminRole,
  listAdminRoles,
  updateAdminRole,
  updateAdminRolePermissions,
} from "./role.controller.js";
import { adminRoleCreateSchema, adminRolePermissionsSchema, adminRoleUpdateSchema } from "./role.validation.js";

export const roleRoutes = Router();

roleRoutes.get("/", listAdminRoles);
roleRoutes.post("/", validateBody(adminRoleCreateSchema), createAdminRole);
roleRoutes.patch("/:roleKey", validateBody(adminRoleUpdateSchema), updateAdminRole);
roleRoutes.patch("/:roleKey/permissions", validateBody(adminRolePermissionsSchema), updateAdminRolePermissions);
roleRoutes.delete("/:roleKey", deleteAdminRole);
