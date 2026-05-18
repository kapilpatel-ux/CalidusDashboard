import { Router } from "express";
import { getDashboardOverview } from "./dashboard.controller.js";

export const dashboardRoutes = Router();

dashboardRoutes.get("/", getDashboardOverview);
