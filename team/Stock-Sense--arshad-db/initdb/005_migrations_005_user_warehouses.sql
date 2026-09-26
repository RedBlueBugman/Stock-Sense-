CREATE TABLE IF NOT EXISTS public.user_warehouses (
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, warehouse_id)
);
