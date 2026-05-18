import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { HttpError } from "../../../utils/httpError.js";
import { createReadableId } from "../../../utils/id.js";
import { ProductModel } from "./product.model.js";

export const listProducts = asyncHandler(async (_req: Request, res: Response) => {
  const products = await ProductModel.find({}, { _id: 0 }).lean();
  res.json(products);
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
