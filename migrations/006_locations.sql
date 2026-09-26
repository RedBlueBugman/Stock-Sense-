CREATE TABLE IF NOT EXISTS public.locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE RESTRICT,
    parent_location_id UUID REFERENCES public.locations(id) ON DELETE RESTRICT,
    name VARCHAR(160) NOT NULL,
    barcode VARCHAR(100) UNIQUE,
    location_type public.location_type NOT NULL DEFAULT 'internal',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT locations_not_own_parent_chk CHECK (parent_location_id IS NULL OR parent_location_id <> id)
);
