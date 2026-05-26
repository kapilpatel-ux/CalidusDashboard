import { z } from "zod";
import { validatePhoneNumber } from "../../../utils/phoneValidation.js";

export const userStatusSchema = z.object({
  status: z.string().min(1),
});

export const userCreateSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1, "Mobile number is required"),
  password: z.string().min(6),
  role: z.string().min(1),
}).superRefine((data, ctx) => {
  const phoneError = validatePhoneNumber(data.phone);
  if (phoneError) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: phoneError, path: ["phone"] });
  }
});

export const userUpdateSchema = z.object({
  name: z.string().trim().min(2).max(60).optional(),
  email: z.string().trim().email().optional(),
  phone: z.string().trim().min(1, "Phone number is required").optional(),
  company: z.string().trim().max(80).optional(),
  role: z.string().min(1).optional(),
}).superRefine((data, ctx) => {
  if (!data.phone) return;
  const phoneError = validatePhoneNumber(data.phone);
  if (phoneError) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: phoneError, path: ["phone"] });
  }
});
