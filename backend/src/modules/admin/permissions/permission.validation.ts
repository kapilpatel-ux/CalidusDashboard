import { z } from "zod";

export const adminPermissionCreateSchema = z.object({
  label: z.string().min(1, "Permission name is required"),
  group: z.string().min(1).optional(),
});

export const adminPermissionUpdateSchema = z.object({
  label: z.string().min(1, "Permission name is required"),
  group: z.string().min(1).optional(),
});

