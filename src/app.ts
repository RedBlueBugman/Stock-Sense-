import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { AppError, handleDbError } from './shared/errorHandler';
import { sendError } from './shared/response';

// Route Modules
import productRoutes from './api/routes/product.routes';
import categoryRoutes from './api/routes/category.routes';
import warehouseRoutes from './api/routes/warehouse.routes';
import locationRoutes from './api/routes/location.routes';
import partnerRoutes from './api/routes/partner.routes';
import dashboardRoutes from './api/routes/dashboard.routes';
import userRoutes from './api/routes/user.routes';
import profileRoutes from './api/routes/profile.routes';
import settingsRoutes from './api/routes/settings.routes';
import searchRoutes from './api/routes/search.routes';

dotenv.config();

const app = express();

// Global Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'WMS Backend CRUD API (Member 3 - Data Layer)',
    timestamp: new Date().toISOString(),
  });
});

// Mounted Routes
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/warehouses', warehouseRoutes);
app.use('/api/v1/locations', locationRoutes);
app.use('/api/v1/partners', partnerRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1', searchRoutes);

// Global 404 Handler
app.use((req, res) => {
  return sendError(res, 'NOT_FOUND', `Route ${req.method} ${req.originalUrl} not found`, 404);
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof AppError) {
    return sendError(res, err.code, err.message, err.statusCode, err.details);
  }

  if (err && err.code && typeof err.code === 'string' && err.code.length === 5) {
    const dbAppError = handleDbError(err);
    return sendError(res, dbAppError.code, dbAppError.message, dbAppError.statusCode, dbAppError.details);
  }

  console.error('[Unhandled Server Exception]:', err);
  return sendError(res, 'INTERNAL_SERVER_ERROR', 'An unexpected internal server error occurred', 500);
});

export default app;
