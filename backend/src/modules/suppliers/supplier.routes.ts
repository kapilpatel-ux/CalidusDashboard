import { Router } from "express";
import { validateBody } from "../../middleware/validate.js";
import {
  createSupplier,
  deleteSupplier,
  getSupplier,
  listSuppliers,
  updateSupplier,
  updateSupplierStatus,
} from "./supplier.controller.js";
import { createSupplierSchema, supplierStatusSchema, updateSupplierSchema } from "./supplier.validation.js";

export const supplierRoutes = Router();

supplierRoutes.get("/", listSuppliers);
supplierRoutes.get("/:supplierId", getSupplier);
supplierRoutes.post("/", validateBody(createSupplierSchema), createSupplier);
supplierRoutes.put("/:supplierId", validateBody(updateSupplierSchema), updateSupplier);
supplierRoutes.patch("/:supplierId/status", validateBody(supplierStatusSchema), updateSupplierStatus);
supplierRoutes.delete("/:supplierId", deleteSupplier);
