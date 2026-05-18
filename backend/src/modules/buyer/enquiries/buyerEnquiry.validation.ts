import { z } from "zod";

export const createBuyerEnquirySchema = z.object({
  productId: z.string().min(1, "Product is required"),
  message: z.string().min(1, "Message is required"),
});
