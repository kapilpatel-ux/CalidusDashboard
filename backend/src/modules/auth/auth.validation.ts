import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "buyer", "supplier"]),
  company: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  supplierType: z.string().min(1).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
});
