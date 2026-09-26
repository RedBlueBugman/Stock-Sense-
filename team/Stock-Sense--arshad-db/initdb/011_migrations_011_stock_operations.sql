CREATE TABLE IF NOT EXISTS public.stock_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_code VARCHAR(80) NOT NULL UNIQUE,
    operation_type public.operation_type NOT NULL,
    status public.operation_status NOT NULL DEFAULT 'draft',
    source_location_id UUID REFERENCES public.locations(id) ON DELETE RESTRICT,
    destination_location_id UUID REFERENCES public.locations(id) ON DELETE RESTRICT,
    partner_id UUID REFERENCES public.partners(id) ON DELETE RESTRICT,
    scheduled_date TIMESTAMPTZ,
    completed_date TIMESTAMPTZ,
    assigned_to UUID REFERENCES public.users(id) ON DELETE RESTRICT,
    approved_by UUID REFERENCES public.users(id) ON DELETE RESTRICT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT stock_operations_distinct_locations_chk CHECK (
        source_location_id IS NULL OR destination_location_id IS NULL
        OR source_location_id <> destination_location_id
    ),
    CONSTRAINT stock_operations_completed_date_chk CHECK (
        status <> 'done' OR completed_date IS NOT NULL
    )
);
