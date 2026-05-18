import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { HttpError } from "../../../utils/httpError.js";
import { BuyerModel } from "../../admin/buyers/buyer.model.js";

export const getBuyerProfile = asyncHandler(async (req: Request, res: Response) => {
  const buyer = await BuyerModel.findOne(
    { id: req.params.buyerId },
    { _id: 0 },
  ).lean();

  if (!buyer) throw new HttpError(404, "Buyer not found");
  res.json(buyer);
});

export const updateBuyerProfile = asyncHandler(async (req: Request, res: Response) => {
  const updated = await BuyerModel.findOneAndUpdate(
    { id: req.params.buyerId },
    { $set: req.body },
    { new: true, projection: { _id: 0 } },
  ).lean();

  if (!updated) throw new HttpError(404, "Buyer not found");
  res.json(updated);
});
