-- Add compound_id, launch_id, and categories to properties table
ALTER TABLE public.properties
ADD COLUMN compound_id uuid REFERENCES public.compounds(id) ON DELETE SET NULL,
ADD COLUMN launch_id uuid REFERENCES public.launches(id) ON DELETE SET NULL,
ADD COLUMN categories text[] DEFAULT '{}';

-- Add indexes for better query performance
CREATE INDEX idx_properties_compound_id ON public.properties(compound_id);
CREATE INDEX idx_properties_launch_id ON public.properties(launch_id);

-- Update property_count in compounds when a property is added/removed
CREATE OR REPLACE FUNCTION update_compound_property_count()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_compound_property_count_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.properties
FOR EACH ROW
EXECUTE FUNCTION update_compound_property_count();