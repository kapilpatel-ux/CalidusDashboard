import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { HttpError } from "../../../utils/httpError.js";
import { createReadableId } from "../../../utils/id.js";
import { AuthUserModel } from "../../auth/auth.model.js";
import { hashPassword } from "../../auth/auth.service.js";

export const listUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await AuthUserModel.find(
    { role: { $in: ["sub_admin", "content_manager"] } },
    { _id: 0, passwordHash: 0 },
  )
    .lean();

  res.json(users);
});

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const email = String(req.body.email).toLowerCase().trim();
  const existing = await AuthUserModel.findOne({ email }).lean();
  if (existing) throw new HttpError(409, "Email is already registered");

  const created = await AuthUserModel.create({
    id: createReadableId("USR"),
    name: req.body.name,
    email,
    phone: req.body.phone,
    passwordHash: hashPassword(req.body.password),
    role: req.body.role,
    profileId: "",
    company: "",
    status: "active",
  });

  res.status(201).json(created.toJSON());
});

export const updateUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const updated = await AuthUserModel.findOneAndUpdate(
    { id: req.params.userId },
    { $set: { status: req.body.status } },
    { new: true, projection: { _id: 0, passwordHash: 0 } },
  ).lean();

  if (!updated) throw new HttpError(404, "User not found");
  res.json(updated);
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const payload = req.body as Partial<{
    name: string;
    email: string;
    role: string;
  }>;

  if (!payload.name && !payload.email && !payload.role) {
    throw new HttpError(400, "No update fields provided");
  }

  const updated = await AuthUserModel.findOneAndUpdate(
    { id: req.params.userId },
    { $set: payload },
    { new: true, projection: { _id: 0, passwordHash: 0 } },
  ).lean();

  if (!updated) throw new HttpError(404, "User not found");
  res.json(updated);
});
