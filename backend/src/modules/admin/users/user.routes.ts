import { Router } from "express";
import { validateBody } from "../../../middleware/validate.js";
import { createUser, listUsers, updateUser, updateUserStatus } from "./user.controller.js";
import { userCreateSchema, userStatusSchema, userUpdateSchema } from "./user.validation.js";

export const userRoutes = Router();

userRoutes.get("/", listUsers);
userRoutes.post("/", validateBody(userCreateSchema), createUser);
userRoutes.patch("/:userId/status", validateBody(userStatusSchema), updateUserStatus);
userRoutes.patch("/:userId", validateBody(userUpdateSchema), updateUser);
