# StockSense Index Strategy

## Required indexes

### stock_moves
- `(product_id, destination_location_id, status)` — destination stock aggregation
- `(operation_id, status)` — operation/move lookup
- `(source_location_id, status)` — outgoing stock aggregation

### stock_operations
- `(status, operation_type, scheduled_date)` — dashboard and queue queries
- `(partner_id)` — partner operations
- `(assigned_to)` — user workload

### products
- unique `(sku)` — global SKU lookup
- unique `(barcode)` — barcode lookup
- `(category_id)` — category filtering

### locations
- `(warehouse_id, location_type)` — warehouse/location filtering

### stock_reservations
- `(product_id, location_id, status)` — available-stock calculation

### audit
- `(entity_type, entity_id, timestamp)` — audit history lookup

### Additional
- `product_lots(expiry_date)` — expiry monitoring
- `alerts(is_read, priority, created_at)` — dashboard alerts

## Query monitoring

For a PostgreSQL environment where extensions are permitted:

```sql
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
```

Recommended server setting:

```text
log_min_duration_statement = 500
```

Use:

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT ...
```

for the five slowest production queries before adding more indexes.
