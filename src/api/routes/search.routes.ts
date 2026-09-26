import { Router } from 'express';
import { searchController } from '../controllers/search.controller';
import { validateRequest } from '../middleware/validate';
import { globalSearchQuerySchema } from '../schemas/search.schema';

const router = Router();

// GET /api/v1/search?q=... - Global top-bar search
router.get(
  '/search',
  validateRequest({ query: globalSearchQuerySchema }),
  searchController.globalSearch
);

// GET /api/v1/units-of-measure - Static UoM list
router.get('/units-of-measure', searchController.getUnitsOfMeasure);

// GET /api/v1/references/operation-statuses - Status transition rules
router.get('/references/operation-statuses', searchController.getOperationStatuses);

// GET /api/v1/references/location-types - Supported location types
router.get('/references/location-types', searchController.getLocationTypes);

export default router;
