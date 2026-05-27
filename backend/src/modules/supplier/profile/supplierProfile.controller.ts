import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { HttpError } from "../../../utils/httpError.js";
import { SupplierModel } from "../../admin/suppliers/supplier.model.js";

export const getSupplierProfile = asyncHandler(async (req: Request, res: Response) => {
  const supplier = await SupplierModel.findOne({ id: req.params.supplierId }, { _id: 0 }).lean();
  if (!supplier) throw new HttpError(404, "Supplier not found");
  res.json(supplier);
});

export const updateSupplierProfile = asyncHandler(async (req: Request, res: Response) => {
  const { id: _id, ...payload } = req.body;
  const updated = await SupplierModel.findOneAndUpdate(
    { id: req.params.supplierId },
    { $set: payload },
    { new: true, projection: { _id: 0 } },
  ).lean();

  if (!updated) throw new HttpError(404, "Supplier not found");
  res.json(updated);
});
