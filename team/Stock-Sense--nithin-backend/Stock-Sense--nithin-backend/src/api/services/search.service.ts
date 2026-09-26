import { query } from '../../shared/db';
import { getOrSetCache } from '../../shared/redis';

export class SearchService {
  /**
   * Global Search across products, partners, and locations (5 items each)
   */
  async globalSearch(searchTerm: string) {
    const term = `%${searchTerm}%`;

    try {
      const [productsRes, partnersRes, locationsRes] = await Promise.all([
        // Search Products
        query(
          `SELECT id, name, sku, barcode, 'product' AS entity_type 
           FROM products 
           WHERE is_active = true AND (name ILIKE $1 OR sku ILIKE $1 OR barcode ILIKE $1) 
           LIMIT 5;`,
          [term]
        ).catch(() => ({ rows: [] })),

        // Search Partners
        query(
          `SELECT id, name, type, email, 'partner' AS entity_type 
           FROM partners 
           WHERE is_active = true AND name ILIKE $1 
           LIMIT 5;`,
          [term]
        ).catch(() => ({ rows: [] })),

        // Search Locations
        query(
          `SELECT l.id, l.name, l.barcode, l.location_type, w.name AS warehouse_name, 'location' AS entity_type 
           FROM locations l
           LEFT JOIN warehouses w ON w.id = l.warehouse_id
           WHERE l.is_active = true AND (l.name ILIKE $1 OR l.barcode ILIKE $1) 
           LIMIT 5;`,
          [term]
        ).catch(() => ({ rows: [] })),
      ]);

      return {
        products: productsRes.rows,
        partners: partnersRes.rows,
        locations: locationsRes.rows,
      };
    } catch (err) {
      return { products: [], partners: [], locations: [] };
    }
  }

  /**
   * Units of Measure reference list (Cached for 1 hour)
   */
  async getUnitsOfMeasure() {
    return getOrSetCache('ref:units_of_measure', 3600, async () => {
      return [
        { code: 'pcs', name: 'Pieces', type: 'unit' },
        { code: 'kg', name: 'Kilograms', type: 'weight' },
        { code: 'g', name: 'Grams', type: 'weight' },
        { code: 'l', name: 'Liters', type: 'volume' },
        { code: 'ml', name: 'Milliliters', type: 'volume' },
        { code: 'm', name: 'Meters', type: 'length' },
        { code: 'box', name: 'Boxes', type: 'packaging' },
        { code: 'pallet', name: 'Pallets', type: 'packaging' },
      ];
    });
  }

  /**
   * Allowed status transitions for frontend buttons
   */
  async getOperationStatuses() {
    return getOrSetCache('ref:operation_statuses', 3600, async () => {
      return {
        statuses: ['draft', 'waiting', 'ready', 'done', 'cancelled'],
        allowed_transitions: {
          draft: ['waiting', 'cancelled'],
          waiting: ['ready', 'cancelled'],
          ready: ['done', 'cancelled'],
          done: [],
          cancelled: [],
        },
      };
    });
  }

  /**
   * Supported location types reference
   */
  async getLocationTypes() {
    return getOrSetCache('ref:location_types', 3600, async () => {
      return [
        { code: 'internal', name: 'Internal Physical Storage', user_creatable: true },
        { code: 'vendor', name: 'Vendor / Supplier Location', user_creatable: false },
        { code: 'customer', name: 'Customer Destination Location', user_creatable: false },
        { code: 'inventory_loss', name: 'Inventory Loss / Adjustment', user_creatable: false },
        { code: 'transit', name: 'Inter-Warehouse Transit Location', user_creatable: false },
      ];
    });
  }
}

export const searchService = new SearchService();
