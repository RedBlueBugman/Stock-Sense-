CREATE TABLE IF NOT EXISTS public.stock_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE RESTRICT,
    lot_id UUID REFERENCES public.product_lots(id) ON DELETE RESTRICT,
    quantity_reserved DECIMAL(15,4) NOT NULL,
    operation_id UUID NOT NULL REFERENCES public.stock_operations(id) ON DELETE RESTRICT,
    reserved_by UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    reserved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ,
    status public.reservation_status NOT NULL DEFAULT 'active',
    CONSTRAINT stock_reservations_quantity_chk CHECK (quantity_reserved > 0),
    CONSTRAINT stock_reservations_expiry_chk CHECK (
        expires_at IS NULL OR expires_at >= reserved_at
    )
);
