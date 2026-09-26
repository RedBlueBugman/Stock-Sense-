import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";

import authRoutes from "./routes/auth.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import productRoutes from "./routes/product.routes";
import warehouseRoutes from "./routes/warehouse.routes";
import locationRoutes from "./routes/location.routes";
import partnerRoutes from "./routes/partner.routes";
import operationRoutes from "./routes/operation.routes";
import stockRoutes from "./routes/stock.routes";

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: "*", credentials: true }));
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));

// Root Route
app.get("/", (_req, res) => {
  res.json({
    status: "online",
    name: "StockSense IMS API",
    version: "1.0.0",
    engine: "Double-Entry Immutable Stock Ledger (SQLite)",
    timestamp: new Date().toISOString(),
  });
});

// Health check
app.get("/api/v1/health", (_req, res) => {
  res.json({ status: "ok", service: "StockSense API", timestamp: new Date().toISOString() });
});

// Mount All API Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/warehouses", warehouseRoutes);
app.use("/api/v1/locations", locationRoutes);
app.use("/api/v1/partners", partnerRoutes);
app.use("/api/v1/operations", operationRoutes);
app.use("/api/v1/stock", stockRoutes);

// Global Error Handler
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`🚀 StockSense API running on http://localhost:${env.PORT}`);
});

export default app;