import dotenv from "dotenv";

dotenv.config();

const required = (key: string) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing env variable: ${key}`);
  }
  return value;
};

export const env = {
  mongoUrl: required("MONGO_URL"),
  dbName: process.env.DB_NAME || "calidus_dashboard",
  port: Number(process.env.PORT || 8000),
  jwtSecret: process.env.JWT_SECRET || "calidus-dashboard-dev-secret",
  corsOrigins: (process.env.CORS_ORIGINS || "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
};
