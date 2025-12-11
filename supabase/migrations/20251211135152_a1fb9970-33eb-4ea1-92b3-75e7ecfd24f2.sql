-- Fix security definer views by recreating them with security_invoker = true
DROP VIEW IF EXISTS public.missing_reports_map;
DROP VIEW IF EXISTS public.stray_reports_map;

-- Recreate missing reports map view with security invoker
CREATE VIEW public.missing_reports_map 
WITH (security_invoker = true) AS
SELECT 
  mr.id,
  mr.pet_id,
  mr.last_seen_location,
  mr.last_seen_date,
  mr.latitude,
  mr.longitude,
  mr.description,
  mr.status,
  mr.created_at,
  p.name as pet_name,
  p.species as pet_species,
  p.photo_url as pet_photo_url
FROM public.missing_reports mr
LEFT JOIN public.pets p ON mr.pet_id = p.id
WHERE mr.status = 'active';

-- Recreate stray reports map view with security invoker
CREATE VIEW public.stray_reports_map 
WITH (security_invoker = true) AS
SELECT 
  id,
  animal_type,
  danger_level,
  location_text,
  latitude,
  longitude,
  description,
  photo_url,
  status,
  created_at
FROM public.stray_reports
WHERE status IN ('new', 'in_progress');

-- Grant access
GRANT SELECT ON public.missing_reports_map TO anon;
GRANT SELECT ON public.missing_reports_map TO authenticated;
GRANT SELECT ON public.stray_reports_map TO anon;
GRANT SELECT ON public.stray_reports_map TO authenticated;

-- Update RLS policy on missing_reports to allow public SELECT (needed for view)
DROP POLICY IF EXISTS "Anyone can view missing reports for map" ON public.missing_reports;
CREATE POLICY "Anyone can view missing reports for map" 
ON public.missing_reports 
FOR SELECT 
USING (true);

-- Add policy for pets to allow public viewing of adoption pets (needed for JOIN in view)
DROP POLICY IF EXISTS "Anyone can view pets for map" ON public.pets;
CREATE POLICY "Anyone can view pets for map" 
ON public.pets 
FOR SELECT 
USING (is_for_adoption = true OR is_missing = true);