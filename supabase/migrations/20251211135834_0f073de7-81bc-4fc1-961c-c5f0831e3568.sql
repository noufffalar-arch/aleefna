-- Create table for missing pet sightings/location updates
CREATE TABLE public.missing_report_sightings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  missing_report_id UUID NOT NULL REFERENCES public.missing_reports(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  location_text TEXT NOT NULL,
  description TEXT,
  photo_url TEXT,
  reported_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.missing_report_sightings ENABLE ROW LEVEL SECURITY;

-- Anyone can view sightings
CREATE POLICY "Anyone can view sightings"
ON public.missing_report_sightings
FOR SELECT
USING (true);

-- Authenticated users can report sightings
CREATE POLICY "Authenticated users can report sightings"
ON public.missing_report_sightings
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update their own sightings
CREATE POLICY "Users can update own sightings"
ON public.missing_report_sightings
FOR UPDATE
USING (auth.uid() = reported_by);

-- Users can delete their own sightings
CREATE POLICY "Users can delete own sightings"
ON public.missing_report_sightings
FOR DELETE
USING (auth.uid() = reported_by);

-- Enable realtime for sightings
ALTER PUBLICATION supabase_realtime ADD TABLE public.missing_report_sightings;

-- Create index for faster lookups
CREATE INDEX idx_sightings_report_id ON public.missing_report_sightings(missing_report_id);
CREATE INDEX idx_sightings_created_at ON public.missing_report_sightings(created_at DESC);