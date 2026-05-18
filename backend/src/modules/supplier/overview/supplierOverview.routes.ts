import { Router } from "express";
import { getSupplierOverview } from "./supplierOverview.controller.js";

export const supplierOverviewRoutes = Router();

supplierOverviewRoutes.get("/:supplierId/overview", getSupplierOverview);
