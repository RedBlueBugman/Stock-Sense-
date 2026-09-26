import { Request, Response, NextFunction } from 'express';
import { sendError } from '../../shared/response';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'INVENTORY_MANAGER' | 'VIEWER';
  assigned_warehouses: string[];
}

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const requireRole = (allowedRoles: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    // Fallback default dev user if auth token is not yet provided by Member 2
    if (!req.user) {
      req.user = {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Dev Admin',
        email: 'admin@wms.local',
        role: 'ADMIN',
        assigned_warehouses: [],
      };
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return sendError(res, 'FORBIDDEN', 'You do not have permission to access this resource', 403);
    }

    return next();
  };
};

export const requireWarehouseAccess = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    return next();
  };
};
