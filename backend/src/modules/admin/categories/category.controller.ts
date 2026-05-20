import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { HttpError } from "../../../utils/httpError.js";
import { createReadableId } from "../../../utils/id.js";
import { CategoryModel } from "./category.model.js";

export const listCategories = asyncHandler(async (_req: Request, res: Response) => {
  const includePending = String(_req.query.includePending || "").toLowerCase() === "true";
  const filter = includePending
    ? {}
    : {
        $or: [{ status: { $exists: false } }, { status: "approved" }],
      };

  const categories = await CategoryModel.find(filter, { _id: 0 }).lean();
  res.json(categories);
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const subcategories = (req.body.subcategories || []).map((subcategory: { id?: string; name: string }) => ({
    ...subcategory,
    id: subcategory.id || createReadableId("SUB"),
  }));

  const payload = {
    ...req.body,
    id: req.body.id || createReadableId("CAT"),
    status: req.body.status || "approved",
    subcategories,
    productCount: req.body.productCount ?? 0,
  };

  const existing = await CategoryModel.findOne({ name: payload.name });
  if (existing) throw new HttpError(409, "Category already exists");

  const created = await CategoryModel.create(payload);
  res.status(201).json(created.toJSON());
});

export const approveCategory = asyncHandler(async (req: Request, res: Response) => {
  const updated = await CategoryModel.findOneAndUpdate(
    { id: req.params.categoryId },
    { $set: { status: "approved", approvedAt: new Date().toISOString() } },
    { new: true, projection: { _id: 0 } },
  ).lean();

  if (!updated) throw new HttpError(404, "Category not found");
  res.json(updated);
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const payload = { ...req.body };
  console.log("Update payload:", payload);
  if (payload.subcategories) {
    payload.subcategories = payload.subcategories.map(
      (subcategory: { id?: string; name: string }) => ({
        ...subcategory,
        id: subcategory.id || createReadableId("SUB"),
      }),
    );
  }

  const updated = await CategoryModel.findOneAndUpdate(
    { id: req.params.categoryId },
    { $set: payload },
    { new: true, projection: { _id: 0 } },
  ).lean();

  if (!updated) throw new HttpError(404, "Category not found");

  res.json(updated);
});

export const updateSubcategory = asyncHandler(async (req: Request, res: Response) => {
  console.log("Update subcategory payload:", req.body);
  const category = await CategoryModel.findOne({ id: req.params.categoryId });
  if (!category) throw new HttpError(404, "Category not found");

  const subcategories = category.get("subcategories") || [];

  const updatedSubcategories = subcategories.map((subcategory: { id?: string }) =>
    subcategory.id === req.params.subcategoryId
      ? { ...subcategory, ...req.body, id: subcategory.id }
      : subcategory,
  );

  category.set("subcategories", updatedSubcategories);
  await category.save();

  const updated = await CategoryModel.findOne(
    { id: req.params.categoryId },
    { _id: 0 },
  ).lean();

  res.json(updated);
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const result = await CategoryModel.deleteOne({ id: req.params.categoryId });
  if (!result.deletedCount) throw new HttpError(404, "Category not found");
  res.json({ success: true, message: "Category deleted" });
});

export const deleteSubcategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await CategoryModel.findOne({ id: req.params.categoryId });
  if (!category) throw new HttpError(404, "Category not found");

  category.set(
    "subcategories",
    (category.get("subcategories") || []).filter((subcategory: { id?: string }) => subcategory.id !== req.params.subcategoryId),
  );
  await category.save();

  const updated = await CategoryModel.findOne({ id: req.params.categoryId }, { _id: 0 }).lean();
  res.json(updated);
});
