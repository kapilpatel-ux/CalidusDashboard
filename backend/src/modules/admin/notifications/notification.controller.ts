import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { HttpError } from "../../../utils/httpError.js";
import { NotificationModel } from "./notification.model.js";

export const listNotifications = asyncHandler(async (_req: Request, res: Response) => {
  const notifications = await NotificationModel.find({}, { _id: 0 }).sort({ date: -1 }).lean();
  res.json(notifications);
});

export const updateNotificationRead = asyncHandler(async (req: Request, res: Response) => {
  const updated = await NotificationModel.findOneAndUpdate(
    { id: req.params.notificationId },
    { $set: { read: req.body.read } },
    { new: true, projection: { _id: 0 } },
  ).lean();

  if (!updated) throw new HttpError(404, "Notification not found");
  res.json(updated);
});
