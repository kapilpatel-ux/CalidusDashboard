import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { HttpError } from "../../../utils/httpError.js";
import { createReadableId } from "../../../utils/id.js";
import { SupplierModel } from "./supplier.model.js";

export const listSuppliers = asyncHandler(async (_req: Request, res: Response) => {
  const suppliers = await SupplierModel.find({}, { _id: 0 }).lean();
  res.json(suppliers);
});

export const getSupplier = asyncHandler(async (req: Request, res: Response) => {
  const supplier = await SupplierModel.findOne({ id: req.params.supplierId }, { _id: 0 }).lean();
  if (!supplier) throw new HttpError(404, "Supplier not found");
  res.json(supplier);
});

export const createSupplier = asyncHandler(async (req: Request, res: Response) => {
  const payload = { ...req.body, id: req.body.id || createReadableId("SUP") };
  const created = await SupplierModel.create(payload);
  res.status(201).json(created.toJSON());
});

export const updateSupplier = asyncHandler(async (req: Request, res: Response) => {
  const updated = await SupplierModel.findOneAndUpdate(
    { id: req.params.supplierId },
    { $set: req.body },
    { new: true, projection: { _id: 0 } },
  ).lean();

  if (!updated) throw new HttpError(404, "Supplier not found");
  res.json(updated);
});

export const updateSupplierStatus = asyncHandler(async (req: Request, res: Response) => {
  const updated = await SupplierModel.findOneAndUpdate(
    { id: req.params.supplierId },
    { $set: { status: req.body.status } },
    { new: true, projection: { _id: 0 } },
  ).lean();

  if (!updated) throw new HttpError(404, "Supplier not found");
  res.json(updated);
});

export const deleteSupplier = asyncHandler(async (req: Request, res: Response) => {
  const result = await SupplierModel.deleteOne({ id: req.params.supplierId });
  if (!result.deletedCount) throw new HttpError(404, "Supplier not found");
  res.json({ success: true, message: "Supplier deleted" });
});
