import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { BuyerModel } from "../buyers/buyer.model.js";
import { ProductModel } from "../products/product.model.js";
import { RatingModel } from "../ratings/rating.model.js";
import { SupplierModel } from "../suppliers/supplier.model.js";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

export const getAnalytics = asyncHandler(async (_req: Request, res: Response) => {
  const [supplierCount, buyerCount, productCount, ratingCount, topSuppliers] = await Promise.all([
    SupplierModel.countDocuments(),
    BuyerModel.countDocuments(),
    ProductModel.countDocuments(),
    RatingModel.countDocuments(),
    SupplierModel.find({}, { _id: 0, name: 1, rating: 1 }).sort({ rating: -1 }).limit(5).lean(),
  ]);

  res.json({
    supplierGrowth: months.map((month, index) => ({ month, suppliers: Math.round((supplierCount / months.length) * (index + 1)) })),
    buyerGrowth: months.map((month, index) => ({ month, buyers: Math.round((buyerCount / months.length) * (index + 1)) })),
    productGrowth: months.map((month, index) => ({ month, products: Math.round((productCount / months.length) * (index + 1)) })),
    categoryDemandTrends: months.map((month, index) => ({
      month,
      uav: productCount + index * 4,
      electronics: Math.max(0, productCount - index * 2),
    })),
    topRatedSuppliers: topSuppliers.map((supplier) => ({
      name: supplier.name,
      rating: supplier.rating || 0,
    })),
    totals: {
      suppliers: supplierCount,
      buyers: buyerCount,
      products: productCount,
      ratings: ratingCount,
    },
  });
});
