import { z } from "zod";

export const enquiryStatusSchema = z.object({
  status: z.string().min(1),
});
