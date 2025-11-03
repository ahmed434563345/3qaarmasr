-- Fix search_path for update_compound_property_count function
CREATE OR REPLACE FUNCTION public.update_compound_property_count()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.compound_id IS NOT NULL THEN
    UPDATE public.compounds
    SET property_count = property_count + 1
    WHERE id = NEW.compound_id;
  ELSIF TG_OP = 'DELETE' AND OLD.compound_id IS NOT NULL THEN
    UPDATE public.compounds
    SET property_count = property_count - 1
    WHERE id = OLD.compound_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.compound_id IS DISTINCT FROM NEW.compound_id THEN
      IF OLD.compound_id IS NOT NULL THEN
        UPDATE public.compounds
        SET property_count = property_count - 1
        WHERE id = OLD.compound_id;
      END IF;
      IF NEW.compound_id IS NOT NULL THEN
        UPDATE public.compounds
        SET property_count = property_count + 1
        WHERE id = NEW.compound_id;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;