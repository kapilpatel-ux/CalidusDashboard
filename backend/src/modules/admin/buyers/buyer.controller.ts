import type { Request, Response } from "express";
import crypto from "crypto";
import { env } from "../../../config/env.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { HttpError } from "../../../utils/httpError.js";
import { createReadableId } from "../../../utils/id.js";
import { sendSmtpEmail } from "../../../utils/smtpEmail.js";
import { AuthUserModel } from "../../auth/auth.model.js";
import { hashPassword } from "../../auth/auth.service.js";
import { objectsToCsv } from "../../../utils/csv.js";
import { parseCsv } from "../../../utils/csvParse.js";
import { createAdminNotification } from "../notifications/notification.service.js";
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

export const exportBuyersCsv = asyncHandler(async (req: Request, res: Response) => {
  const status = String(req.query.status ?? "").trim().toLowerCase();
  const q = String(req.query.q ?? "").trim();

  const query: Record<string, unknown> = {};
  if (status && status !== "all") query.status = { $regex: new RegExp(`^${status.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") };
  if (q) {
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i");
    query.$or = [{ name: regex }, { email: regex }, { company: regex }, { country: regex }];
  }

  const buyers = await BuyerModel.find(query, { _id: 0 }).sort({ joinDate: -1, id: 1 }).lean();

  const csv = objectsToCsv(buyers as Record<string, unknown>[], [
    { key: "id", label: "id" },
    { key: "name", label: "name" },
    { key: "email", label: "email" },
    { key: "phone", label: "phone" },
    { key: "company", label: "company" },
    { key: "country", label: "country" },
    { key: "status", label: "status" },
    { key: "joinDate", label: "joinDate" },
    { key: "enquiriesSent", label: "enquiriesSent" },
    { key: "ratingsSubmitted", label: "ratingsSubmitted" },
  ]);

  const date = new Date().toISOString().slice(0, 10);
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename=\"buyers_${date}.csv\"`);
  res.setHeader("Cache-Control", "no-store");
  res.send(csv);
});

const BUYER_COLUMNS = [
  "id",
  "name",
  "email",
  "phone",
  "company",
  "country",
  "status",
  "joinDate",
  "enquiriesSent",
  "ratingsSubmitted",
] as const;

const toNumberOrUndefined = (value: string) => {
  if (!value) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
};

export const importBuyersCsv = asyncHandler(async (req: Request, res: Response) => {
  const csvText = String(req.body?.csv ?? "");
  if (!csvText.trim()) throw new HttpError(400, "CSV content is required");

  const parsed = parseCsv(csvText);
  if (!parsed.headers.length) throw new HttpError(400, "CSV file is empty or missing headers");

  const expected = new Set<string>(BUYER_COLUMNS);
  const provided = new Set<string>(parsed.headers.filter(Boolean));
  const missingFields = BUYER_COLUMNS.filter((h) => !provided.has(h));
  const unknownFields = parsed.headers.filter((h) => h && !expected.has(h));

  if (missingFields.length || unknownFields.length) {
    res.status(400).json({
      message: "CSV headers do not match the expected format",
      expectedFields: BUYER_COLUMNS,
      missingFields,
      unknownFields,
    });
    return;
  }

  const errors: Array<{ line: number; message: string }> = [];
  let created = 0;
  let updated = 0;

  for (let index = 0; index < parsed.rows.length; index++) {
    const line = index + 2; // 1 header line
    const row = parsed.rows[index];
    const email = String(row.email || "").toLowerCase().trim();
    const name = String(row.name || "").trim();
    if (!email) {
      errors.push({ line, message: "Missing required field: email" });
      continue;
    }
    if (!name) {
      errors.push({ line, message: "Missing required field: name" });
      continue;
    }

    const payload: Record<string, unknown> = {
      name,
      email,
      phone: String(row.phone || "").trim(),
      company: String(row.company || "").trim(),
      country: String(row.country || "").trim(),
      status: String(row.status || "").trim() || "active",
      joinDate: String(row.joinDate || "").trim(),
    };

    const enquiriesSent = toNumberOrUndefined(String(row.enquiriesSent || ""));
    if (row.enquiriesSent && enquiriesSent === undefined) {
      errors.push({ line, message: `Invalid number in enquiriesSent: "${row.enquiriesSent}"` });
      continue;
    }
    const ratingsSubmitted = toNumberOrUndefined(String(row.ratingsSubmitted || ""));
    if (row.ratingsSubmitted && ratingsSubmitted === undefined) {
      errors.push({ line, message: `Invalid number in ratingsSubmitted: "${row.ratingsSubmitted}"` });
      continue;
    }
    if (enquiriesSent !== undefined) payload.enquiriesSent = enquiriesSent;
    if (ratingsSubmitted !== undefined) payload.ratingsSubmitted = ratingsSubmitted;

    const id = String(row.id || "").trim();

    if (id) {
      const result = await BuyerModel.updateOne({ id }, { $set: payload }, { upsert: true });
      if (result.upsertedCount) created += 1;
      else updated += 1;
      continue;
    }

    const existingByEmail = await BuyerModel.findOne({ email }, { _id: 0, id: 1 }).lean() as { id?: string } | null;
    if (existingByEmail?.id) {
      await BuyerModel.updateOne({ id: existingByEmail.id }, { $set: payload });
      updated += 1;
    } else {
      const newId = createReadableId("BUY");
      await BuyerModel.create({ id: newId, ...payload });
      created += 1;
    }
  }

  if (errors.length) {
    res.status(422).json({
      message: "Some rows failed validation",
      created,
      updated,
      failed: errors.length,
      errors,
    });
    return;
  }

  if (created > 0) {
    try {
      await createAdminNotification({
        type: "buyer",
        title: "Buyers Imported",
        message: `${created} buyer${created === 1 ? "" : "s"} created from CSV import.`,
        link: "buyermanagement",
      });
    } catch (err) {
      console.error("Failed to create admin notification for buyer import", err);
    }
  }

  res.json({ created, updated, failed: 0 });
});
