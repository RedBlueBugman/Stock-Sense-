CREATE TABLE IF NOT EXISTS public.product_lots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    lot_number VARCHAR(100) NOT NULL,
    expiry_date DATE,
    manufactured_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT product_lots_product_lot_unique UNIQUE (product_id, lot_number),
    CONSTRAINT product_lots_dates_chk CHECK (
        expiry_date IS NULL OR manufactured_date IS NULL OR expiry_date >= manufactured_date
    )
);
