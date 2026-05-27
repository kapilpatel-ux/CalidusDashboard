import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { HttpError } from "../../../utils/httpError.js";
import { createReadableId } from "../../../utils/id.js";
import { CategoryModel } from "./category.model.js";
import { createSupplierNotification } from "../../supplier/notifications/supplierNotification.service.js";

const getCategorySupplierId = (category: { supplierId?: string; requestedBy?: string } = {}) =>
  category.supplierId || category.requestedBy || "";

async function notifyCategorySupplier(
  category: { supplierId?: string; requestedBy?: string; name?: string },
  title: string,
  message: string,
) {
  const supplierId = getCategorySupplierId(category);
  if (!supplierId) return;
  await createSupplierNotification({
    supplierId,
    type: "category",
    title,
    message,
    link: "categorymanagement",
  });
}

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
  try {
    await notifyCategorySupplier(
      created.toJSON(),
      "Category Created",
      `Category "${payload.name}" was created by admin.`,
    );
  } catch (err) {
    console.error("Failed to create supplier notification for category creation", err);
  }
  res.status(201).json(created.toJSON());
});

export const approveCategory = asyncHandler(async (req: Request, res: Response) => {
  const updated = await CategoryModel.findOneAndUpdate(
    { id: req.params.categoryId },
    { $set: { status: "approved", approvedAt: new Date().toISOString() } },
    { new: true, projection: { _id: 0 } },
  ).lean();

  if (!updated) throw new HttpError(404, "Category not found");

  const category = updated as {
    supplierId?: string;
    requestedBy?: string;
    name?: string;
  };

  await notifyCategorySupplier(category, "Category Approved", `Your category "${category.name}" has been approved.`);
  res.json(updated);
});

export const rejectCategory = asyncHandler(async (req: Request, res: Response) => {
  const updated = await CategoryModel.findOneAndUpdate(
    { id: req.params.categoryId },
    {
      $set: {
        status: "rejected",
        rejectedAt: new Date().toISOString(),
      },
    },
    { new: true, projection: { _id: 0 } },
  ).lean();

  if (!updated) throw new HttpError(404, "Category not found");

  console.log("REJECTED CATEGORY UPDATED:", updated);

  const category = updated as {
    supplierId?: string;
    requestedBy?: string;
    name?: string;
  };

  await notifyCategorySupplier(category, "Category Rejected", `Your category "${category.name}" has been rejected.`);

  res.json(updated);
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const payload = {
    ...req.body,
    status: "pending",
    updatedAt: new Date().toISOString(),
    approvalRequiredReason: "Category details updated",
  };

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
  try {
    await notifyCategorySupplier(
      updated as { supplierId?: string; requestedBy?: string; name?: string },
      "Category Updated",
      `Category "${(updated as { name?: string }).name || "your category"}" was updated by admin.`,
    );
  } catch (err) {
    console.error("Failed to create supplier notification for category update", err);
  }

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
  category.set("status", "pending");
  category.set("updatedAt", new Date().toISOString());
  category.set("approvalRequiredReason", "Subcategory details updated");
  await category.save();

  const updated = await CategoryModel.findOne(
    { id: req.params.categoryId },
    { _id: 0 },
  ).lean();
  if (updated) {
    try {
      await notifyCategorySupplier(
        updated as { supplierId?: string; requestedBy?: string; name?: string },
        "Subcategory Updated",
        `A subcategory in "${(updated as { name?: string }).name || "your category"}" was updated by admin.`,
      );
    } catch (err) {
      console.error("Failed to create supplier notification for subcategory update", err);
    }
  }

  res.json(updated);
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await CategoryModel.findOne({ id: req.params.categoryId }, { _id: 0 }).lean();
  const result = await CategoryModel.deleteOne({ id: req.params.categoryId });
  if (!result.deletedCount) throw new HttpError(404, "Category not found");
  if (category) {
    try {
      await notifyCategorySupplier(
        category as { supplierId?: string; requestedBy?: string; name?: string },
        "Category Deleted",
        `Category "${(category as { name?: string }).name || "your category"}" was deleted by admin.`,
      );
    } catch (err) {
      console.error("Failed to create supplier notification for category delete", err);
    }
  }
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
  if (updated) {
    try {
      await notifyCategorySupplier(
        updated as { supplierId?: string; requestedBy?: string; name?: string },
        "Subcategory Deleted",
        `A subcategory in "${(updated as { name?: string }).name || "your category"}" was deleted by admin.`,
      );
    } catch (err) {
      console.error("Failed to create supplier notification for subcategory delete", err);
    }
  }
  res.json(updated);
});
