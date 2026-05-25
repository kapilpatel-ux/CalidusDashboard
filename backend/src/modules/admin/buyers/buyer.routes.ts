import { Router } from "express";
import { validateBody } from "../../../middleware/validate.js";
import { deleteBuyer, exportBuyersCsv, importBuyersCsv, listBuyers, updateBuyerStatus } from "./buyer.controller.js";
import { buyerStatusSchema } from "./buyer.validation.js";

export const buyerRoutes = Router();

buyerRoutes.get("/", listBuyers);
buyerRoutes.get("/export", exportBuyersCsv);
buyerRoutes.post("/import", importBuyersCsv);
buyerRoutes.patch("/:buyerId/status", validateBody(buyerStatusSchema), updateBuyerStatus);
buyerRoutes.delete("/:buyerId", deleteBuyer);
