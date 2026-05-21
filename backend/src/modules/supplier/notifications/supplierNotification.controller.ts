import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { HttpError } from "../../../utils/httpError.js";
import { SupplierNotificationModel } from "./supplierNotification.model.js";

export const listSupplierNotifications = asyncHandler(async (req: Request, res: Response) => {
  const supplierId = req.params.supplierId;
  const notifications = await SupplierNotificationModel.find(
    {
      $and: [
        { $or: [{ supplierId }, { supplierId: { $exists: false } }, { supplierId: "" }] },
        { $or: [{ audience: { $in: ["supplier", "all"] } }, { audience: { $exists: false } }] },
      ],
    },
    { _id: 0 },
  ).sort({ date: -1 }).lean();
  res.json(notifications);
});

export const updateSupplierNotificationRead = asyncHandler(async (req: Request, res: Response) => {
  const supplierId = req.params.supplierId;
  const updated = await SupplierNotificationModel.findOneAndUpdate(
    {
      id: req.params.notificationId,
      $and: [
        { $or: [{ supplierId }, { supplierId: { $exists: false } }, { supplierId: "" }] },
        { $or: [{ audience: { $in: ["supplier", "all"] } }, { audience: { $exists: false } }] },
      ],
    },
    { $set: { read: req.body.read } },
    { new: true, projection: { _id: 0 } },
  ).lean();

  if (!updated) throw new HttpError(404, "Notification not found");
  res.json(updated);
});
