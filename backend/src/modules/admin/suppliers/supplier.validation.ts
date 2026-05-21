import { z } from "zod";

const supplierBaseSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  type: z.string().min(1),
  country: z.string().min(1),
  email: z.string().min(1),
  phone: z.string().min(1),
  contactPerson: z.string().optional(),
  businessType: z.string().optional(),
  calidusCluster: z.string().optional(),
  productAndServices: z.string().optional(),
  businessDescription: z.string().max(700).optional(),
  supplierCurrency: z.string().optional(),
  address: z.record(z.unknown()).nullable().optional(),
  licenseNumber: z.string().max(30).optional(),
  vatNumber: z.string().max(20).optional(),
  linkedIn: z.string().optional(),
  certifications: z.array(z.string()).default([]),
  status: z.string().default("pending"),
  joinDate: z.string().min(1),
  profileViews: z.number().default(0),
  totalEnquiries: z.number().default(0),
  image: z.string().nullable().optional(),
  productsCount: z.number().default(0),
  rating: z.number().default(0),
  documents: z.array(z.record(z.unknown())).default([]),
  documentStatus: z.string().default("active"),
});

export const createSupplierSchema = supplierBaseSchema.passthrough();
export const updateSupplierSchema = supplierBaseSchema.partial().passthrough();
export const supplierStatusSchema = z.object({ status: z.string().min(1) });
