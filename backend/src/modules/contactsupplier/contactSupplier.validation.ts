import { z } from "zod";

export const createContactSupplierSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  company: z.string().trim().min(1, "Company is required").optional(),
  supplierId: z.string().trim().min(1, "Supplier is required").optional(),
  supplierCompany: z.string().trim().min(1, "Supplier company is required"),
  email: z.string().trim().email("Valid email is required"),
  phone: z.string().trim().min(10, "Phone number is required").max(16, "Phone number is too long"),
  country: z.string().trim().min(1, "Country is required"),
  productId: z.string().trim().min(1, "Product is required").optional(),
  productName: z.string().trim().min(1, "Product is required").optional(),
  product: z.string().trim().min(1, "Product is required").optional(),
}).refine((data) => data.productName || data.product, {
  message: "Product is required",
  path: ["productName"],
});
