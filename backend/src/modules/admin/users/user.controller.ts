import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { HttpError } from "../../../utils/httpError.js";
import { BuyerModel } from "../buyers/buyer.model.js";
import { SupplierModel } from "../suppliers/supplier.model.js";

export const listUsers = asyncHandler(async (_req: Request, res: Response) => {
  const [suppliers, buyers] = await Promise.all([
    SupplierModel.find({}, { _id: 0 }).lean(),
    BuyerModel.find({}, { _id: 0 }).lean(),
  ]);

  res.json([
    ...suppliers.map((supplier) => ({ ...supplier, role: "supplier" })),
    ...buyers.map((buyer) => ({ ...buyer, role: "buyer" })),
  ]);
});

export const updateUserStatus = asyncHandler(async (req: Request, res: Response) => {
  let updated;

  if (req.params.role === "supplier") {
    updated = await SupplierModel.findOneAndUpdate(
      { id: req.params.userId },
      { $set: { status: req.body.status } },
      { new: true, projection: { _id: 0 } },
    ).lean();
  } else if (req.params.role === "buyer") {
    updated = await BuyerModel.findOneAndUpdate(
      { id: req.params.userId },
      { $set: { status: req.body.status } },
      { new: true, projection: { _id: 0 } },
    ).lean();
  } else {
    throw new HttpError(400, "Unsupported user role");
  }

  if (!updated) throw new HttpError(404, "User not found");
  res.json({ ...updated, role: req.params.role });
});
