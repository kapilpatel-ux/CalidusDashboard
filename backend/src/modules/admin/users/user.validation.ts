import { z } from "zod";

export const userStatusSchema = z.object({
  status: z.string().min(1),
});
