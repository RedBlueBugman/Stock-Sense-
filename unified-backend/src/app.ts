import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { AppError, handleDbError } from './shared/errorHandler';
import { sendError } from './shared/response';

// Routes
import productRoutes from './api/routes/product.routes';
import categoryRoutes from './api/routes/category.routes';
import warehouseRoutes from './api/routes/warehouse.routes';
import locationRoutes from './api/routes/location.routes';
import partnerRoutes from './api/routes/partner.routes';
import dashboardRoutes from './api/routes/dashboard.routes';
import userRoutes from './api/routes/user.routes';
import profileRoutes from './api/routes/profile.routes';
import searchRoutes from './api/routes/search.routes';
import operationRoutes from './api/routes/operation.routes';
import stockRoutes from './api/routes/stock.routes';

dotenv.config();
const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// Health
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'StockSense Unified API', timestamp: new Date().toISOString() }));

// CRUD Routes (Nithin)
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/warehouses', warehouseRoutes);
app.use('/api/v1/locations', locationRoutes);
app.use('/api/v1/partners', partnerRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1', searchRoutes);

// Core Ledger Routes (Ashish + New)
app.use('/api/v1/operations', operationRoutes);
app.use('/api/v1/stock', stockRoutes);

// 404
app.use((_req, res) => sendError(res, 'NOT_FOUND', 'Route not found', 404));

// Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof AppError) return sendError(res, err.code, err.message, err.statusCode, err.details);
  if (err?.code?.length === 5) { const e = handleDbError(err); return sendError(res, e.code, e.message, e.statusCode, e.details); }
  console.error('[Unhandled]:', err);
  return sendError(res, 'INTERNAL_ERROR', 'Unexpected error', 500);
});

export default app;
