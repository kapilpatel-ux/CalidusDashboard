import { z } from "zod";
import { validatePhoneNumber } from "../../utils/phoneValidation.js";

export const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "sub_admin", "content_manager", "buyer", "supplier"]),
  company: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  supplierType: z.string().min(1).optional(),
}).superRefine((data, ctx) => {
  if (!data.phone) return;
  const phoneError = validatePhoneNumber(data.phone, data.country);
  if (phoneError) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: phoneError, path: ["phone"] });
  }
});

export const loginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
});
