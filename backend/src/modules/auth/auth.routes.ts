import { Router } from "express";
import { validateBody } from "../../middleware/validate.js";
import { login, signup } from "./auth.controller.js";
import { loginSchema, signupSchema } from "./auth.validation.js";

export const authRoutes = Router();

authRoutes.post("/signup", validateBody(signupSchema), signup);
authRoutes.post("/login", validateBody(loginSchema), login);
