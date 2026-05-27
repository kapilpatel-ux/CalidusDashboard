import { z } from "zod";

const supplierProductBaseSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  subcategory: z.string().min(1).optional(),
  price: z.string().optional(),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  specifications: z.array(z.string()).optional(),
  technicalSpecs: z.string().optional(),
  leadTime: z.string().optional(),
  countryOfOrigin: z.string().optional(),
  availability: z.string().optional(),
  dimensions: z.record(z.unknown()).optional(),
  certifications: z.array(z.string()).optional(),
  industryTags: z.array(z.string()).optional(),
  applicationUseCase: z.string().optional(),
  capabilities: z.array(z.string()).optional(),
  manufacturingCapabilities: z.array(z.string()).optional(),
  manufacturingDescription: z.string().max(300, "Description must be 300 characters or less").optional(),
  manufacturingImage: z.string().nullable().optional(),
  aiSummary: z.string().optional(),
  images: z.array(z.record(z.unknown())).optional(),
  primaryImageIndex: z.number().optional(),
  datasheet: z.record(z.unknown()).nullable().optional(),
  technicalDocs: z.array(z.record(z.unknown())).optional(),
  videoUrl: z.string().optional(),
  image: z.string().nullable().optional(),
});

export const createSupplierProductSchema = supplierProductBaseSchema.extend({
  name: z.string().min(1),
  category: z.string().min(1),
}).passthrough();

export const updateSupplierProductSchema = supplierProductBaseSchema.passthrough();
