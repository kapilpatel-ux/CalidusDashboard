import { Router } from "express";
import { validateBody } from "../../../middleware/validate.js";
import { getBuyerProfile, updateBuyerProfile } from "./buyerProfile.controller.js";
import { updateBuyerProfileSchema } from "./buyerProfile.validation.js";

export const buyerProfileRoutes = Router();

buyerProfileRoutes.get("/:buyerId/profile", getBuyerProfile);
buyerProfileRoutes.put("/:buyerId/profile", validateBody(updateBuyerProfileSchema), updateBuyerProfile);
