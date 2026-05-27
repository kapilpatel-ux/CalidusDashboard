import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { HttpError } from "../../../utils/httpError.js";
import { createReadableId } from "../../../utils/id.js";
import { CategoryModel } from "../../admin/categories/category.model.js";
import { createAdminNotification } from "../../admin/notifications/notification.service.js";

export const listSupplierCategoryRequests = asyncHandler(async (req: Request, res: Response) => {
  const supplierId = req.params.supplierId;
  const requests = await CategoryModel.find(
    { status: "pending", requestedBy: supplierId },
    { _id: 0 },
  ).sort({ requestedAt: -1 }).lean();
  res.json(requests);
});

export const listSupplierCategories = asyncHandler(async (req: Request, res: Response) => {
  const supplierId = req.params.supplierId;
  const categories = await CategoryModel.find(
    { requestedBy: supplierId },
    { _id: 0 },
  ).sort({ requestedAt: -1, approvedAt: -1, name: 1 }).lean();
  res.json(categories);
});

export const createSupplierCategoryRequest = asyncHandler(async (req: Request, res: Response) => {
  const name = String(req.body.name || "").trim();
  if (!name) throw new HttpError(400, "Category name is required");

  const existing = await CategoryModel.findOne({ name }).lean();
  if (existing) throw new HttpError(409, "Category already exists");

  const created = await CategoryModel.create({
    id: createReadableId("CAT"),
    name,
    subcategories: [],
    productCount: 0,
    status: "pending",
    requestedBy: req.params.supplierId,
    requestedAt: new Date().toISOString(),
  });
  try {
    await createAdminNotification({
      type: "category",
      title: "New Category Request",
      message: `Supplier requested category "${name}".`,
      link: "categorymanagement",
    });
  } catch (err) {
    console.error("Failed to create admin notification for category request", err);
  }

  res.status(201).json(created.toJSON());
});
