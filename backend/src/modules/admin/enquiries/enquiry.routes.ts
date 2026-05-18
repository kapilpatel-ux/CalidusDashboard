import { Router } from "express";
import { validateBody } from "../../../middleware/validate.js";
import { listEnquiries, updateEnquiryStatus } from "./enquiry.controller.js";
import { enquiryStatusSchema } from "./enquiry.validation.js";

export const enquiryRoutes = Router();

enquiryRoutes.get("/", listEnquiries);
enquiryRoutes.patch("/:enquiryId/status", validateBody(enquiryStatusSchema), updateEnquiryStatus);
