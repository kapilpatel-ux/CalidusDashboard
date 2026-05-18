import { z } from "zod";

const subcategorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
}).passthrough();

const categoryBaseSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  subcategories: z.array(subcategorySchema).default([]),
  productCount: z.number().default(0),
});

export const createCategorySchema = categoryBaseSchema.passthrough();

export const updateCategorySchema = categoryBaseSchema
  .partial()
  .passthrough();

export const updateSubcategorySchema = subcategorySchema
  .partial()
  .passthrough();