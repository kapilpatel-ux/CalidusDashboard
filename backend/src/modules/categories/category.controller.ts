import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { HttpError } from "../../utils/httpError.js";
import { CategoryModel } from "./category.model.js";

export const listCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await CategoryModel.find({}, { _id: 0 }).lean();
  res.json(categories);
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
