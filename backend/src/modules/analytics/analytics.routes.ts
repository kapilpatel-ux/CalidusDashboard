import { Router } from "express";
import { getAnalytics } from "./analytics.controller.js";

export const analyticsRoutes = Router();

analyticsRoutes.get("/", getAnalytics);
