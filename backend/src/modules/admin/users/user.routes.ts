import { Router } from "express";
import { validateBody } from "../../../middleware/validate.js";
import { listUsers, updateUserStatus } from "./user.controller.js";
import { userStatusSchema } from "./user.validation.js";

export const userRoutes = Router();

userRoutes.get("/", listUsers);
userRoutes.patch("/:role/:userId/status", validateBody(userStatusSchema), updateUserStatus);
