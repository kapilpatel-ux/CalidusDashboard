import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { HttpError } from "../../../utils/httpError.js";
import { EnquiryModel } from "./enquiry.model.js";

export const listEnquiries = asyncHandler(async (_req: Request, res: Response) => {
  const enquiries = await EnquiryModel.find({}, { _id: 0 }).sort({ date: -1 }).lean();
  res.json(enquiries);
});

export const updateEnquiryStatus = asyncHandler(async (req: Request, res: Response) => {
  const updated = await EnquiryModel.findOneAndUpdate(
    { id: req.params.enquiryId },
    { $set: { status: req.body.status } },
    { new: true, projection: { _id: 0 } },
  ).lean();

  if (!updated) throw new HttpError(404, "Enquiry not found");
  res.json(updated);
});
