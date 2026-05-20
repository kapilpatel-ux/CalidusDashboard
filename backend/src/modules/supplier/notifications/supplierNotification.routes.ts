import { Router } from "express";
import { validateBody } from "../../../middleware/validate.js";
import { listSupplierNotifications, updateSupplierNotificationRead } from "./supplierNotification.controller.js";
import { supplierNotificationReadSchema } from "./supplierNotification.validation.js";

export const supplierNotificationRoutes = Router();

supplierNotificationRoutes.get("/:supplierId/notifications", listSupplierNotifications);
supplierNotificationRoutes.patch(
  "/:supplierId/notifications/:notificationId/read",
  validateBody(supplierNotificationReadSchema),
  updateSupplierNotificationRead,
);

