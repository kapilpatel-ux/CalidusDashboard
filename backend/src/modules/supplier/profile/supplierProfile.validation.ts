import { z } from "zod";

export const updateSupplierProfileSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(1).optional(),
  certifications: z.array(z.string()).optional(),
  documents: z.array(z.record(z.unknown())).optional(),
}).passthrough();
