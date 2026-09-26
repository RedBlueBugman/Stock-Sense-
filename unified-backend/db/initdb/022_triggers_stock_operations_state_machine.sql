CREATE OR REPLACE FUNCTION public.validate_stock_operation_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.status = OLD.status THEN
        RETURN NEW;
    END IF;

    IF OLD.status = 'done' THEN
        RAISE EXCEPTION 'Completed operation % cannot change state', OLD.reference_code;
    END IF;

    IF NEW.status = 'cancelled' THEN
        RETURN NEW;
    END IF;

    IF OLD.status = 'draft' AND NEW.status = 'waiting' THEN
        RETURN NEW;
    ELSIF OLD.status = 'waiting' AND NEW.status = 'ready' THEN
        RETURN NEW;
    ELSIF OLD.status = 'ready' AND NEW.status = 'done' THEN
        RETURN NEW;
    ELSE
        RAISE EXCEPTION
            'Invalid stock operation transition: % -> %',
            OLD.status, NEW.status;
    END IF;
END;
$$;

DROP TRIGGER IF EXISTS trg_stock_operations_state_machine ON public.stock_operations;
CREATE TRIGGER trg_stock_operations_state_machine
BEFORE UPDATE OF status ON public.stock_operations
FOR EACH ROW EXECUTE FUNCTION public.validate_stock_operation_transition();
