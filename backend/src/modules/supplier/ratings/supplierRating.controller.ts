import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { HttpError } from "../../../utils/httpError.js";
import { ProductModel } from "../../admin/products/product.model.js";
import { RatingModel } from "../../admin/ratings/rating.model.js";
import { SupplierModel } from "../../admin/suppliers/supplier.model.js";

type SupplierRatingRecord = {
  id: string;
  name: string;
};

const supplierOwnedQuery = (supplier: SupplierRatingRecord) => ({
  $or: [
    { supplierId: supplier.id },
    { supplierId: "", supplierName: supplier.name },
    { supplierId: { $exists: false }, supplierName: supplier.name },
  ],
});

async function getSupplierRatingQuery(supplierId: string) {
  const supplier = await SupplierModel.findOne(
    { id: supplierId },
    { _id: 0, id: 1, name: 1 },
  ).lean<SupplierRatingRecord>();

  if (!supplier) throw new HttpError(404, "Supplier not found");

  const products = await ProductModel.find(supplierOwnedQuery(supplier), { _id: 0, id: 1 }).lean();
  const productIds = products.map((product) => product.id).filter(Boolean);

  return {
    $or: [
      ...(productIds.length > 0 ? [{ productId: { $in: productIds } }] : []),
      { supplierId },
      { supplierId: "", supplierName: supplier.name },
      { supplierId: { $exists: false }, supplierName: supplier.name },
    ],
  };
}

export const listSupplierRatings = asyncHandler(async (req: Request, res: Response) => {
  const supplierId = String(req.params.supplierId);
  const ratingQuery = await getSupplierRatingQuery(supplierId);

  const ratings = await RatingModel.find(ratingQuery, { _id: 0 })
    .sort({ submissionDate: -1, createdAt: -1 })
    .lean();

  res.json(ratings);
});

export const replyToSupplierRating = asyncHandler(async (req: Request, res: Response) => {
  const supplierId = String(req.params.supplierId);
  const ratingId = String(req.params.ratingId);
  const ratingQuery = await getSupplierRatingQuery(supplierId);

  const updated = await RatingModel.findOneAndUpdate(
    { id: ratingId, ...ratingQuery },
    {
      $set: {
        supplierReply: req.body.reply,
        supplierReplyStatus: "pending",
        replyStatus: "pending",
      },
    },
    { new: true, projection: { _id: 0 } },
  ).lean();

  if (!updated) throw new HttpError(404, "Rating not found");
  res.json(updated);
});
