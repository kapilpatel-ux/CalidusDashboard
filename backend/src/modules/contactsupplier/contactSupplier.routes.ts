import { Router } from "express";
import { validateBody } from "../../middleware/validate.js";
import { createContactSupplier } from "./contactSupplier.controller.js";
import { createContactSupplierSchema } from "./contactSupplier.validation.js";

export const contactSupplierRoutes = Router();

contactSupplierRoutes.post(
  "/",
  validateBody(createContactSupplierSchema),
  createContactSupplier,
);