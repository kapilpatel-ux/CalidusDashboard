import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { HttpError } from "../../../utils/httpError.js";
import { createReadableId } from "../../../utils/id.js";
import { RatingModel } from "./rating.model.js";
import { refreshRatingAggregates } from "./rating.service.js";
import { createSupplierNotification } from "../../supplier/notifications/supplierNotification.service.js";

export const listRatings = asyncHandler(async (_req: Request, res: Response) => {
  const ratings = await RatingModel.find({}, { _id: 0 }).lean();
  res.json(ratings);
});

export const createRating = asyncHandler(async (req: Request, res: Response) => {
  const payload = { ...req.body, id: req.body.id || createReadableId("RAT") };
  const created = await RatingModel.create(payload);
  await refreshRatingAggregates(created.toJSON());
  res.status(201).json(created.toJSON());
});

export const updateRating = asyncHandler(async (req: Request, res: Response) => {
  const existing = await RatingModel.findOne({ id: req.params.ratingId }, { _id: 0 }).lean();

  const updated = await RatingModel.findOneAndUpdate(
    { id: req.params.ratingId },
    { $set: req.body },
    { new: true, projection: { _id: 0 } },
  ).lean();
  if (!updated) throw new HttpError(404, "Rating not found");

  await Promise.all([
    refreshRatingAggregates(existing || {}),
    refreshRatingAggregates(updated),
  ]);
  if (updated.supplierId) {
    try {
      await createSupplierNotification({
        supplierId: updated.supplierId,
        type: "rating",
        title: "Rating Updated",
        message: `Rating for "${updated.productName || "your product"}" was updated by admin.`,
        link: "ratings",
      });
    } catch (err) {
      console.error("Failed to create supplier notification for rating update", err);
    }
  }
  res.json(updated);
});

export const updateRatingStatus = asyncHandler(async (req: Request, res: Response) => {
  const updated = await RatingModel.findOneAndUpdate(
    { id: req.params.ratingId },
    { $set: { status: req.body.status } },
    { new: true, projection: { _id: 0 } },
  ).lean();
  if (!updated) throw new HttpError(404, "Rating not found");
  await refreshRatingAggregates(updated);
  if (updated.supplierId) {
    try {
      await createSupplierNotification({
        supplierId: updated.supplierId,
        type: "rating",
        title: "Rating Status Updated",
        message: `Rating for "${updated.productName || "your product"}" has been ${req.body.status}.`,
        link: "ratings",
      });
    } catch (err) {
      console.error("Failed to create supplier notification for rating status", err);
    }
  }
  res.json(updated);
});

export const updateReplyStatus = asyncHandler(async (req: Request, res: Response) => {
  const updated = await RatingModel.findOneAndUpdate(
    { id: req.params.ratingId },
    { $set: { replyStatus: req.body.status, supplierReplyStatus: req.body.status } },
    { new: true, projection: { _id: 0 } },
  ).lean();
  if (!updated) throw new HttpError(404, "Rating not found");
  if (updated.supplierId) {
    try {
      await createSupplierNotification({
        supplierId: updated.supplierId,
        type: "rating",
        title: "Rating Reply Status Updated",
        message: `Reply for rating on "${updated.productName || "your product"}" has been ${req.body.status}.`,
        link: "ratings",
      });
    } catch (err) {
      console.error("Failed to create supplier notification for rating reply status", err);
    }
  }
  res.json(updated);
});

export const deleteRating = asyncHandler(async (req: Request, res: Response) => {

  const existing = await RatingModel.findOne(
    { id: req.params.ratingId },
    { productId: 1, supplierId: 1, supplierName: 1, buyerId: 1, _id: 0 },
  ).lean();

  const result = await RatingModel.deleteOne({ id: req.params.ratingId });
  if (!result.deletedCount) throw new HttpError(404, "Rating not found");
  await refreshRatingAggregates(existing || {});
  if (existing?.supplierId) {
    try {
      await createSupplierNotification({
        supplierId: existing.supplierId,
        type: "rating",
        title: "Rating Deleted",
        message: `Rating for "${existing.productId || "your product"}" was deleted by admin.`,
        link: "ratings",
      });
    } catch (err) {
      console.error("Failed to create supplier notification for rating delete", err);
    }
  }
  res.json({ success: true, message: "Rating deleted" });
});
