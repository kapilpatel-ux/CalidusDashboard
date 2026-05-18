import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { getDocumentExpiryStats } from "../../../utils/documentStats.js";
import { HttpError } from "../../../utils/httpError.js";
import { EnquiryModel } from "../../admin/enquiries/enquiry.model.js";
import { ProductModel } from "../../admin/products/product.model.js";
import { RatingModel } from "../../admin/ratings/rating.model.js";
import { SupplierModel } from "../../admin/suppliers/supplier.model.js";

export const getSupplierOverview = asyncHandler(async (req: Request, res: Response) => {
  const { supplierId } = req.params;

  const [supplier, products, enquiries] = await Promise.all([
    SupplierModel.findOne({ id: supplierId }, { _id: 0 }).lean(),
    ProductModel.find({ supplierId }, { _id: 0 }).lean(),
    EnquiryModel.find({ supplierId }, { _id: 0 }).sort({ date: -1 }).lean(),
  ]);

  if (!supplier) throw new HttpError(404, "Supplier not found");

  const productIds = products.map((product) => product.id);
  const ratings = await RatingModel.find({ productId: { $in: productIds } }, { _id: 0 }).sort({ submissionDate: -1 }).lean();

  const approvedProducts = products.filter((product) => product.status === "approved");
  const pendingProducts = products.filter((product) => product.status === "pending");
  const pendingEnquiries = enquiries.filter((enquiry) => enquiry.status === "pending");
  const repliedEnquiries = enquiries.filter((enquiry) => enquiry.status === "replied");
  const approvedRatings = ratings.filter((rating) => rating.status === "approved");
  const averageRating =
    approvedRatings.length > 0
      ? Number((approvedRatings.reduce((sum, rating) => sum + Number((rating as { rating?: number }).rating || 0), 0) / approvedRatings.length).toFixed(1))
      : Number(supplier.rating || 0);

  res.json({
    supplier,
    stats: {
      totalProducts: products.length,
      approvedProducts: approvedProducts.length,
      activeProducts: approvedProducts.length,
      pendingProducts: pendingProducts.length,
      pendingProductApprovals: pendingProducts.length,
      totalEnquiries: enquiries.length,
      pendingEnquiries: pendingEnquiries.length,
      repliedEnquiries: repliedEnquiries.length,
      totalRatings: ratings.length,
      averageRating,
      profileViews: supplier.profileViews || 0,
      responseRate: enquiries.length > 0 ? Math.round((repliedEnquiries.length / enquiries.length) * 100) : 0,
      profileCompletion: Math.round(
        ([
          supplier.name,
          supplier.type,
          supplier.country,
          supplier.email,
          supplier.phone,
          (supplier.certifications || []).length > 0,
          (supplier.documents || []).length > 0,
        ].filter(Boolean).length /
          7) *
          100,
      ),
      productQualityScore: products.length > 0 ? Math.round((approvedProducts.length / products.length) * 100) : 0,
    },
    documentStats: getDocumentExpiryStats([supplier]),
    expiringDocs: (supplier.documents || []).filter((document) => document.status === "expiring" || document.status === "expired"),
    recentProducts: products.slice(0, 5),
    recentEnquiries: enquiries.slice(0, 5),
    recentRatings: ratings.slice(0, 5),
  });
});
