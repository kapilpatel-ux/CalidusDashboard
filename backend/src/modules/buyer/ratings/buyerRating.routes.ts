import { Router } from "express";
import { validateBody } from "../../../middleware/validate.js";
import {
  createBuyerRating,
  listBuyerRatings,
  updateBuyerRating,
} from "./buyerRating.controller.js";
import {
  createBuyerRatingSchema,
  updateBuyerRatingSchema,
} from "./buyerRating.validation.js";

export const buyerRatingRoutes = Router();

buyerRatingRoutes.get("/:buyerId/ratings", listBuyerRatings);
buyerRatingRoutes.post("/:buyerId/ratings", validateBody(createBuyerRatingSchema), createBuyerRating);
buyerRatingRoutes.put(
  "/:buyerId/ratings/:ratingId",
  validateBody(updateBuyerRatingSchema),
  updateBuyerRating,
);
