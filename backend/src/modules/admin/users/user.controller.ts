import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { HttpError } from "../../../utils/httpError.js";
import { createReadableId } from "../../../utils/id.js";
import { env } from "../../../config/env.js";
import { sendSmtpEmail } from "../../../utils/smtpEmail.js";
import { createAdminNotification } from "../notifications/notification.service.js";
import { AuthUserModel } from "../../auth/auth.model.js";
import { hashPassword } from "../../auth/auth.service.js";
import { AdminRoleModel } from "../roles/role.model.js";
import { ensureDefaultAdminRoles } from "../roles/role.service.js";

export const listUsers = asyncHandler(async (_req: Request, res: Response) => {
  await ensureDefaultAdminRoles();
  const roles = await AdminRoleModel.find({}, { _id: 0, key: 1 }).lean();
  const allowedRoles = ["admin", ...roles.map((r) => r.key)];

  const users = await AuthUserModel.find(
    { role: { $in: allowedRoles } },
    { _id: 0, passwordHash: 0 },
  )
    .lean();

  res.json(users);
});

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  await ensureDefaultAdminRoles();
  const email = String(req.body.email).toLowerCase().trim();
  const existing = await AuthUserModel.findOne({ email }).lean();
  if (existing) throw new HttpError(409, "Email is already registered");

  const roleKey = String(req.body.role || "").trim();
  if (!roleKey) throw new HttpError(400, "Role is required");
  if (roleKey === "admin" || roleKey === "buyer" || roleKey === "supplier") {
    throw new HttpError(400, `"${roleKey}" is not allowed for admin-created users`);
  }
  const roleExists = await AdminRoleModel.findOne({ key: roleKey }).lean();
  if (!roleExists) throw new HttpError(400, "Unknown role");

  const userId = createReadableId("USR");
  const created = await AuthUserModel.create({
    id: userId,
    name: req.body.name,
    email,
    phone: req.body.phone,
    passwordHash: hashPassword(req.body.password),
    role: roleKey,
    profileId: "",
    company: "",
    status: "active",
  });

  const appUrl = env.appUrl || env.corsOrigins[0] || "http://localhost:3000";
  const subject = "Your Calidus Dashboard login details";
  const text = [
    `Hello ${req.body.name},`,
    "",
    "Your account has been created.",
    "",
    `Login URL: ${appUrl}`,
    `Email: ${email}`,
    `Password: ${req.body.password}`,
    "",
    "For security, please change your password after logging in.",
  ].join("\n");
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <p>Hello ${req.body.name},</p>
      <p>Your account has been created.</p>
      <p><strong>Login URL:</strong> <a href="${appUrl}">${appUrl}</a><br/>
      <strong>Email:</strong> ${email}<br/>
      <strong>Password:</strong> ${req.body.password}</p>
      <p>For security, please change your password after logging in.</p>
    </div>
  `;

  let emailSent = false;

  try {
    await sendSmtpEmail(email, { subject, text, html });
    emailSent = true;
  } catch (err) {
    console.error("Failed to send user credentials email", err);
  }

  const safeCreated = await AuthUserModel.findOne(
    { id: userId },
    { _id: 0, passwordHash: 0 },
  ).lean();

  try {
    await createAdminNotification({
      type: "user",
      title: "New User Created",
      message: `${req.body.name} (${email}) was created with role ${req.body.role}.`,
      link: "usermanagement",
    });
  } catch (err) {
    console.error("Failed to create admin notification for user creation", err);
  }

  res.status(201).json({
    ...(safeCreated || {
      id: userId,
      name: req.body.name,
      email,
      phone: req.body.phone,
      role: req.body.role,
      profileId: "",
      company: "",
      status: "active",
    }),
    emailSent,
  });
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
  await ensureDefaultAdminRoles();
  const payload = req.body as Partial<{
    name: string;
    email: string;
    role: string;
  }>;

  if (!payload.name && !payload.email && !payload.role) {
    throw new HttpError(400, "No update fields provided");
  }

  if (payload.role) {
    const roleKey = String(payload.role).trim();
    if (roleKey === "admin" || roleKey === "buyer" || roleKey === "supplier") {
      throw new HttpError(400, `"${roleKey}" is not allowed`);
    }
    const roleExists = await AdminRoleModel.findOne({ key: roleKey }).lean();
    if (!roleExists) throw new HttpError(400, "Unknown role");
    payload.role = roleKey;
  }

  const updated = await AuthUserModel.findOneAndUpdate(
    { id: req.params.userId },
    { $set: payload },
    { new: true, projection: { _id: 0, passwordHash: 0 } },
  ).lean();

  if (!updated) throw new HttpError(404, "User not found");
  res.json(updated);
});
