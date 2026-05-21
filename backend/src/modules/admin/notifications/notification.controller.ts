import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { HttpError } from "../../../utils/httpError.js";
import { NotificationModel } from "./notification.model.js";

const parsePositiveInt = (value: unknown, fallback: number) => {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const listNotifications = asyncHandler(async (req: Request, res: Response) => {
  const limit = parsePositiveInt(req.query.limit, 0);
  const query = {
    $or: [{ audience: { $in: ["admin", "all"] } }, { audience: { $exists: false } }],
  };

  const cursor = NotificationModel.find(query, { _id: 0 }).sort({ date: -1, id: -1 });
  const notifications = (limit > 0 ? await cursor.limit(limit).lean() : await cursor.lean());
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
