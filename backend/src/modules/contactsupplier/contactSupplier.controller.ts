import crypto from "crypto";
import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { createReadableId } from "../../utils/id.js";
import { BuyerModel } from "../admin/buyers/buyer.model.js";
import { EnquiryModel } from "../admin/enquiries/enquiry.model.js";
import { AuthUserModel } from "../auth/auth.model.js";
import { hashPassword } from "../auth/auth.service.js";

const dateOnly = () => new Date().toISOString().split("T")[0];

type BuyerRecord = {
  id: string;
  company?: string;
};

type AuthUserRecord = {
  id: string;
  profileId?: string;
  role?: string;
  company?: string;
};

export const createContactSupplier = asyncHandler(async (req: Request, res: Response) => {
  const productName = req.body.productName || req.body.product;
  const email = String(req.body.email).toLowerCase().trim();
  const existingUser = await AuthUserModel.findOne(
    { email },
    { _id: 0, id: 1, profileId: 1, role: 1, company: 1 },
  ).lean() as AuthUserRecord | null;
  const existingBuyer = await BuyerModel.findOne(
    {
      $or: [
        ...(existingUser?.profileId ? [{ id: existingUser.profileId }] : []),
        { email },
      ],
    },
    { _id: 0 },
  ).lean() as BuyerRecord | null;
  let buyerId = existingBuyer?.id || (existingUser?.role === "buyer" ? existingUser.profileId || "" : "");
  let buyerCompany = existingBuyer?.company || existingUser?.company || "";

  if (!buyerId) buyerId = createReadableId("BUY");

  if (!existingBuyer) {
    buyerCompany = String(req.body.company || "").trim() || "Independent Buyer";

    await BuyerModel.create({
      id: buyerId,
      name: req.body.fullName,
      company: buyerCompany,
      country: req.body.country,
      email,
      phone: "",
      joinDate: dateOnly(),
      status: "pending",
      enquiriesSent: 0,
      ratingsSubmitted: 0,
    });
  }

  if (!existingUser) {
    await AuthUserModel.create({
      id: createReadableId("USR"),
      name: req.body.fullName,
      email,
      passwordHash: hashPassword(crypto.randomBytes(24).toString("hex")),
      role: "buyer",
      profileId: buyerId,
      company: buyerCompany,
      status: "pending",
    });
  } else if (existingUser.role === "buyer" && (!existingUser.profileId || existingUser.profileId !== buyerId)) {
    await AuthUserModel.updateOne(
      { id: existingUser.id },
      { $set: { profileId: buyerId, company: buyerCompany, status: "pending" } },
    );
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

    message: `Contact email: ${email}\nCompany: ${buyerCompany}\nCountry: ${req.body.country}`,

    date: dateOnly(),

    status: "pending",
    reply: null,
    replyDate: null,
  };

  const created = await EnquiryModel.create(payload);

  res.status(201).json({
    ...created.toJSON(),
    userAlreadyExisted: Boolean(existingUser && existingBuyer),
    userCreated: !existingUser,
    buyerProfileRecreated: Boolean(existingUser && !existingBuyer),
  });
});
