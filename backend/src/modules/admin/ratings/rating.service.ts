import { ProductModel } from "../products/product.model.js";
import { SupplierModel } from "../suppliers/supplier.model.js";
import { BuyerModel } from "../buyers/buyer.model.js";
import { RatingModel } from "./rating.model.js";

type RatingAggregateTarget = {
  productId?: string;
  supplierId?: string;
  supplierName?: string;
  buyerId?: string;
};

const approvedRatingAverage = (ratings: Array<{ rating?: number }>) =>
  ratings.length
    ? Number(
        (
          ratings.reduce((sum, item) => sum + Number(item.rating || 0), 0) /
          ratings.length
        ).toFixed(1),
      )
    : 0;

export const refreshProductRating = async (productId?: string) => {
  if (!productId) return;

  const approvedRatings = await RatingModel.find(
    { productId, status: "approved" },
    { rating: 1, _id: 0 },
  ).lean();

  await ProductModel.updateOne(
    { id: productId },
    { $set: { rating: approvedRatingAverage(approvedRatings) } },
  );
};

export const refreshSupplierRating = async (target: RatingAggregateTarget = {}) => {
  const supplierQuery = target.supplierId
    ? { id: target.supplierId }
    : target.supplierName
      ? { name: target.supplierName }
      : null;

  if (!supplierQuery) return;

  const supplier = await SupplierModel.findOne(
    supplierQuery,
    { _id: 0, id: 1, name: 1 },
  ).lean<{ id: string; name: string }>();

  if (!supplier) return;

  const products = await ProductModel.find(
    {
      $or: [
        { supplierId: supplier.id },
        { supplierId: "", supplierName: supplier.name },
        { supplierId: { $exists: false }, supplierName: supplier.name },
      ],
    },
    { _id: 0, id: 1 },
  ).lean();

  const productIds = products.map((product) => product.id).filter(Boolean);
  const approvedRatings = await RatingModel.find(
    {
      status: "approved",
      $or: [
        ...(productIds.length > 0 ? [{ productId: { $in: productIds } }] : []),
        { supplierId: supplier.id },
        { supplierId: "", supplierName: supplier.name },
        { supplierId: { $exists: false }, supplierName: supplier.name },
      ],
    },
    { rating: 1, _id: 0 },
  ).lean();

  await SupplierModel.updateOne(
    { id: supplier.id },
    { $set: { rating: approvedRatingAverage(approvedRatings) } },
  );
};

export const refreshBuyerRatingCount = async (buyerId?: string) => {
  if (!buyerId) return;

  const ratingsSubmitted = await RatingModel.countDocuments({ buyerId });
  await BuyerModel.updateOne({ id: buyerId }, { $set: { ratingsSubmitted } });
};

export const refreshRatingAggregates = async (target: RatingAggregateTarget = {}) => {
  await Promise.all([
    refreshProductRating(target.productId),
    refreshSupplierRating(target),
    refreshBuyerRatingCount(target.buyerId),
  ]);
};
