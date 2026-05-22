import type { Request, Response } from "express";
import crypto from "crypto";
import { env } from "../../../config/env.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { HttpError } from "../../../utils/httpError.js";
import { createReadableId } from "../../../utils/id.js";
import { sendSmtpEmail } from "../../../utils/smtpEmail.js";
import { AuthUserModel } from "../../auth/auth.model.js";
import { hashPassword } from "../../auth/auth.service.js";
import { BuyerModel } from "./buyer.model.js";

type BuyerRecord = {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
};

export const listBuyers = asyncHandler(async (_req: Request, res: Response) => {
  const buyers = await BuyerModel.find({}, { _id: 0 }).lean();
  res.json(buyers);
});

export const updateBuyerStatus = asyncHandler(async (req: Request, res: Response) => {
  const status = String(req.body.status || "").toLowerCase();
  const updated = await BuyerModel.findOneAndUpdate(
    { id: req.params.buyerId },
    { $set: { status: req.body.status } },
    { new: true, projection: { _id: 0 } },
  ).lean();
  if (!updated) throw new HttpError(404, "Buyer not found");
  const buyer = updated as BuyerRecord;
  const buyerEmail = String(buyer.email || "").toLowerCase().trim();

  await AuthUserModel.updateMany(
    {
      role: "buyer",
      $or: [{ profileId: buyer.id }, ...(buyerEmail ? [{ email: buyerEmail }] : [])],
    },
    { $set: { status } },
  );

  if (status === "active" && buyerEmail) {
    const tempPassword = crypto.randomBytes(10).toString("base64url");
    const existingBuyerUser = await AuthUserModel.findOne(
      { role: "buyer", $or: [{ profileId: buyer.id }, { email: buyerEmail }] },
      { _id: 0, id: 1 },
    ).lean();

    if (existingBuyerUser) {
      await AuthUserModel.updateOne(
        { id: existingBuyerUser.id },
        {
          $set: {
            name: buyer.name || "Buyer",
            email: buyerEmail,
            phone: buyer.phone || "",
            passwordHash: hashPassword(tempPassword),
            profileId: buyer.id,
            company: buyer.company || "",
            status: "active",
          },
        },
      );
    } else {
      await AuthUserModel.create({
        id: createReadableId("USR"),
        name: buyer.name || "Buyer",
        email: buyerEmail,
        phone: buyer.phone || "",
        passwordHash: hashPassword(tempPassword),
        role: "buyer",
        profileId: buyer.id,
        company: buyer.company || "",
        status: "active",
      });
    }

    const appUrl = env.appUrl || env.corsOrigins[0] || "http://localhost:3000";
    const buyerName = buyer.name || "Buyer";
    const subject = "Welcome to Calidus Dashboard";
    const text = [
      `Hello ${buyerName},`,
      "",
      "Welcome to Calidus Dashboard. Your buyer account has been approved.",
      "",
      `Login URL: ${appUrl}`,
      `Email: ${buyerEmail}`,
      `Password: ${tempPassword}`,
      "",
      "For security, please change your password after logging in.",
    ].join("\n");

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <p>Hello ${buyerName},</p>
        <p>Welcome to Calidus Dashboard. Your buyer account has been approved.</p>
        <p><strong>Login URL:</strong> <a href="${appUrl}">${appUrl}</a><br/>
        <strong>Email:</strong> ${buyerEmail}<br/>
        <strong>Password:</strong> ${tempPassword}</p>
        <p>For security, please change your password after logging in.</p>
      </div>
    `;

    try {
      await sendSmtpEmail(buyerEmail, { subject, text, html });
    } catch (err) {
      console.error("Failed to send buyer approval credentials email", err);
    }
  }

  res.json(updated);
});

export const deleteBuyer = asyncHandler(async (req: Request, res: Response) => {
  const buyer = await BuyerModel.findOne({ id: req.params.buyerId }, { _id: 0 }).lean() as BuyerRecord | null;
  if (!buyer) throw new HttpError(404, "Buyer not found");

  await Promise.all([
    BuyerModel.deleteOne({ id: req.params.buyerId }),
    AuthUserModel.deleteMany({
      role: "buyer",
      $or: [{ profileId: buyer.id }, ...(buyer.email ? [{ email: buyer.email }] : [])],
    }),
  ]);

  res.json({ success: true, message: "Buyer deleted" });
});
