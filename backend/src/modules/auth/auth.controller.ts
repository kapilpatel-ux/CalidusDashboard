import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { HttpError } from "../../utils/httpError.js";
import { createReadableId } from "../../utils/id.js";
import { BuyerModel } from "../admin/buyers/buyer.model.js";
import { SupplierModel } from "../admin/suppliers/supplier.model.js";
import { createAdminNotification } from "../admin/notifications/notification.service.js";
import { AuthUserModel } from "./auth.model.js";
import { hashPassword, signJwt, verifyPassword } from "./auth.service.js";

const today = () => new Date().toISOString().split("T")[0];

function buildAuthResponse(user: { id: string; name: string; email: string; role: string; profileId?: string; company?: string; status?: string }) {
  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    profileId: user.profileId || "",
    company: user.company || "",
    status: user.status || "active",
  };

  return {
    token: signJwt({
      sub: safeUser.id,
      role: safeUser.role,
      profileId: safeUser.profileId,
      email: safeUser.email,
    }),
    user: safeUser,
  };
}

const approvedSupplierStatuses = new Set(["active", "approved"]);

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const email = String(req.body.email).toLowerCase().trim();
  const existing = await AuthUserModel.findOne({ email }).lean();
  if (existing) throw new HttpError(409, "Email is already registered");

  const userId = createReadableId("USR");
  const role = req.body.role;
  let profileId = "";
  let company = req.body.company || "";

  if (role === "buyer") {
    profileId = createReadableId("BUY");
    const buyer = await BuyerModel.create({
      id: profileId,
      name: req.body.name,
      company: company || "Independent Buyer",
      country: req.body.country || "",
      email,
      phone: req.body.phone || "",
      joinDate: today(),
      status: "active",
      enquiriesSent: 0,
      ratingsSubmitted: 0,
    });
    company = (buyer.toJSON() as { company?: string }).company || company;
  }

  if (role === "supplier") {
    profileId = createReadableId("SUP");
    const supplier = await SupplierModel.create({
      id: profileId,
      name: company || req.body.name,
      type: req.body.supplierType || "OEM",
      country: req.body.country || "",
      email,
      phone: req.body.phone || "",
      certifications: [],
      status: "pending",
      joinDate: today(),
      profileViews: 0,
      totalEnquiries: 0,
      productsCount: 0,
      rating: 0,
      documents: [],
      documentStatus: "pending",
    });
    company = supplier.name;
    try {
      await createAdminNotification({
        type: "approval",
        title: "New Supplier Pending Approval",
        message: `${company} has registered and is pending approval.`,
        link: "suppliermanagement",
      });
    } catch (err) {
      console.error("Failed to create admin notification for supplier signup", err);
    }
  }

  const created = await AuthUserModel.create({
    id: userId,
    name: req.body.name,
    email,
    passwordHash: hashPassword(req.body.password),
    role,
    profileId,
    company,
    status: role === "supplier" ? "pending" : "active",
  });

  res.status(201).json(buildAuthResponse(created.toJSON()));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const email = String(req.body.email).toLowerCase().trim();
  const user = await AuthUserModel.findOne({ email }).lean();

  console.log("LOGIN DEBUG:", {
    email,
    userFound: Boolean(user),
    role: user?.role,
    status: user?.status,
    hashStarts: user?.passwordHash?.slice(0, 20),
    passwordMatch: user ? verifyPassword(req.body.password, user.passwordHash) : false,
  });

  if (!user || !verifyPassword(req.body.password, user.passwordHash)) {
    throw new HttpError(401, "Invalid email or password");
  }

  if (user.status === "suspended") {
    throw new HttpError(403, "This account is suspended");
  }

  if (user.role === "supplier") {
    const supplier = await SupplierModel.findOne({ id: user.profileId }, { _id: 0, status: 1 }).lean();
    const supplierStatus = String(supplier?.status || "").toLowerCase();
    if (!supplier || !approvedSupplierStatuses.has(supplierStatus)) {
      throw new HttpError(403, "Your supplier account is not approved yet");
    }
    if (user.status !== "active") {
      await AuthUserModel.updateOne({ id: user.id }, { $set: { status: "active" } });
      user.status = "active";
    }
  }

  res.json(buildAuthResponse(user));
});
