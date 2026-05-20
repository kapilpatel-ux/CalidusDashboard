import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { HttpError } from "../../../utils/httpError.js";
import { createReadableId } from "../../../utils/id.js";
import { ProductModel } from "./product.model.js";

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

  const query: Record<string, unknown> = { status: "approved" };

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
  const product = await ProductModel.findOne({ id: req.params.productId, status: "approved" }, { _id: 0 }).lean();
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
  res.status(201).json(created.toJSON());
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const updated = await ProductModel.findOneAndUpdate(
    { id: req.params.productId },
    { $set: req.body },
    { new: true, projection: { _id: 0 } },
  ).lean();

  if (!updated) throw new HttpError(404, "Product not found");
  res.json(updated);
});

export const updateProductStatus = asyncHandler(async (req: Request, res: Response) => {
  const updated = await ProductModel.findOneAndUpdate(
    { id: req.params.productId },
    { $set: { status: req.body.status } },
    { new: true, projection: { _id: 0 } },
  ).lean();

  if (!updated) throw new HttpError(404, "Product not found");
  res.json(updated);
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const result = await ProductModel.deleteOne({ id: req.params.productId });
  if (!result.deletedCount) throw new HttpError(404, "Product not found");
  res.json({ success: true, message: "Product deleted" });
});
