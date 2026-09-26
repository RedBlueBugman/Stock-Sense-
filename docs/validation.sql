-- Run after startup to verify the prototype database.

SELECT current_database(), current_user;

SELECT COUNT(*) AS products FROM public.products;
SELECT COUNT(*) AS warehouses FROM public.warehouses;
SELECT COUNT(*) AS locations FROM public.locations;
SELECT COUNT(*) AS operations FROM public.stock_operations;
SELECT COUNT(*) AS moves FROM public.stock_moves;

SELECT * FROM public.view_stock_quants ORDER BY product_name, location_name;
SELECT * FROM public.view_dashboard_kpis;

-- Immutability test: should fail.
-- UPDATE public.stock_moves
-- SET quantity = 999
-- WHERE id = '80000000-0000-0000-0000-000000000001';

-- State-machine test: should fail.
-- UPDATE public.stock_operations
-- SET status = 'done'
-- WHERE reference_code = 'DEL-0002';
