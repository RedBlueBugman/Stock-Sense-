CREATE INDEX IF NOT EXISTS idx_stock_moves_product_destination_status
    ON public.stock_moves (product_id, destination_location_id, status);

CREATE INDEX IF NOT EXISTS idx_stock_moves_operation_status
    ON public.stock_moves (operation_id, status);

CREATE INDEX IF NOT EXISTS idx_stock_operations_status_type_scheduled
    ON public.stock_operations (status, operation_type, scheduled_date);

CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products (sku);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON public.products (barcode);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category_id);

CREATE INDEX IF NOT EXISTS idx_locations_warehouse_type
    ON public.locations (warehouse_id, location_type);

CREATE INDEX IF NOT EXISTS idx_audit_log_entity_timestamp
    ON audit.audit_log (entity_type, entity_id, timestamp);

CREATE INDEX IF NOT EXISTS idx_stock_reservations_product_location_status
    ON public.stock_reservations (product_id, location_id, status);

CREATE INDEX IF NOT EXISTS idx_stock_moves_source_status
    ON public.stock_moves (source_location_id, status);

CREATE INDEX IF NOT EXISTS idx_stock_moves_destination_status
    ON public.stock_moves (destination_location_id, status);

CREATE INDEX IF NOT EXISTS idx_stock_operations_partner
    ON public.stock_operations (partner_id);

CREATE INDEX IF NOT EXISTS idx_stock_operations_assigned_to
    ON public.stock_operations (assigned_to);

CREATE INDEX IF NOT EXISTS idx_product_lots_expiry
    ON public.product_lots (expiry_date);

CREATE INDEX IF NOT EXISTS idx_alerts_unread_priority
    ON public.alerts (is_read, priority, created_at);
