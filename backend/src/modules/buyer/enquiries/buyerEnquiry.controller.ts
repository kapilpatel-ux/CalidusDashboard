import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { HttpError } from "../../../utils/httpError.js";
import { createReadableId } from "../../../utils/id.js";
import { BuyerModel } from "../../admin/buyers/buyer.model.js";
import { EnquiryModel } from "../../admin/enquiries/enquiry.model.js";
import { ProductModel } from "../../admin/products/product.model.js";

const dateOnly = () => new Date().toISOString().split("T")[0];

async function syncBuyerEnquiryCount(buyerId: string) {
  const enquiriesSent = await EnquiryModel.countDocuments({ buyerId });
  await BuyerModel.updateOne({ id: buyerId }, { $set: { enquiriesSent } });
}

export const listBuyerEnquiries = asyncHandler(async (req: Request, res: Response) => {
  const buyerId = String(req.params.buyerId);
  const enquiries = await EnquiryModel.find({ buyerId }, { _id: 0 })
    .sort({ date: -1, createdAt: -1 })
    .lean();

  res.json(enquiries);
});

export const createBuyerEnquiry = asyncHandler(async (req: Request, res: Response) => {
  const buyerId = String(req.params.buyerId);
  const [buyer, product] = await Promise.all([
    BuyerModel.findOne(
      { id: buyerId },
      { _id: 0, id: 1, name: 1, company: 1, email: 1, country: 1 },
    ).lean(),
    ProductModel.findOne(
      { id: req.body.productId },
      { _id: 0, id: 1, name: 1, supplierId: 1, supplierName: 1, status: 1 },
    ).lean(),
  ]);

  if (!buyer) throw new HttpError(404, "Buyer not found");
  if (!product) throw new HttpError(404, "Product not found");
  if (product.status !== "approved") throw new HttpError(400, "Only approved products can be enquired about");

  const buyerRecord = buyer as { name?: string; company?: string };
  const buyerContact = buyer as { email?: string; country?: string };
  const created = await EnquiryModel.create({
    id: createReadableId("ENQ"),
    productId: product.id,
    productName: product.name,
    supplierId: product.supplierId,
    supplierName: product.supplierName,
    buyerId,
    buyerName: buyerRecord.name || buyerId,
    buyerCompany: buyerRecord.company || "",
    buyerEmail: buyerContact.email || "",
    buyerCountry: buyerContact.country || "",
    message: req.body.message,
    date: dateOnly(),
    status: "pending",
    reply: null,
    replyDate: null,
  });

  await syncBuyerEnquiryCount(buyerId);
  res.status(201).json(created.toJSON());
});
