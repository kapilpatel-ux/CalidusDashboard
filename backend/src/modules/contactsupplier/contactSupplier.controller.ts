import crypto from "crypto";
import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { createReadableId } from "../../utils/id.js";
import { BuyerModel } from "../admin/buyers/buyer.model.js";
import { EnquiryModel } from "../admin/enquiries/enquiry.model.js";
import { AuthUserModel } from "../auth/auth.model.js";
import { hashPassword } from "../auth/auth.service.js";

const dateOnly = () => new Date().toISOString().split("T")[0];

export const createContactSupplier = asyncHandler(async (req: Request, res: Response) => {
  const productName = req.body.productName || req.body.product;
  const email = String(req.body.email).toLowerCase().trim();
  const existingUser = await AuthUserModel.findOne(
    { email },
    { _id: 0, id: 1, profileId: 1, role: 1, company: 1 },
  ).lean();
  let buyerId = existingUser?.role === "buyer" ? existingUser.profileId || "" : "";
  let buyerCompany = existingUser?.company || "";

  if (!existingUser) {
    buyerId = createReadableId("BUY");
    buyerCompany = "Independent Buyer";

    await BuyerModel.create({
      id: buyerId,
      name: req.body.fullName,
      company: buyerCompany,
      country: req.body.country,
      email,
      phone: "",
      joinDate: dateOnly(),
      status: "active",
      enquiriesSent: 0,
      ratingsSubmitted: 0,
    });

    await AuthUserModel.create({
      id: createReadableId("USR"),
      name: req.body.fullName,
      email,
      passwordHash: hashPassword(crypto.randomBytes(24).toString("hex")),
      role: "buyer",
      profileId: buyerId,
      company: buyerCompany,
      status: "active",
    });
  }

  const payload = {
    id: createReadableId("ENQ"),

    productId: req.body.productId || "",
    productName,

    supplierId: req.body.supplierId || "",
    supplierName: req.body.supplierCompany,

    buyerId,
    buyerName: req.body.fullName,
    buyerCompany,

    message: `Contact email: ${email}\nCountry: ${req.body.country}`,

    date: dateOnly(),

    status: "pending",
    reply: null,
    replyDate: null,
  };

  const created = await EnquiryModel.create(payload);

  res.status(201).json({
    ...created.toJSON(),
    userAlreadyExisted: Boolean(existingUser),
    userCreated: !existingUser,
  });
});
