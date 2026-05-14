import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { HttpError } from "../../utils/httpError.js";
import { BuyerModel } from "./buyer.model.js";

export const listBuyers = asyncHandler(async (_req: Request, res: Response) => {
  const buyers = await BuyerModel.find({}, { _id: 0 }).lean();
  res.json(buyers);
});

export const updateBuyerStatus = asyncHandler(async (req: Request, res: Response) => {
  const updated = await BuyerModel.findOneAndUpdate(
    { id: req.params.buyerId },
    { $set: { status: req.body.status } },
    { new: true, projection: { _id: 0 } },
  ).lean();
  if (!updated) throw new HttpError(404, "Buyer not found");
  res.json(updated);
});

export const deleteBuyer = asyncHandler(async (req: Request, res: Response) => {
  const result = await BuyerModel.deleteOne({ id: req.params.buyerId });
  if (!result.deletedCount) throw new HttpError(404, "Buyer not found");
  res.json({ success: true, message: "Buyer deleted" });
});
