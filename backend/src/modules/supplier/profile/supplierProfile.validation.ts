import { z } from "zod";
import { validatePhoneNumber } from "../../../utils/phoneValidation.js";

export const updateSupplierProfileSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(1).optional(),
  certifications: z.array(z.string()).optional(),
  documents: z.array(z.record(z.unknown())).optional(),
}).passthrough().superRefine((data, ctx) => {
  if (!data.phone) return;
  const phoneError = validatePhoneNumber(data.phone, data.country);
  if (phoneError) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: phoneError, path: ["phone"] });
  }
});
