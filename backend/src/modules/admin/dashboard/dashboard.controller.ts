import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { getDocumentExpiryStats } from "../../../utils/documentStats.js";
import { BuyerModel } from "../buyers/buyer.model.js";
import { CategoryModel } from "../categories/category.model.js";
import { ProductModel } from "../products/product.model.js";
import { RatingModel } from "../ratings/rating.model.js";
import { SupplierModel } from "../suppliers/supplier.model.js";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

export const getDashboardOverview = asyncHandler(async (_req: Request, res: Response) => {
  const [suppliers, totalBuyers, totalProducts, totalCategories, pendingProducts, pendingRatings] = await Promise.all([
    SupplierModel.find({}, { _id: 0 }).lean(),
    BuyerModel.countDocuments(),
    ProductModel.countDocuments(),
    CategoryModel.countDocuments(),
    ProductModel.countDocuments({ status: "pending" }),
    RatingModel.countDocuments({ status: "pending" }),
  ]);

  const totalSuppliers = suppliers.length;

  res.json({
    stats: {
      totalSuppliers,
      totalBuyers,
      totalProducts,
      totalCategories,
      pendingSupplierApprovals: suppliers.filter((supplier) => supplier.status === "pending").length,
      pendingProductApprovals: pendingProducts,
      pendingRatings,
    },
    documentStats: getDocumentExpiryStats(suppliers),
    analyticsData: {
      categoryDemandTrends: months.map((month, index) => ({
        month,
        uav: totalProducts + index * 3,
        electronics: Math.max(0, totalProducts - index),
      })),
      topRatedSuppliers: suppliers
        .slice()
        .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
        .slice(0, 5)
        .map((supplier) => ({ name: supplier.name, rating: supplier.rating || 0 })),
    },
  });
});
