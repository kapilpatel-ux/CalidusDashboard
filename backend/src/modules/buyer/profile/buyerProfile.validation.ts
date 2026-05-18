import { z } from "zod";

export const updateBuyerProfileSchema = z.object({
  name: z.string().min(1).optional(),
  company: z.string().min(1).optional(),
  email: z.string().email().optional(),
  country: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
}).passthrough();
