
-- Add additional fields to stray_reports for clinic information
ALTER TABLE public.stray_reports 
ADD COLUMN IF NOT EXISTS taken_to_clinic boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS clinic_name text,
ADD COLUMN IF NOT EXISTS clinic_notes text,
ADD COLUMN IF NOT EXISTS rescue_date timestamp with time zone;

-- Add comment for documentation
COMMENT ON COLUMN public.stray_reports.taken_to_clinic IS 'Whether the animal was taken to a clinic';
COMMENT ON COLUMN public.stray_reports.clinic_name IS 'Name of the clinic where the animal was taken';
COMMENT ON COLUMN public.stray_reports.clinic_notes IS 'Notes about the animal condition and treatment';
COMMENT ON COLUMN public.stray_reports.rescue_date IS 'Date when the animal was rescued/taken to clinic';
