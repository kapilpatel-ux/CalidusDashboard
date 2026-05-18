import { Router } from "express";
import { validateBody } from "../../../middleware/validate.js";
import { listNotifications, updateNotificationRead } from "./notification.controller.js";
import { notificationReadSchema } from "./notification.validation.js";

export const notificationRoutes = Router();

notificationRoutes.get("/", listNotifications);
notificationRoutes.patch("/:notificationId/read", validateBody(notificationReadSchema), updateNotificationRead);
