import crypto from "crypto";
import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { createReadableId } from "../../utils/id.js";
import { BuyerModel } from "../admin/buyers/buyer.model.js";
import { EnquiryModel } from "../admin/enquiries/enquiry.model.js";
import { env } from "../../config/env.js";
import { AuthUserModel } from "../auth/auth.model.js";
import { hashPassword } from "../auth/auth.service.js";
import { sendSmtpEmail } from "../../utils/smtpEmail.js";
import { createAdminNotification } from "../admin/notifications/notification.service.js";

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
  const phone = String(req.body.phone || "").trim();
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
      phone,
      joinDate: dateOnly(),
      status: "pending",
      enquiriesSent: 0,
      ratingsSubmitted: 0,
    });
    try {
      await createAdminNotification({
        type: "buyer",
        title: "New Buyer Created",
        message: `${req.body.fullName} (${email}) was created from a supplier enquiry.`,
        link: "buyermanagement",
      });
    } catch (err) {
      console.error("Failed to create admin notification for contact-supplier buyer creation", err);
    }
  }

  if (!existingUser) {
    const tempPassword = crypto.randomBytes(10).toString("base64url");
    await AuthUserModel.create({
      id: createReadableId("USR"),
      name: req.body.fullName,
      email,
      phone,
      passwordHash: hashPassword(tempPassword),
      role: "buyer",
      profileId: buyerId,
      company: buyerCompany,
      status: "pending",
    });

    const appUrl = env.appUrl || env.corsOrigins[0] || "http://localhost:3000";
    const buyerName = req.body.fullName || "Buyer";
    const subject = "Welcome to Calidus Dashboard";
    const text = [
      `Hello ${buyerName},`,
      "",
      "Your account has been created from a supplier enquiry.",
      "",
      `Login URL: ${appUrl}`,
      `Email: ${email}`,
      `Password: ${tempPassword}`,
      "",
      "For security, please change your password after logging in.",
    ].join("\n");
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <p>Hello ${buyerName},</p>
        <p>Your account has been created from a supplier enquiry.</p>
        <p><strong>Login URL:</strong> <a href="${appUrl}">${appUrl}</a><br/>
        <strong>Email:</strong> ${email}<br/>
        <strong>Password:</strong> ${tempPassword}</p>
        <p>For security, please change your password after logging in.</p>
      </div>
    `;

    try {
      await sendSmtpEmail(email, { subject, text, html });
    } catch (err) {
      console.error("Failed to send contact-supplier credentials email", err);
    }
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
    buyerEmail: email,
    buyerCountry: req.body.country,
    buyerPhone: phone,

    message: `Contact email: ${email}\nPhone: ${phone}\nCompany: ${buyerCompany}\nCountry: ${req.body.country}`,

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
