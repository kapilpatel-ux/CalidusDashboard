import cors from "cors";
import express from "express";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFoundHandler } from "./middleware/notFoundHandler.js";
import { analyticsRoutes } from "./modules/admin/analytics/analytics.routes.js";
import { buyerRoutes } from "./modules/admin/buyers/buyer.routes.js";
import { categoryRoutes } from "./modules/admin/categories/category.routes.js";
import { dashboardRoutes } from "./modules/admin/dashboard/dashboard.routes.js";
import { enquiryRoutes } from "./modules/admin/enquiries/enquiry.routes.js";
import { notificationRoutes } from "./modules/admin/notifications/notification.routes.js";
import { productRoutes } from "./modules/admin/products/product.routes.js";
import { ratingRoutes } from "./modules/admin/ratings/rating.routes.js";
import { statusRoutes } from "./modules/admin/status/status.routes.js";
import { supplierRoutes } from "./modules/admin/suppliers/supplier.routes.js";
import { userRoutes } from "./modules/admin/users/user.routes.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { buyerEnquiryRoutes } from "./modules/buyer/enquiries/buyerEnquiry.routes.js";
import { buyerProfileRoutes } from "./modules/buyer/profile/buyerProfile.routes.js";
import { buyerRatingRoutes } from "./modules/buyer/ratings/buyerRating.routes.js";
import { supplierOverviewRoutes } from "./modules/supplier/overview/supplierOverview.routes.js";
import { supplierProductRoutes } from "./modules/supplier/products/supplierProduct.routes.js";
import { supplierProfileRoutes } from "./modules/supplier/profile/supplierProfile.routes.js";

export const app = express();

app.use(cors({ credentials: true, origin: env.corsOrigins }));
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));

app.get("/api", (_req, res) => {
  res.json({ message: "Hello World" });
});

app.use("/api/auth", authRoutes);
app.use("/api/status", statusRoutes);
app.use("/api/suppliers", supplierOverviewRoutes);
app.use("/api/suppliers", supplierProductRoutes);
app.use("/api/suppliers", supplierProfileRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/products", productRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/buyers", buyerRoutes);
app.use("/api/buyers", buyerEnquiryRoutes);
app.use("/api/buyers", buyerProfileRoutes);
app.use("/api/buyers", buyerRatingRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/admin/dashboard", dashboardRoutes);
app.use("/api/admin/enquiries", enquiryRoutes);
app.use("/api/admin/notifications", notificationRoutes);
app.use("/api/admin/users", userRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
