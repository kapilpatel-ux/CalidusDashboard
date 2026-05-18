import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { HttpError } from "../../../utils/httpError.js";
import { createReadableId } from "../../../utils/id.js";
import { ProductModel } from "../../admin/products/product.model.js";
import { SupplierModel } from "../../admin/suppliers/supplier.model.js";

async function syncSupplierProductCount(supplierId: string) {
  const productsCount = await ProductModel.countDocuments({ supplierId });
  await SupplierModel.updateOne({ id: supplierId }, { $set: { productsCount } });
}

async function getSupplierOrThrow(supplierId: string) {
  const supplier = await SupplierModel.findOne(
    { id: supplierId },
    { _id: 0, id: 1, name: 1, country: 1 },
  ).lean();

  if (!supplier) throw new HttpError(404, "Supplier not found");
  return supplier as { id: string; name: string; country?: string };
}

export const listSupplierProducts = asyncHandler(async (req: Request, res: Response) => {
  const supplierId = String(req.params.supplierId);
  const products = await ProductModel.find({ supplierId }, { _id: 0 })
    .sort({ name: 1 })
    .lean();

  res.json(products);
});

export const createSupplierProduct = asyncHandler(async (req: Request, res: Response) => {
  const supplierId = String(req.params.supplierId);
  const supplier = await getSupplierOrThrow(supplierId);
  const payload = {
    ...req.body,
    id: createReadableId("PRD"),
    supplierId,
    supplierName: supplier.name,
    countryOfOrigin: req.body.countryOfOrigin || supplier.country || "",
    status: "pending",
    rating: 0,
  };

  const created = await ProductModel.create(payload);
  await syncSupplierProductCount(supplierId);
  res.status(201).json(created.toJSON());
});

export const updateSupplierProduct = asyncHandler(async (req: Request, res: Response) => {
  const supplierId = String(req.params.supplierId);
  await getSupplierOrThrow(supplierId);

  const existing = await ProductModel.findOne(
    { id: req.params.productId, supplierId },
    { _id: 0 },
  ).lean();

  if (!existing) throw new HttpError(404, "Product not found");

  const nextStatus = existing.status === "approved" ? "pending" : existing.status;
  const updated = await ProductModel.findOneAndUpdate(
    { id: req.params.productId, supplierId },
    {
      $set: {
        ...req.body,
        supplierId,
        supplierName: existing.supplierName,
        status: nextStatus,
      },
    },
    { new: true, projection: { _id: 0 } },
  ).lean();

  res.json(updated);
});

export const deleteSupplierProduct = asyncHandler(async (req: Request, res: Response) => {
  const supplierId = String(req.params.supplierId);
  const result = await ProductModel.deleteOne({ id: req.params.productId, supplierId });

  if (!result.deletedCount) throw new HttpError(404, "Product not found");

  await syncSupplierProductCount(supplierId);
  res.json({ success: true, message: "Product deleted" });
});
