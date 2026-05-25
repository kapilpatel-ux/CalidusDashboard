import { Router } from "express";
import { validateBody } from "../../../middleware/validate.js";
import {
  createProduct,
  deleteProduct,
  exportProductsCsv,
  getApprovedProduct,
  getProduct,
  listApprovedProducts,
  listProducts,
  updateProduct,
  updateProductStatus,
} from "./product.controller.js";
import { createProductSchema, productStatusSchema, updateProductSchema } from "./product.validation.js";

export const productRoutes = Router();

productRoutes.get("/", listProducts);
productRoutes.get("/export", exportProductsCsv);
productRoutes.get("/approved", listApprovedProducts);
productRoutes.get("/approved/:productId", getApprovedProduct);
productRoutes.get("/:productId", getProduct);
productRoutes.post("/", validateBody(createProductSchema), createProduct);
productRoutes.put("/:productId", validateBody(updateProductSchema), updateProduct);
productRoutes.patch("/:productId/status", validateBody(productStatusSchema), updateProductStatus);
productRoutes.delete("/:productId", deleteProduct);
