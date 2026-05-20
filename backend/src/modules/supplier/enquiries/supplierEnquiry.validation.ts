import { z } from "zod";

export const supplierEnquiryReplySchema = z.object({
  reply: z.string().trim().min(1, "Reply is required"),
});

export const supplierEnquiryStatusSchema = z.object({
  status: z.enum(["pending", "replied", "resolved"]),
});
