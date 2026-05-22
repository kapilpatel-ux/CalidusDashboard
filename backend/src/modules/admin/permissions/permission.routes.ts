import { Router } from "express";
import { validateBody } from "../../../middleware/validate.js";
import {
  createAdminPermission,
  deleteAdminPermission,
  listAdminPermissions,
  updateAdminPermission,
} from "./permission.controller.js";
import { adminPermissionCreateSchema, adminPermissionUpdateSchema } from "./permission.validation.js";

export const permissionRoutes = Router();

permissionRoutes.get("/", listAdminPermissions);
permissionRoutes.post("/", validateBody(adminPermissionCreateSchema), createAdminPermission);
permissionRoutes.patch("/:permissionKey", validateBody(adminPermissionUpdateSchema), updateAdminPermission);
permissionRoutes.delete("/:permissionKey", deleteAdminPermission);

