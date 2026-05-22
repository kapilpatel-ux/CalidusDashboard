import type { Request, Response } from "express";
import crypto from "crypto";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { HttpError } from "../../../utils/httpError.js";
import { createReadableId } from "../../../utils/id.js";
import { env } from "../../../config/env.js";
import { sendSmtpEmail } from "../../../utils/smtpEmail.js";
import { AuthUserModel } from "../../auth/auth.model.js";
import { hashPassword } from "../../auth/auth.service.js";
import { SupplierModel } from "./supplier.model.js";

const WORDPRESS_DEFAULT_LIMIT = 20;
const WORDPRESS_MAX_LIMIT = 100;

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parsePositiveInt = (value: unknown, fallback: number) => {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const listSuppliers = asyncHandler(async (_req: Request, res: Response) => {
  const suppliers = await SupplierModel.find({}, { _id: 0 }).lean();
  res.json(suppliers);
});

// WordPress / public listing: active-only + search + pagination
export const listApprovedSuppliers = asyncHandler(async (req: Request, res: Response) => {
  const q = String(req.query.q ?? "").trim();
  const page = parsePositiveInt(req.query.page, 1);
  const limit = Math.min(parsePositiveInt(req.query.limit, WORDPRESS_DEFAULT_LIMIT), WORDPRESS_MAX_LIMIT);
  const skip = (page - 1) * limit;

  const query: Record<string, unknown> = { status: { $regex: /^active$/i } };

  if (q) {
    const regex = new RegExp(escapeRegex(q), "i");
    query.$or = [
      { name: regex },
      { type: regex },
      { businessType: regex },
      { calidusCluster: regex },
      { productAndServices: regex },
      { country: regex },
    ];
  }

  const [items, total] = await Promise.all([
    SupplierModel.find(query, { _id: 0 }).skip(skip).limit(limit).lean(),
    SupplierModel.countDocuments(query),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  res.json({
    items,
    page,
    limit,
    total,
    totalPages,
  });
});

export const getApprovedSupplier = asyncHandler(async (req: Request, res: Response) => {
  const supplier = await SupplierModel.findOne({ id: req.params.supplierId, status: { $regex: /^active$/i } }, { _id: 0 }).lean();
  if (!supplier) throw new HttpError(404, "Supplier not found");
  res.json(supplier);
});

export const getSupplier = asyncHandler(async (req: Request, res: Response) => {
  const supplier = await SupplierModel.findOne({ id: req.params.supplierId }, { _id: 0 }).lean();
  if (!supplier) throw new HttpError(404, "Supplier not found");
  res.json(supplier);
});

export const createSupplier = asyncHandler(async (req: Request, res: Response) => {
  const payload = { ...req.body, id: req.body.id || createReadableId("SUP") };
  const created = await SupplierModel.create(payload);
  res.status(201).json(created.toJSON());
});

export const updateSupplier = asyncHandler(async (req: Request, res: Response) => {
  const updated = await SupplierModel.findOneAndUpdate(
    { id: req.params.supplierId },
    { $set: req.body },
    { new: true, projection: { _id: 0 } },
  ).lean();

  if (!updated) throw new HttpError(404, "Supplier not found");
  res.json(updated);
});

export const updateSupplierStatus = asyncHandler(async (req: Request, res: Response) => {
  const supplierStatus = String(req.body.status || "").toLowerCase();
  const authStatus = supplierStatus === "approved" ? "active" : supplierStatus;
  const updated = await SupplierModel.findOneAndUpdate(
    { id: req.params.supplierId },
    { $set: { status: req.body.status } },
    { new: true, projection: { _id: 0 } },
  ).lean();

  if (!updated) throw new HttpError(404, "Supplier not found");

  await AuthUserModel.updateMany(
    {
      role: "supplier",
      $or: [{ profileId: updated.id }, { email: updated.email }],
    },
    { $set: { status: authStatus } },
  );

  const shouldProvisionLogin = authStatus === "active";
  if (shouldProvisionLogin) {
    const supplierEmail = String((updated as { email?: string }).email || "").toLowerCase().trim();
    if (supplierEmail) {
      const existingSupplierUser = await AuthUserModel.findOne(
        { role: "supplier", $or: [{ profileId: updated.id }, { email: supplierEmail }] },
        { _id: 0, id: 1 },
      ).lean();

      const tempPassword = crypto.randomBytes(10).toString("base64url");
      if (existingSupplierUser) {
        await AuthUserModel.updateOne(
          { id: existingSupplierUser.id },
          {
            $set: {
              name: (updated as { name?: string }).name || "Supplier",
              email: supplierEmail,
              phone: (updated as { phone?: string }).phone || "",
              passwordHash: hashPassword(tempPassword),
              profileId: updated.id,
              company: (updated as { name?: string }).name || "",
              status: "active",
            },
          },
        );
      } else {
        await AuthUserModel.create({
          id: createReadableId("USR"),
          name: (updated as { name?: string }).name || "Supplier",
          email: supplierEmail,
          phone: (updated as { phone?: string }).phone || "",
          passwordHash: hashPassword(tempPassword),
          role: "supplier",
          profileId: updated.id,
          company: (updated as { name?: string }).name || "",
          status: "active",
        });
      }

      const appUrl = env.appUrl || env.corsOrigins[0] || "http://localhost:3000";
      const subject = "Welcome to Calidus Dashboard";
      const text = [
        `Hello ${(updated as { name?: string }).name || "Supplier"},`,
        "",
        "Welcome to Calidus Dashboard. Your supplier account has been approved.",
        "",
        `Login URL: ${appUrl}`,
        `Email: ${supplierEmail}`,
        `Password: ${tempPassword}`,
        "",
        "For security, please change your password after logging in.",
      ].join("\n");

      const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <p>Hello ${(updated as { name?: string }).name || "Supplier"},</p>
          <p>Welcome to Calidus Dashboard. Your supplier account has been approved.</p>
          <p><strong>Login URL:</strong> <a href="${appUrl}">${appUrl}</a><br/>
          <strong>Email:</strong> ${supplierEmail}<br/>
          <strong>Password:</strong> ${tempPassword}</p>
          <p>For security, please change your password after logging in.</p>
        </div>
      `;

      try {
        await sendSmtpEmail(supplierEmail, { subject, text, html });
      } catch (err) {
        console.error("Failed to send supplier approval credentials email", err);
      }
    }
  }

  res.json(updated);
});

export const deleteSupplier = asyncHandler(async (req: Request, res: Response) => {
  const result = await SupplierModel.deleteOne({ id: req.params.supplierId });
  if (!result.deletedCount) throw new HttpError(404, "Supplier not found");
  res.json({ success: true, message: "Supplier deleted" });
});
