import { z } from "zod";
import { validatePhoneNumber } from "../../../utils/phoneValidation.js";

export const updateBuyerProfileSchema = z.object({
  name: z.string().min(1).optional(),
  company: z.string().min(1).optional(),
  email: z.string().email().optional(),
  country: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
}).passthrough().superRefine((data, ctx) => {
  if (!data.phone) return;
  const phoneError = validatePhoneNumber(data.phone, data.country);
  if (phoneError) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: phoneError, path: ["phone"] });
  }
});
