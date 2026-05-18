import { Router } from "express";
import { validateBody } from "../../../middleware/validate.js";
import { createBuyerEnquiry, listBuyerEnquiries } from "./buyerEnquiry.controller.js";
import { createBuyerEnquirySchema } from "./buyerEnquiry.validation.js";

export const buyerEnquiryRoutes = Router();

buyerEnquiryRoutes.get("/:buyerId/enquiries", listBuyerEnquiries);
buyerEnquiryRoutes.post("/:buyerId/enquiries", validateBody(createBuyerEnquirySchema), createBuyerEnquiry);
