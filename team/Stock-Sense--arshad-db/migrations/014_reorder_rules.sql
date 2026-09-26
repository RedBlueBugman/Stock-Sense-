CREATE TABLE IF NOT EXISTS public.reorder_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE RESTRICT,
    min_qty DECIMAL(15,4) NOT NULL,
    max_qty DECIMAL(15,4) NOT NULL,
    reorder_qty DECIMAL(15,4) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT reorder_rules_min_chk CHECK (min_qty >= 0),
    CONSTRAINT reorder_rules_max_chk CHECK (max_qty >= min_qty),
    CONSTRAINT reorder_rules_qty_chk CHECK (reorder_qty >= 0),
    CONSTRAINT reorder_rules_product_warehouse_unique UNIQUE (product_id, warehouse_id)
);
