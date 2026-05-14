import cors from "cors";
import express from "express";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFoundHandler } from "./middleware/notFoundHandler.js";
import { analyticsRoutes } from "./modules/analytics/analytics.routes.js";
import { buyerRoutes } from "./modules/buyers/buyer.routes.js";
import { categoryRoutes } from "./modules/categories/category.routes.js";
import { dashboardRoutes } from "./modules/dashboard/dashboard.routes.js";
import { productRoutes } from "./modules/products/product.routes.js";
import { ratingRoutes } from "./modules/ratings/rating.routes.js";
import { statusRoutes } from "./modules/status/status.routes.js";
import { supplierRoutes } from "./modules/suppliers/supplier.routes.js";

export const app = express();

app.use(cors({ credentials: true, origin: env.corsOrigins }));
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));

app.get("/api", (_req, res) => {
  res.json({ message: "Hello World" });
});

app.use("/api/status", statusRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/products", productRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/buyers", buyerRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/admin/dashboard", dashboardRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
