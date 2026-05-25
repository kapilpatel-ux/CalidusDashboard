import { Router } from "express";
import { validateBody } from "../../../middleware/validate.js";
import {
  createSupplier,
  deleteSupplier,
  exportSuppliersCsv,
  importSuppliersCsv,
  getApprovedSupplier,
  getSupplier,
  listApprovedSuppliers,
  listSuppliers,
  updateSupplier,
  updateSupplierStatus,
} from "./supplier.controller.js";
import { createSupplierSchema, supplierStatusSchema, updateSupplierSchema } from "./supplier.validation.js";

export const supplierRoutes = Router();

supplierRoutes.get("/", listSuppliers);
supplierRoutes.get("/export", exportSuppliersCsv);
supplierRoutes.post("/import", importSuppliersCsv);
supplierRoutes.get("/approved", listApprovedSuppliers);
supplierRoutes.get("/approved/:supplierId", getApprovedSupplier);
supplierRoutes.get("/:supplierId", getSupplier);
supplierRoutes.post("/", validateBody(createSupplierSchema), createSupplier);
supplierRoutes.put("/:supplierId", validateBody(updateSupplierSchema), updateSupplier);
supplierRoutes.patch("/:supplierId/status", validateBody(supplierStatusSchema), updateSupplierStatus);
supplierRoutes.delete("/:supplierId", deleteSupplier);
