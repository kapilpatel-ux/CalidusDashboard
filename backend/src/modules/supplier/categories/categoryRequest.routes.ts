import { Router } from "express";
import { validateBody } from "../../../middleware/validate.js";
import { createSupplierCategoryRequest, listSupplierCategories, listSupplierCategoryRequests } from "./categoryRequest.controller.js";
import { supplierCategoryRequestSchema } from "./categoryRequest.validation.js";

export const supplierCategoryRequestRoutes = Router();

supplierCategoryRequestRoutes.get("/:supplierId/categories/requests", listSupplierCategoryRequests);
supplierCategoryRequestRoutes.get("/:supplierId/categories", listSupplierCategories);

supplierCategoryRequestRoutes.post(
  "/:supplierId/categories/requests",
  validateBody(supplierCategoryRequestSchema),
  createSupplierCategoryRequest,
);
