import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { HttpError } from "../../../utils/httpError.js";
import { createReadableId } from "../../../utils/id.js";
import { ProductModel } from "../../admin/products/product.model.js";
import { SupplierModel } from "../../admin/suppliers/supplier.model.js";
import { createAdminNotification } from "../../admin/notifications/notification.service.js";

const nowIso = () => new Date().toISOString();
const dateOnly = () => nowIso().split("T")[0];

type ProductWithMongoId = Record<string, unknown> & {
  _id?: { getTimestamp?: () => Date };
  createdAt?: string;
  createdDate?: string;
};

function normalizeProductDates(product: ProductWithMongoId) {
  const mongoCreatedAt = product._id?.getTimestamp?.().toISOString();
  const createdAt = product.createdAt || product.createdDate || mongoCreatedAt || "";
  const createdDate = product.createdDate || (createdAt ? createdAt.split("T")[0] : "");
  const { _id, ...productWithoutMongoId } = product;

  return {
    ...productWithoutMongoId,
    createdAt,
    createdDate,
  };
}

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
  const products = await ProductModel.find({ supplierId })
    .sort({ createdAt: -1, createdDate: -1, id: -1 })
    .lean<ProductWithMongoId[]>();

  res.json(products.map(normalizeProductDates));
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
    createdAt: req.body.createdAt || nowIso(),
    createdDate: req.body.createdDate || dateOnly(),
  };

  const created = await ProductModel.create(payload);
  await syncSupplierProductCount(supplierId);
  try {
    const productName = String(req.body.name || req.body.productName || payload.name || "Product");
    await createAdminNotification({
      type: "product",
      title: "New Product Pending Approval",
      message: `${supplier.name} submitted ${productName} for approval.`,
      link: "productmanagement",
    });
  } catch (err) {
    console.error("Failed to create admin notification for supplier product", err);
  }
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
