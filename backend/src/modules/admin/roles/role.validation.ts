import { z } from "zod";

export const adminRoleCreateSchema = z.object({
  label: z.string().min(1, "Role name is required"),
});

export const adminRoleUpdateSchema = z.object({
  label: z.string().min(1, "Role name is required"),
});

export const adminRolePermissionsSchema = z.object({
  permissions: z.array(z.string().min(1)).default([]),
});
