CREATE TABLE IF NOT EXISTS public.stock_moves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_id UUID NOT NULL REFERENCES public.stock_operations(id) ON DELETE RESTRICT,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    lot_id UUID REFERENCES public.product_lots(id) ON DELETE RESTRICT,
    quantity DECIMAL(15,4) NOT NULL,
    unit_of_measure VARCHAR(30) NOT NULL,
    source_location_id UUID REFERENCES public.locations(id) ON DELETE RESTRICT,
    destination_location_id UUID REFERENCES public.locations(id) ON DELETE RESTRICT,
    status public.move_status NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT stock_moves_quantity_chk CHECK (quantity > 0),
    CONSTRAINT stock_moves_distinct_locations_chk CHECK (
        source_location_id IS NULL OR destination_location_id IS NULL
        OR source_location_id <> destination_location_id
    )
);
