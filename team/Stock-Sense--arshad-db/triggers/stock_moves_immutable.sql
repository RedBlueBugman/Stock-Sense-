CREATE OR REPLACE FUNCTION public.prevent_stock_move_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    RAISE EXCEPTION 'stock_moves is an immutable ledger: UPDATE and DELETE are forbidden';
END;
$$;

DROP TRIGGER IF EXISTS trg_stock_moves_immutable ON public.stock_moves;
CREATE TRIGGER trg_stock_moves_immutable
BEFORE UPDATE OR DELETE ON public.stock_moves
FOR EACH ROW EXECUTE FUNCTION public.prevent_stock_move_mutation();
