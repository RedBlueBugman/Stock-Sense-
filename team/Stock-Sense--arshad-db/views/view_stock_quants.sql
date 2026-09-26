CREATE OR REPLACE VIEW public.view_stock_quants AS
WITH completed_in AS (
    SELECT
        sm.product_id,
        sm.destination_location_id AS location_id,
        sm.lot_id,
        SUM(sm.quantity) AS qty_in
    FROM public.stock_moves sm
    WHERE sm.status = 'done'
      AND sm.destination_location_id IS NOT NULL
    GROUP BY sm.product_id, sm.destination_location_id, sm.lot_id
),
completed_out AS (
    SELECT
        sm.product_id,
        sm.source_location_id AS location_id,
        sm.lot_id,
        SUM(sm.quantity) AS qty_out
    FROM public.stock_moves sm
    WHERE sm.status = 'done'
      AND sm.source_location_id IS NOT NULL
    GROUP BY sm.product_id, sm.source_location_id, sm.lot_id
),
reserved AS (
    SELECT
        sr.product_id,
        sr.location_id,
        sr.lot_id,
        SUM(sr.quantity_reserved) AS qty_reserved
    FROM public.stock_reservations sr
    WHERE sr.status = 'active'
      AND (sr.expires_at IS NULL OR sr.expires_at > now())
    GROUP BY sr.product_id, sr.location_id, sr.lot_id
),
keys AS (
    SELECT product_id, location_id, lot_id FROM completed_in
    UNION
    SELECT product_id, location_id, lot_id FROM completed_out
    UNION
    SELECT product_id, location_id, lot_id FROM reserved
)
SELECT
    k.product_id,
    p.name AS product_name,
    p.sku,
    p.unit_of_measure,
    p.tracking_type,
    k.location_id,
    l.name AS location_name,
    l.warehouse_id,
    w.name AS warehouse_name,
    k.lot_id,
    pl.lot_number,
    pl.expiry_date,
    COALESCE(ci.qty_in, 0)::DECIMAL(15,4) AS quantity_in,
    COALESCE(co.qty_out, 0)::DECIMAL(15,4) AS quantity_out,
    COALESCE(r.qty_reserved, 0)::DECIMAL(15,4) AS quantity_reserved,
    (
        COALESCE(ci.qty_in, 0)
        - COALESCE(co.qty_out, 0)
    )::DECIMAL(15,4) AS quantity_on_hand,
    (
        COALESCE(ci.qty_in, 0)
        - COALESCE(co.qty_out, 0)
        - COALESCE(r.qty_reserved, 0)
    )::DECIMAL(15,4) AS quantity_available
FROM keys k
JOIN public.products p ON p.id = k.product_id
JOIN public.locations l ON l.id = k.location_id
JOIN public.warehouses w ON w.id = l.warehouse_id
LEFT JOIN public.product_lots pl ON pl.id = k.lot_id
LEFT JOIN completed_in ci
    ON ci.product_id = k.product_id
   AND ci.location_id = k.location_id
   AND ci.lot_id IS NOT DISTINCT FROM k.lot_id
LEFT JOIN completed_out co
    ON co.product_id = k.product_id
   AND co.location_id = k.location_id
   AND co.lot_id IS NOT DISTINCT FROM k.lot_id
LEFT JOIN reserved r
    ON r.product_id = k.product_id
   AND r.location_id = k.location_id
   AND r.lot_id IS NOT DISTINCT FROM k.lot_id;
