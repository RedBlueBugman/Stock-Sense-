CREATE OR REPLACE VIEW public.view_dashboard_kpis AS
SELECT
    (SELECT COUNT(*) FROM public.products WHERE is_active) AS total_products,

    (
        SELECT COUNT(*)
        FROM (
            SELECT p.id, COALESCE(SUM(v.quantity_available), 0) AS available_qty
            FROM public.products p
            LEFT JOIN public.view_stock_quants v ON v.product_id = p.id
            WHERE p.is_active
            GROUP BY p.id
        ) s
        JOIN public.products p ON p.id = s.id
        WHERE s.available_qty <= p.reorder_min
          AND s.available_qty > 0
    ) AS low_stock_count,

    (
        SELECT COUNT(*)
        FROM (
            SELECT p.id, COALESCE(SUM(v.quantity_available), 0) AS available_qty
            FROM public.products p
            LEFT JOIN public.view_stock_quants v ON v.product_id = p.id
            WHERE p.is_active
            GROUP BY p.id
        ) s
        WHERE s.available_qty <= 0
    ) AS out_of_stock_count,

    (
        SELECT COUNT(*)
        FROM public.stock_operations
        WHERE operation_type = 'receipt'
          AND status IN ('waiting','ready')
    ) AS pending_receipts,

    (
        SELECT COUNT(*)
        FROM public.stock_operations
        WHERE operation_type = 'delivery'
          AND status IN ('waiting','ready')
    ) AS pending_deliveries,

    (
        SELECT COUNT(*)
        FROM public.stock_operations
        WHERE operation_type = 'internal'
          AND status IN ('waiting','ready')
    ) AS scheduled_transfers,

    (
        SELECT COUNT(*)
        FROM public.stock_operations
        WHERE status = 'draft'
    ) AS draft_operations,

    (
        SELECT COUNT(*)
        FROM public.alerts
        WHERE is_read = FALSE
    ) AS unread_alerts,

    (
        SELECT COALESCE(SUM(quantity_available),0)
        FROM public.view_stock_quants
    )::DECIMAL(20,4) AS total_available_units;
