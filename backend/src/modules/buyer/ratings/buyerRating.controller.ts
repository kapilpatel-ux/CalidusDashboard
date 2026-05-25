import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { HttpError } from "../../../utils/httpError.js";
import { createReadableId } from "../../../utils/id.js";
import { ProductModel } from "../../admin/products/product.model.js";
import { RatingModel } from "../../admin/ratings/rating.model.js";
import { BuyerModel } from "../../admin/buyers/buyer.model.js";
import { refreshRatingAggregates } from "../../admin/ratings/rating.service.js";

const dateOnly = () => new Date().toISOString().split("T")[0];

async function syncBuyerRatingCount(buyerId: string) {
  const ratingsSubmitted = await RatingModel.countDocuments({ buyerId });
  await BuyerModel.updateOne({ id: buyerId }, { $set: { ratingsSubmitted } });
}

export const listBuyerRatings = asyncHandler(async (req: Request, res: Response) => {
  const buyerId = String(req.params.buyerId);
  const ratings = await RatingModel.find(
    { buyerId },
    { _id: 0 },
  )
    .sort({ submissionDate: -1, createdAt: -1 })
    .lean();

  res.json(ratings);
});

export const createBuyerRating = asyncHandler(async (req: Request, res: Response) => {
  const buyerId = String(req.params.buyerId);
  const [product, buyer] = await Promise.all([
    ProductModel.findOne(
      { id: req.body.productId },
      { _id: 0, id: 1, name: 1, supplierId: 1, supplierName: 1, status: 1 },
    ).lean(),
    BuyerModel.findOne({ id: buyerId }, { _id: 0, id: 1, name: 1 }).lean(),
  ]);

  if (!product) throw new HttpError(404, "Product not found");
  if (!buyer) throw new HttpError(404, "Buyer not found");
  if (product.status !== "approved") throw new HttpError(400, "Only approved products can be rated");

  const buyerRecord = buyer as { name?: string };
  const payload = {
    id: createReadableId("RAT"),
    productId: product.id,
    productName: product.name,
    supplierId: product.supplierId,
    supplierName: product.supplierName,
    buyerId,
    buyerName: buyerRecord.name || buyerId,
    rating: req.body.rating,
    review: req.body.review,
    submissionDate: dateOnly(),
    status: "pending",
    supplierReply: null,
    supplierReplyStatus: null,
    isEditable: true,
  };

  const created = await RatingModel.create(payload);
  await syncBuyerRatingCount(buyerId);

  res.status(201).json(created.toJSON());
});

export const updateBuyerRating = asyncHandler(async (req: Request, res: Response) => {
  const buyerId = String(req.params.buyerId);
  const existing = await RatingModel.findOne(
    { id: req.params.ratingId, buyerId },
    { _id: 0 },
  ).lean();

  const updated = await RatingModel.findOneAndUpdate(
    { id: req.params.ratingId, buyerId },
    {
      $set: {
        rating: req.body.rating,
        review: req.body.review,
        status: "pending",
      },
    },
    { new: true, projection: { _id: 0 } },
  ).lean();

  if (!updated) throw new HttpError(404, "Rating not found");
  await Promise.all([
    refreshRatingAggregates(existing || {}),
    refreshRatingAggregates(updated),
  ]);
  res.json(updated);
});
