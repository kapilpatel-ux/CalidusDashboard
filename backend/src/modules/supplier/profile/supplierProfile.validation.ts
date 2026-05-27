import { z } from "zod";
import { validatePhoneNumber } from "../../../utils/phoneValidation.js";

export const updateSupplierProfileSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(1).optional(),
  capabilities: z.array(z.string()).optional(),
  manufacturingCapabilities: z.array(z.string()).optional(),
  manufacturingDescription: z.string().max(300, "Manufacturing description must be 300 characters or less").optional(),
  manufacturingImage: z.string().nullable().optional(),
  certifications: z.array(z.string()).optional(),
  documents: z.array(z.record(z.unknown())).optional(),
}).passthrough().superRefine((data, ctx) => {
  if (!data.phone) return;
  const phoneError = validatePhoneNumber(data.phone, data.country);
  if (phoneError) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: phoneError, path: ["phone"] });
  }
});
