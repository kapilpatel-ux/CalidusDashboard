import { z } from "zod";

export const userStatusSchema = z.object({
  status: z.string().min(1),
});

export const userCreateSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(5, "Mobile number is required"),
  password: z.string().min(6),
  role: z.string().min(1),
});

export const userUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.string().min(1).optional(),
});
