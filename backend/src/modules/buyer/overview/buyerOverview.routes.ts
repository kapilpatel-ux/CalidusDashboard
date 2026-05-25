import { Router } from "express";
import { getBuyerOverview } from "./buyerOverview.controller.js";

export const buyerOverviewRoutes = Router();

buyerOverviewRoutes.get("/:buyerId/overview", getBuyerOverview);
