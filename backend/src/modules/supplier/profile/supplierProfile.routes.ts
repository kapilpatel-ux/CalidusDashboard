import { Router } from "express";
import { validateBody } from "../../../middleware/validate.js";
import { getSupplierProfile, updateSupplierProfile } from "./supplierProfile.controller.js";
import { updateSupplierProfileSchema } from "./supplierProfile.validation.js";

export const supplierProfileRoutes = Router();

supplierProfileRoutes.get("/:supplierId/profile", getSupplierProfile);
supplierProfileRoutes.put("/:supplierId/profile", validateBody(updateSupplierProfileSchema), updateSupplierProfile);
