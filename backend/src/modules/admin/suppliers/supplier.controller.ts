import type { Request, Response } from "express";
import crypto from "crypto";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { HttpError } from "../../../utils/httpError.js";
import { createReadableId, createSequentialId } from "../../../utils/id.js";
import { env } from "../../../config/env.js";
import { sendSmtpEmail } from "../../../utils/smtpEmail.js";
import { AuthUserModel } from "../../auth/auth.model.js";
import { hashPassword } from "../../auth/auth.service.js";
import { objectsToCsv } from "../../../utils/csv.js";
import { parseCsv } from "../../../utils/csvParse.js";
import { createAdminNotification } from "../notifications/notification.service.js";
import { createSupplierNotification } from "../../supplier/notifications/supplierNotification.service.js";
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
  const { id: _id, ...body } = req.body;
  const payload = { ...body, id: await createSequentialId(SupplierModel, "sup") };
  const created = await SupplierModel.create(payload);
  let credentials: { email: string; password: string } | null = null;

  const supplierEmail = String(payload.email || "").toLowerCase().trim();
  if (supplierEmail) {
    const existingSupplierUser = await AuthUserModel.findOne(
      { role: "supplier", $or: [{ profileId: payload.id }, { email: supplierEmail }] },
      { _id: 0, id: 1 },
    ).lean();

    if (!existingSupplierUser) {
      const tempPassword = crypto.randomBytes(10).toString("base64url");
      await AuthUserModel.create({
        id: createReadableId("USR"),
        name: payload.name || "Supplier",
        email: supplierEmail,
        phone: payload.phone || "",
        passwordHash: hashPassword(tempPassword),
        role: "supplier",
        profileId: payload.id,
        company: payload.name || "",
        status: "pending",
      });
      credentials = { email: supplierEmail, password: tempPassword };
    }
  }

  try {
    await createAdminNotification({
      type: "supplier",
      title: "New Supplier Created",
      message: `${payload.name || "A supplier"} (${payload.email || "no email"}) was created.`,
      link: "suppliermanagement",
    });
  } catch (err) {
    console.error("Failed to create admin notification for supplier creation", err);
  }
  try {
    await createSupplierNotification({
      supplierId: payload.id,
      type: "supplier",
      title: "Supplier Profile Created",
      message: `Your supplier profile "${payload.name || payload.id}" was created.`,
      link: "profile",
    });
  } catch (err) {
    console.error("Failed to create supplier notification for supplier creation", err);
  }
  res.status(201).json({ ...created.toJSON(), credentials });
});

export const updateSupplier = asyncHandler(async (req: Request, res: Response) => {
  const { id: _id, ...payload } = req.body;
  const updated = await SupplierModel.findOneAndUpdate(
    { id: req.params.supplierId },
    { $set: payload },
    { new: true, projection: { _id: 0 } },
  ).lean();

  if (!updated) throw new HttpError(404, "Supplier not found");
  try {
    await createSupplierNotification({
      supplierId: String(updated.id),
      type: "supplier",
      title: "Supplier Profile Updated",
      message: `Your supplier profile "${updated.name || updated.id}" was updated by admin.`,
      link: "profile",
    });
  } catch (err) {
    console.error("Failed to create supplier notification for supplier update", err);
  }
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
  try {
    await createSupplierNotification({
      supplierId: String(updated.id),
      type: "supplier",
      title: "Supplier Status Updated",
      message: `Your supplier status has been changed to ${req.body.status}.`,
      link: "profile",
    });
  } catch (err) {
    console.error("Failed to create supplier notification for supplier status", err);
  }

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

      let tempPassword = "";
      if (existingSupplierUser) {
        await AuthUserModel.updateOne(
          { id: existingSupplierUser.id },
          {
            $set: {
              name: (updated as { name?: string }).name || "Supplier",
              email: supplierEmail,
              phone: (updated as { phone?: string }).phone || "",
              profileId: updated.id,
              company: (updated as { name?: string }).name || "",
              status: "active",
            },
          },
        );
      } else {
        tempPassword = crypto.randomBytes(10).toString("base64url");
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
        tempPassword ? `Password: ${tempPassword}` : "Password: Use the password shown when you registered.",
        "",
        "For security, please change your password after logging in.",
      ].join("\n");

      const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <p>Hello ${(updated as { name?: string }).name || "Supplier"},</p>
          <p>Welcome to Calidus Dashboard. Your supplier account has been approved.</p>
          <p><strong>Login URL:</strong> <a href="${appUrl}">${appUrl}</a><br/>
          <strong>Email:</strong> ${supplierEmail}<br/>
          <strong>Password:</strong> ${tempPassword || "Use the password shown when you registered."}</p>
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
  const supplier = await SupplierModel.findOne({ id: req.params.supplierId }, { _id: 0, id: 1, name: 1 }).lean();
  const result = await SupplierModel.deleteOne({ id: req.params.supplierId });
  if (!result.deletedCount) throw new HttpError(404, "Supplier not found");
  if (supplier) {
    try {
      await createSupplierNotification({
        supplierId: String(supplier.id),
        type: "supplier",
        title: "Supplier Profile Deleted",
        message: `Your supplier profile "${supplier.name || supplier.id}" was deleted by admin.`,
        link: "profile",
      });
    } catch (err) {
      console.error("Failed to create supplier notification for supplier delete", err);
    }
  }
  res.json({ success: true, message: "Supplier deleted" });
});

