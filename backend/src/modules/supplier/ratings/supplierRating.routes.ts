import { Router } from "express";
import { validateBody } from "../../../middleware/validate.js";
import {
  listSupplierRatings,
  replyToSupplierRating,
} from "./supplierRating.controller.js";
import { supplierRatingReplySchema } from "./supplierRating.validation.js";

export const supplierRatingRoutes = Router();

supplierRatingRoutes.get("/:supplierId/ratings", listSupplierRatings);
supplierRatingRoutes.patch(
  "/:supplierId/ratings/:ratingId/reply",
  validateBody(supplierRatingReplySchema),
  replyToSupplierRating,
);
