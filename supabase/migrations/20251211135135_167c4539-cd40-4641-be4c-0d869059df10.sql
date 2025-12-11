-- Create a public view for missing reports map (without phone numbers)
CREATE OR REPLACE VIEW public.missing_reports_map AS
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

-- Grant access to the view for anonymous users
GRANT SELECT ON public.missing_reports_map TO anon;
GRANT SELECT ON public.missing_reports_map TO authenticated;

-- Create a public view for stray reports map (already public but let's be explicit)
CREATE OR REPLACE VIEW public.stray_reports_map AS
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

-- Grant access to the stray reports view
GRANT SELECT ON public.stray_reports_map TO anon;
GRANT SELECT ON public.stray_reports_map TO authenticated;