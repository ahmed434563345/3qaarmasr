-- Create compounds table
CREATE TABLE public.compounds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  location TEXT NOT NULL,
  logo_url TEXT,
  hero_image_url TEXT,
  gallery_images TEXT[] DEFAULT '{}'::TEXT[],
  features JSONB DEFAULT '[]'::JSONB,
  amenities TEXT[] DEFAULT '{}'::TEXT[],
  latitude NUMERIC,
  longitude NUMERIC,
  property_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Enable RLS
ALTER TABLE public.compounds ENABLE ROW LEVEL SECURITY;

-- Compounds are viewable by everyone
CREATE POLICY "Compounds are viewable by everyone" 
ON public.compounds 
FOR SELECT 
USING (true);

-- Admins can insert compounds
CREATE POLICY "Admins can insert compounds" 
ON public.compounds 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update compounds
CREATE POLICY "Admins can update compounds" 
ON public.compounds 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete compounds
CREATE POLICY "Admins can delete compounds" 
ON public.compounds 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));