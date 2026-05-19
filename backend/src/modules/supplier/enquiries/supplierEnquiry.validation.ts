import { z } from "zod";

export const supplierEnquiryReplySchema = z.object({
  reply: z.string().trim().min(1, "Reply is required"),
});
