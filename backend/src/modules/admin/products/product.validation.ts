import { z } from "zod";

const productBaseSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  supplierId: z.string().min(1),
  supplierName: z.string().min(1),
  category: z.string().min(1),
  subcategory: z.string().default("General"),
  rating: z.number().default(0),
  status: z.string().default("pending"),
  price: z.string().default("RFQ"),
  description: z.string().default(""),
  shortDescription: z.string().default(""),
  specifications: z.array(z.string()).default([]),
  technicalSpecs: z.string().default(""),
  leadTime: z.string().default(""),
  countryOfOrigin: z.string().default(""),
  availability: z.string().default("in-stock"),
  dimensions: z.record(z.unknown()).default({}),
  certifications: z.array(z.string()).default([]),
  industryTags: z.array(z.string()).default([]),
  applicationUseCase: z.string().default(""),
  capabilities: z.array(z.string()).default([]),
  manufacturingCapabilities: z.array(z.string()).default([]),
  manufacturingDescription: z.string().max(300, "Description must be 300 characters or less").default(""),
  manufacturingImage: z.string().nullable().optional(),
  aiSummary: z.string().default(""),
  images: z.array(z.record(z.unknown())).default([]),
  primaryImageIndex: z.number().default(0),
  datasheet: z.record(z.unknown()).nullable().optional(),
  technicalDocs: z.array(z.record(z.unknown())).default([]),
  videoUrl: z.string().default(""),
  image: z.string().nullable().optional(),
});

export const createProductSchema = productBaseSchema.passthrough();
export const updateProductSchema = productBaseSchema.partial().passthrough();
export const productStatusSchema = z.object({ status: z.string().min(1) });
