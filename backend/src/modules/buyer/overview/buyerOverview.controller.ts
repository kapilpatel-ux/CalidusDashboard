import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { HttpError } from "../../../utils/httpError.js";
import { BuyerModel } from "../../admin/buyers/buyer.model.js";
import { EnquiryModel } from "../../admin/enquiries/enquiry.model.js";
import { RatingModel } from "../../admin/ratings/rating.model.js";

const getRecordTime = (record: { date?: string; createdAt?: string; submissionDate?: string }) => {
  const value = record.date || record.submissionDate || record.createdAt || "";
  const time = value ? new Date(value).getTime() : 0;
  return Number.isNaN(time) ? 0 : time;
};

export const getBuyerOverview = asyncHandler(async (req: Request, res: Response) => {
  const buyerId = String(req.params.buyerId);

  const buyer = await BuyerModel.findOne({ id: buyerId }, { _id: 0 }).lean();
  if (!buyer) throw new HttpError(404, "Buyer not found");

  const [enquiries, ratings] = await Promise.all([
    EnquiryModel.find({ buyerId }, { _id: 0 })
      .sort({ date: -1, createdAt: -1 })
      .lean(),
    RatingModel.find({ buyerId }, { _id: 0 })
      .sort({ submissionDate: -1, createdAt: -1 })
      .lean(),
  ]);

  const suppliersContacted = new Set(
    enquiries
      .map((enquiry) => String(enquiry.supplierId || enquiry.supplierName || "").trim())
      .filter(Boolean),
  ).size;

  const pendingResponses = enquiries.filter((enquiry) => enquiry.status === "pending").length;
  const sortedRecentEnquiries = enquiries
    .slice()
    .sort((a, b) => getRecordTime(b) - getRecordTime(a))
    .slice(0, 5);

  const ratingsSubmitted = ratings.length;

  if (
    Number((buyer as { enquiriesSent?: number }).enquiriesSent || 0) !== enquiries.length ||
    Number((buyer as { ratingsSubmitted?: number }).ratingsSubmitted || 0) !== ratingsSubmitted
  ) {
    await BuyerModel.updateOne(
      { id: buyerId },
      {
        $set: {
          enquiriesSent: enquiries.length,
          ratingsSubmitted,
        },
      },
    );
  }

  res.json({
    buyer: {
      ...buyer,
      enquiriesSent: enquiries.length,
      ratingsSubmitted,
    },
    stats: {
      totalEnquiries: enquiries.length,
      suppliersContacted,
      pendingResponses,
      submittedRatings: ratingsSubmitted,
      ratingsSubmitted,
    },
    recentEnquiries: sortedRecentEnquiries,
    recentRatings: ratings.slice(0, 5),
  });
});
