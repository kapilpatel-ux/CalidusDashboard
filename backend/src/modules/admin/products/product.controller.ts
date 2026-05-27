import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { HttpError } from "../../../utils/httpError.js";
import { createReadableId } from "../../../utils/id.js";
import { objectsToCsv } from "../../../utils/csv.js";
import { ProductModel } from "./product.model.js";
import { createAdminNotification } from "../notifications/notification.service.js";
import { createSupplierNotification } from "../../supplier/notifications/supplierNotification.service.js";

const WORDPRESS_DEFAULT_LIMIT = 20;
const WORDPRESS_MAX_LIMIT = 100;

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parsePositiveInt = (value: unknown, fallback: number) => {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const listProducts = asyncHandler(async (_req: Request, res: Response) => {
  const products = await ProductModel.find({}, { _id: 0 }).lean();
  res.json(products);
});

// WordPress / public listing: approved-only + search + pagination
export const listApprovedProducts = asyncHandler(async (req: Request, res: Response) => {
  const q = String(req.query.q ?? "").trim();
  const page = parsePositiveInt(req.query.page, 1);
  const limit = Math.min(parsePositiveInt(req.query.limit, WORDPRESS_DEFAULT_LIMIT), WORDPRESS_MAX_LIMIT);
  const skip = (page - 1) * limit;

  const query: Record<string, unknown> = { status: { $regex: /^approved$/i } };

  if (q) {
    const regex = new RegExp(escapeRegex(q), "i");
    query.$or = [
      { name: regex },
      { description: regex },
      { shortDescription: regex },
      { category: regex },
      { subcategory: regex },
      { supplierName: regex },
    ];
  }

  const [items, total] = await Promise.all([
    ProductModel.find(query, { _id: 0 }).skip(skip).limit(limit).lean(),
    ProductModel.countDocuments(query),
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

export const getApprovedProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await ProductModel.findOne({ id: req.params.productId, status: { $regex: /^approved$/i } }, { _id: 0 }).lean();
  if (!product) throw new HttpError(404, "Product not found");
  res.json(product);
});

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await ProductModel.findOne({ id: req.params.productId }, { _id: 0 }).lean();
  if (!product) throw new HttpError(404, "Product not found");
  res.json(product);
});

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const payload = { ...req.body, id: req.body.id || createReadableId("PRD") };
  const created = await ProductModel.create(payload);
  try {
    const productName = String((payload as { name?: string; productName?: string }).name || (payload as { productName?: string }).productName || created.toJSON().name || "Product");
    await createAdminNotification({
      type: "product",
      title: "New Product Created",
      message: `${productName} was created.`,
      link: "productmanagement",
    });
  } catch (err) {
    console.error("Failed to create admin notification for product creation", err);
  }
  if (payload.supplierId) {
    try {
      await createSupplierNotification({
        supplierId: payload.supplierId,
        type: "product",
        title: "Product Created",
        message: `Product "${payload.name || created.toJSON().name}" was created by admin.`,
        link: "products",
      });
    } catch (err) {
      console.error("Failed to create supplier notification for product creation", err);
    }
  }
  res.status(201).json(created.toJSON());
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  
  const payload = { 
    ...req.body,
    status: "pending",
    updatedAt: new Date().toISOString(),
    approvalRequiredReason: "Product details updated",
  };

  const updated = await ProductModel.findOneAndUpdate(
    { id: req.params.productId },
    { $set: payload },
    { new: true, projection: { _id: 0 } },
  ).lean();

  if (!updated) throw new HttpError(404, "Product not found");
  if (updated.supplierId) {
    try {
      await createSupplierNotification({
        supplierId: updated.supplierId,
        type: "product",
        title: "Product Updated",
        message: `Your product "${updated.name}" was updated by admin and moved to pending review.`,
        link: "products",
      });
    } catch (err) {
      console.error("Failed to create supplier notification for product update", err);
    }
  }
  res.json(updated);
});

export const updateProductStatus = asyncHandler(async (req: Request, res: Response) => {
  const status = String(req.body.status || "").toLowerCase();
  const updated = await ProductModel.findOneAndUpdate(
    { id: req.params.productId },
    { $set: { status } },
    { new: true, projection: { _id: 0 } },
  ).lean();

  if (!updated) throw new HttpError(404, "Product not found");

  if (updated.supplierId) {
    await createSupplierNotification({
      supplierId: updated.supplierId,
      type: "product",
      title: status === "approved" ? "Product Approved" : status === "rejected" ? "Product Rejected" : "Product Status Updated",
      message: `Your product "${updated.name}" has been ${status}.`,
      link: "productmanagement",
    });
  }
  res.json(updated);
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await ProductModel.findOne({ id: req.params.productId }, { _id: 0, id: 1, name: 1, supplierId: 1 }).lean();
  const result = await ProductModel.deleteOne({ id: req.params.productId });
  if (!result.deletedCount) throw new HttpError(404, "Product not found");
  if (product?.supplierId) {
    try {
      await createSupplierNotification({
        supplierId: product.supplierId,
        type: "product",
        title: "Product Deleted",
        message: `Your product "${product.name || product.id}" was deleted by admin.`,
        link: "productmanagement",
      });
    } catch (err) {
      console.error("Failed to create supplier notification for product delete", err);
    }
  }
  res.json({ success: true, message: "Product deleted" });
});

export const exportProductsCsv = asyncHandler(async (req: Request, res: Response) => {
  const status = String(req.query.status ?? "").trim().toLowerCase();
  const supplierName = String(req.query.supplierName ?? "").trim();
  const category = String(req.query.category ?? "").trim();
  const q = String(req.query.q ?? "").trim();

  const query: Record<string, unknown> = {};
  if (status && status !== "all") query.status = { $regex: new RegExp(`^${escapeRegex(status)}$`, "i") };
  if (supplierName && supplierName !== "all") query.supplierName = supplierName;
  if (category && category !== "all") query.category = category;
  if (q) {
    const regex = new RegExp(escapeRegex(q), "i");
    query.$or = [{ name: regex }, { supplierName: regex }, { category: regex }, { subcategory: regex }];
  }

  const products = await ProductModel.find(query, { _id: 0 }).sort({ createdAt: -1, id: 1 }).lean();

  const csv = objectsToCsv(products as Record<string, unknown>[], [
    { key: "id", label: "id" },
    { key: "name", label: "name" },
    { key: "supplierId", label: "supplierId" },
    { key: "supplierName", label: "supplierName" },
    { key: "category", label: "category" },
    { key: "subcategory", label: "subcategory" },
    { key: "status", label: "status" },
    { key: "rating", label: "rating" },
    { key: "price", label: "price" },
    { key: "availability", label: "availability" },
    { key: "countryOfOrigin", label: "countryOfOrigin" },
    { key: "createdDate", label: "createdDate" },
    { key: "createdAt", label: "createdAt" },
  ]);

  const date = new Date().toISOString().slice(0, 10);
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename=\"products_${date}.csv\"`);
  res.setHeader("Cache-Control", "no-store");
  res.send(csv);
});
