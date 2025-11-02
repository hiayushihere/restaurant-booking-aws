import dotenv from "dotenv";
dotenv.config();

export const CONFIG = {
  PORT: process.env.PORT ? Number(process.env.PORT) : 4000,
  MONGO_URI: process.env.MONGO_URI || "",
  ADMIN_TOKEN: process.env.ADMIN_TOKEN || "changeme-admin",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "*"
};

if (!CONFIG.MONGO_URI) {
  console.error(" MONGO_URI missing in .env");
  process.exit(1);
}
