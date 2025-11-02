import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { CONFIG } from "./config";
import { apiLimiter } from "./middleware/rateLimit";
import { errorHandler } from "./middleware/error";

import tablesRouter from "./routes/tables";
import bookingsRouter from "./routes/bookings";

async function main() {
  await mongoose.connect(CONFIG.MONGO_URI);
  const app = express();

  app.use(helmet()); 
  app.use(cors({ origin: CONFIG.CORS_ORIGIN }));
  app.use(express.json());
  app.use(morgan("dev"));
  app.use("/api", apiLimiter);

  app.get("/", (_req, res) => res.json({ ok: true, name: "Restaurant Booking API" }));
  app.use("/api/tables", tablesRouter);
  app.use("/api/bookings", bookingsRouter);

  app.use(errorHandler);

  app.listen(CONFIG.PORT, () => {
    console.log(`🚀 API on http://localhost:${CONFIG.PORT}`);
  });
}

main().catch((e) => {
  console.error("Failed to start:", e);
  process.exit(1);
});
