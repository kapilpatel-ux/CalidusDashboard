import { Router } from "express";
import { validateBody } from "../../../middleware/validate.js";
import {
  listSupplierEnquiries,
  replyToSupplierEnquiry,
  updateSupplierEnquiryStatus,
} from "./supplierEnquiry.controller.js";
import { supplierEnquiryReplySchema, supplierEnquiryStatusSchema } from "./supplierEnquiry.validation.js";

export const supplierEnquiryRoutes = Router();

supplierEnquiryRoutes.get("/:supplierId/enquiries", listSupplierEnquiries);
supplierEnquiryRoutes.patch(
  "/:supplierId/enquiries/:enquiryId/reply",
  validateBody(supplierEnquiryReplySchema),
  replyToSupplierEnquiry,
);
supplierEnquiryRoutes.patch(
  "/:supplierId/enquiries/:enquiryId/status",
  validateBody(supplierEnquiryStatusSchema),
  updateSupplierEnquiryStatus,
);
