import { z } from "zod";

export const createBuyerRatingSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  rating: z.number().min(1).max(5),
  review: z.string().min(1, "Review is required"),
});

export const updateBuyerRatingSchema = z.object({
  rating: z.number().min(1).max(5),
  review: z.string().min(1, "Review is required"),
});
