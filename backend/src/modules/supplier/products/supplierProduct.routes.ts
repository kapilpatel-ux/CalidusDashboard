import { Router } from "express";
import { validateBody } from "../../../middleware/validate.js";
import {
  createSupplierProduct,
  deleteSupplierProduct,
  listSupplierProducts,
  updateSupplierProduct,
} from "./supplierProduct.controller.js";
import {
  createSupplierProductSchema,
  updateSupplierProductSchema,
} from "./supplierProduct.validation.js";

export const supplierProductRoutes = Router();

supplierProductRoutes.get("/:supplierId/products", listSupplierProducts);
supplierProductRoutes.post("/:supplierId/products", validateBody(createSupplierProductSchema), createSupplierProduct);
supplierProductRoutes.put(
  "/:supplierId/products/:productId",
  validateBody(updateSupplierProductSchema),
  updateSupplierProduct,
);
supplierProductRoutes.delete("/:supplierId/products/:productId", deleteSupplierProduct);
