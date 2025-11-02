-- Create seller_inquiries table
CREATE TABLE IF NOT EXISTS public.seller_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  location TEXT NOT NULL,
  compound TEXT,
  property_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.seller_inquiries ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to submit seller inquiries
CREATE POLICY "Anyone can submit seller inquiries"
ON public.seller_inquiries
FOR INSERT
WITH CHECK (true);

-- Create policy for admins to view all seller inquiries
CREATE POLICY "Admins can view all seller inquiries"
ON public.seller_inquiries
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));