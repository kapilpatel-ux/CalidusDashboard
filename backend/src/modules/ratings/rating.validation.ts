import { z } from "zod";

export const createRatingSchema = z.object({ id: z.string().optional() }).passthrough();
export const updateRatingSchema = z.object({}).passthrough();
export const ratingStatusSchema = z.object({ status: z.string().min(1) });