export const exportSuppliersCsv = asyncHandler(async (req: Request, res: Response) => {
  const status = String(req.query.status ?? "").trim().toLowerCase();
  const documentStatus = String(req.query.documentStatus ?? "").trim().toLowerCase();
  const q = String(req.query.q ?? "").trim();

  const query: Record<string, unknown> = {};
  if (status && status !== "all") query.status = { $regex: new RegExp(`^${escapeRegex(status)}$`, "i") };
  if (documentStatus && documentStatus !== "all") query.documentStatus = { $regex: new RegExp(`^${escapeRegex(documentStatus)}$`, "i") };
  if (q) {
    const regex = new RegExp(escapeRegex(q), "i");
    query.$or = [{ name: regex }, { email: regex }, { country: regex }, { type: regex }, { businessType: regex }];
  }

  const suppliers = await SupplierModel.find(query, { _id: 0 }).sort({ joinDate: -1, id: 1 }).lean();

  const csv = objectsToCsv(suppliers as Record<string, unknown>[], [
    { key: "id", label: "id" },
    { key: "name", label: "name" },
    { key: "email", label: "email" },
    { key: "phone", label: "phone" },
    { key: "type", label: "type" },
    { key: "businessType", label: "businessType" },
    { key: "calidusCluster", label: "calidusCluster" },
    { key: "country", label: "country" },
    { key: "productsCount", label: "productsCount" },
    { key: "documentStatus", label: "documentStatus" },
    { key: "status", label: "status" },
    { key: "joinDate", label: "joinDate" },
    { key: "rating", label: "rating" },
    { key: "totalEnquiries", label: "totalEnquiries" },
    { key: "profileViews", label: "profileViews" },
  ]);

  const date = new Date().toISOString().slice(0, 10);
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename=\"suppliers_${date}.csv\"`);
  res.setHeader("Cache-Control", "no-store");
  res.send(csv);
});

const SUPPLIER_COLUMNS = [
  "id",
  "name",
  "email",
  "phone",
  "type",
  "businessType",
  "calidusCluster",
  "country",
  "productsCount",
  "documentStatus",
  "status",
  "joinDate",
  "rating",
  "totalEnquiries",
  "profileViews",
] as const;

const toNumberOrUndefined = (value: string) => {
  if (!value) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
};

export const importSuppliersCsv = asyncHandler(async (req: Request, res: Response) => {
  const csvText = String(req.body?.csv ?? "");
  if (!csvText.trim()) throw new HttpError(400, "CSV content is required");

  const parsed = parseCsv(csvText);
  if (!parsed.headers.length) throw new HttpError(400, "CSV file is empty or missing headers");

  const expected = new Set<string>(SUPPLIER_COLUMNS);
  const provided = new Set<string>(parsed.headers.filter(Boolean));
  const missingFields = SUPPLIER_COLUMNS.filter((h) => !provided.has(h));
  const unknownFields = parsed.headers.filter((h) => h && !expected.has(h));

  if (missingFields.length || unknownFields.length) {
    res.status(400).json({
      message: "CSV headers do not match the expected format",
      expectedFields: SUPPLIER_COLUMNS,
      missingFields,
      unknownFields,
    });
    return;
  }

  const errors: Array<{ line: number; message: string }> = [];
  let created = 0;
  let updated = 0;

  for (let index = 0; index < parsed.rows.length; index++) {
    const line = index + 2;
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
      type: String(row.type || "").trim() || "OEM",
      businessType: String(row.businessType || "").trim(),
      calidusCluster: String(row.calidusCluster || "").trim(),
      country: String(row.country || "").trim(),
      documentStatus: String(row.documentStatus || "").trim() || "active",
      status: String(row.status || "").trim() || "pending",
      joinDate: String(row.joinDate || "").trim(),
    };

    const productsCount = toNumberOrUndefined(String(row.productsCount || ""));
    if (row.productsCount && productsCount === undefined) {
      errors.push({ line, message: `Invalid number in productsCount: "${row.productsCount}"` });
      continue;
    }
    const rating = toNumberOrUndefined(String(row.rating || ""));
    if (row.rating && rating === undefined) {
      errors.push({ line, message: `Invalid number in rating: "${row.rating}"` });
      continue;
    }
    const totalEnquiries = toNumberOrUndefined(String(row.totalEnquiries || ""));
    if (row.totalEnquiries && totalEnquiries === undefined) {
      errors.push({ line, message: `Invalid number in totalEnquiries: "${row.totalEnquiries}"` });
      continue;
    }
    const profileViews = toNumberOrUndefined(String(row.profileViews || ""));
    if (row.profileViews && profileViews === undefined) {
      errors.push({ line, message: `Invalid number in profileViews: "${row.profileViews}"` });
      continue;
    }

    if (productsCount !== undefined) payload.productsCount = productsCount;
    if (rating !== undefined) payload.rating = rating;
    if (totalEnquiries !== undefined) payload.totalEnquiries = totalEnquiries;
    if (profileViews !== undefined) payload.profileViews = profileViews;

    const id = String(row.id || "").trim();
    if (id) {
      const result = await SupplierModel.updateOne({ id }, { $set: payload }, { upsert: true });
      if (result.upsertedCount) created += 1;
      else updated += 1;
      continue;
    }

    const existingByEmail = await SupplierModel.findOne({ email }, { _id: 0, id: 1 }).lean() as { id?: string } | null;
    if (existingByEmail?.id) {
      await SupplierModel.updateOne({ id: existingByEmail.id }, { $set: payload });
      updated += 1;
    } else {
      const newId = await createSequentialId(SupplierModel, "sup");
      await SupplierModel.create({ id: newId, ...payload });
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
        type: "supplier",
        title: "Suppliers Imported",
        message: `${created} supplier${created === 1 ? "" : "s"} created from CSV import.`,
        link: "suppliermanagement",
      });
    } catch (err) {
      console.error("Failed to create admin notification for supplier import", err);
    }
  }

  res.json({ created, updated, failed: 0 });
});
