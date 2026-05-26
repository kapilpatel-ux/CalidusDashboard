import { z } from "zod";
import { validatePhoneNumber } from "../../../utils/phoneValidation.js";

const normalizeCountry = (value: unknown) =>
  String(value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "");

const countryCodeByName = new Map([
  ["unitedarabemirates", "AE"],
  ["uae", "AE"],
  ["ae", "AE"],
  ["india", "IN"],
  ["in", "IN"],
  ["unitedkingdom", "GB"],
  ["uk", "GB"],
  ["gb", "GB"],
]);

const vatValidationRules: Record<string, { pattern: RegExp; message: string }> = {
  AE: {
    pattern: /^\d{15}$/,
    message: "UAE VAT/TRN must be exactly 15 digits",
  },
  IN: {
    pattern: /^[0-3][0-9][A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/,
    message: "India GSTIN must be 15 characters, e.g. 27ABCDE1234F1Z5",
  },
  GB: {
    pattern: /^(GB)?(\d{9}|\d{12})$/,
    message: "UK VAT must be 9 or 12 digits, optionally prefixed with GB",
  },
};

const getVatCountryCode = (country: unknown) => countryCodeByName.get(normalizeCountry(country)) || "";

const validateLicenseNumber = (value: unknown) => {
  const license = String(value || "").trim().toUpperCase();
  if (!license) return "";
  if (!/^[A-Z0-9/-]{5,30}$/.test(license)) {
    return "License number must be 5-30 characters and contain only letters, numbers, slash, and hyphen";
  }
  return "";
};

const validateVatNumber = (value: unknown, country: unknown) => {
  const vat = String(value || "").trim().toUpperCase().replace(/\s+/g, "");
  if (!vat) return "";
  if (!/^[A-Z0-9-]{5,20}$/.test(vat)) {
    return "VAT / Tax number must be 5-20 characters and contain only letters, numbers, and hyphen";
  }

  const rule = vatValidationRules[getVatCountryCode(country)];
  if (rule && !rule.pattern.test(vat)) return rule.message;
  return "";
};

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

const withSupplierPhoneValidation = <T extends z.ZodTypeAny>(schema: T) => schema.superRefine((data, ctx) => {
  if (data.phone !== undefined) {
    const phoneError = validatePhoneNumber(data.phone, data.country);
    if (phoneError) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: phoneError, path: ["phone"] });
    }
  }

  const licenseError = validateLicenseNumber(data.licenseNumber);
  if (licenseError) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: licenseError, path: ["licenseNumber"] });
  }

  const vatError = validateVatNumber(data.vatNumber, data.country);
  if (vatError) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: vatError, path: ["vatNumber"] });
  }
});

export const createSupplierSchema = withSupplierPhoneValidation(supplierBaseSchema.passthrough());
export const updateSupplierSchema = withSupplierPhoneValidation(supplierBaseSchema.partial().passthrough());
export const supplierStatusSchema = z.object({ status: z.string().min(1) });
