import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { createReadableId } from "../../utils/id.js";
import { StatusCheckModel } from "./status.model.js";

export const createStatusCheck = asyncHandler(async (req: Request, res: Response) => {
  const created = await StatusCheckModel.create({
    id: createReadableId("STA"),
    client_name: req.body.client_name,
    timestamp: new Date(),
  });

  res.status(201).json(created.toJSON());
});

export const listStatusChecks = asyncHandler(async (_req: Request, res: Response) => {
  const checks = await StatusCheckModel.find({}, { _id: 0 }).limit(1000).lean();
  res.json(checks);
});
