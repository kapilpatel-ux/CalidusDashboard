import { z } from "zod";

export const supplierCategoryRequestSchema = z.object({
  name: z.string().min(1),
});

