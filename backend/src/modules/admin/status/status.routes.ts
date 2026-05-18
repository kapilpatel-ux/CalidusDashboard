import { Router } from "express";
import { validateBody } from "../../../middleware/validate.js";
import { createStatusCheck, listStatusChecks } from "./status.controller.js";
import { createStatusCheckSchema } from "./status.validation.js";

export const statusRoutes = Router();

statusRoutes.post("/", validateBody(createStatusCheckSchema), createStatusCheck);
statusRoutes.get("/", listStatusChecks);
