import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { HttpError } from "../../../utils/httpError.js";
import { createReadableId } from "../../../utils/id.js";
import { RatingModel } from "./rating.model.js";

export const listRatings = asyncHandler(async (_req: Request, res: Response) => {
  const ratings = await RatingModel.find({}, { _id: 0 }).lean();
  res.json(ratings);
});

export const createRating = asyncHandler(async (req: Request, res: Response) => {
  const payload = { ...req.body, id: req.body.id || createReadableId("RAT") };
  const created = await RatingModel.create(payload);
  res.status(201).json(created.toJSON());
});

export const updateRating = asyncHandler(async (req: Request, res: Response) => {
  const updated = await RatingModel.findOneAndUpdate(
    { id: req.params.ratingId },
    { $set: req.body },
    { new: true, projection: { _id: 0 } },
  ).lean();
  if (!updated) throw new HttpError(404, "Rating not found");
  res.json(updated);
});

export const updateRatingStatus = asyncHandler(async (req: Request, res: Response) => {
  const updated = await RatingModel.findOneAndUpdate(
    { id: req.params.ratingId },
    { $set: { status: req.body.status } },
    { new: true, projection: { _id: 0 } },
  ).lean();
  if (!updated) throw new HttpError(404, "Rating not found");
  res.json(updated);
});

export const updateReplyStatus = asyncHandler(async (req: Request, res: Response) => {
  const updated = await RatingModel.findOneAndUpdate(
    { id: req.params.ratingId },
    { $set: { replyStatus: req.body.status, supplierReplyStatus: req.body.status } },
    { new: true, projection: { _id: 0 } },
  ).lean();
  if (!updated) throw new HttpError(404, "Rating not found");
  res.json(updated);
});

export const deleteRating = asyncHandler(async (req: Request, res: Response) => {
  const result = await RatingModel.deleteOne({ id: req.params.ratingId });
  if (!result.deletedCount) throw new HttpError(404, "Rating not found");
  res.json({ success: true, message: "Rating deleted" });
});
