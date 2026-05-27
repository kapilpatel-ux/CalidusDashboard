import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { HttpError } from "../../../utils/httpError.js";
import { EnquiryModel } from "../../admin/enquiries/enquiry.model.js";
import { SupplierModel } from "../../admin/suppliers/supplier.model.js";
import { createAdminNotification } from "../../admin/notifications/notification.service.js";

const dateOnly = () => new Date().toISOString().split("T")[0];

async function getSupplierQuery(supplierId: string) {
  const supplier = await SupplierModel.findOne({ id: supplierId }, { _id: 0, id: 1, name: 1 }).lean();
  if (!supplier) throw new HttpError(404, "Supplier not found");

  return {
    $or: [
      { supplierId },
      { supplierId: "", supplierName: supplier.name },
      { supplierId: { $exists: false }, supplierName: supplier.name },
    ],
  };
}

export const listSupplierEnquiries = asyncHandler(async (req: Request, res: Response) => {
  const supplierId = String(req.params.supplierId);
  const supplierQuery = await getSupplierQuery(supplierId);

  const enquiries = await EnquiryModel.find(supplierQuery, { _id: 0 })
    .sort({ date: -1, createdAt: -1 })
    .lean();

  res.json(enquiries);
});

export const replyToSupplierEnquiry = asyncHandler(async (req: Request, res: Response) => {
  const supplierId = String(req.params.supplierId);
  const enquiryId = String(req.params.enquiryId);
  const supplierQuery = await getSupplierQuery(supplierId);

  const updated = await EnquiryModel.findOneAndUpdate(
    { id: enquiryId, ...supplierQuery },
    {
      $set: {
        reply: req.body.reply,
        replyDate: dateOnly(),
        status: "replied",
      },
    },
    { new: true, projection: { _id: 0 } },
  ).lean();

  if (!updated) throw new HttpError(404, "Enquiry not found");
  try {
    await createAdminNotification({
      type: "enquiry",
      title: "Supplier Replied To Enquiry",
      message: `${updated.supplierName || "Supplier"} replied to enquiry for ${updated.productName || "a product"}.`,
      link: "enquirymanagement",
    });
  } catch (err) {
    console.error("Failed to create admin notification for supplier enquiry reply", err);
  }
  res.json(updated);
});

export const updateSupplierEnquiryStatus = asyncHandler(async (req: Request, res: Response) => {
  const supplierId = String(req.params.supplierId);
  const enquiryId = String(req.params.enquiryId);
  const supplierQuery = await getSupplierQuery(supplierId);

  const updated = await EnquiryModel.findOneAndUpdate(
    { id: enquiryId, ...supplierQuery },
    { $set: { status: req.body.status } },
    { new: true, projection: { _id: 0 } },
  ).lean();

  if (!updated) throw new HttpError(404, "Enquiry not found");
  try {
    await createAdminNotification({
      type: "enquiry",
      title: "Supplier Updated Enquiry",
      message: `${updated.supplierName || "Supplier"} marked enquiry for ${updated.productName || "a product"} as ${req.body.status}.`,
      link: "enquirymanagement",
    });
  } catch (err) {
    console.error("Failed to create admin notification for supplier enquiry status", err);
  }
  res.json(updated);
});
