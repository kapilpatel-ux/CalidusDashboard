import { Router } from "express";
import { validateBody } from "../../../middleware/validate.js";
import {
  createRating,
  deleteRating,
  listRatings,
  updateRating,
  updateRatingStatus,
  updateReplyStatus,
} from "./rating.controller.js";
import { createRatingSchema, ratingStatusSchema, updateRatingSchema } from "./rating.validation.js";

export const ratingRoutes = Router();

ratingRoutes.get("/", listRatings);
ratingRoutes.post("/", validateBody(createRatingSchema), createRating);
ratingRoutes.put("/:ratingId", validateBody(updateRatingSchema), updateRating);
ratingRoutes.patch("/:ratingId/status", validateBody(ratingStatusSchema), updateRatingStatus);
ratingRoutes.patch("/:ratingId/reply-status", validateBody(ratingStatusSchema), updateReplyStatus);
ratingRoutes.delete("/:ratingId", deleteRating);
