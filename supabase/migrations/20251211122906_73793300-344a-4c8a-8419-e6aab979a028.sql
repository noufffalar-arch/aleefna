
-- Add resolution fields to missing_reports table
ALTER TABLE public.missing_reports 
ADD COLUMN IF NOT EXISTS resolution_type text,
ADD COLUMN IF NOT EXISTS resolution_notes text,
ADD COLUMN IF NOT EXISTS resolved_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS resolved_by uuid;

-- Add comments for documentation
COMMENT ON COLUMN public.missing_reports.resolution_type IS 'Type of resolution: returned_to_owner, taken_to_clinic, taken_to_shelter';
COMMENT ON COLUMN public.missing_reports.resolution_notes IS 'Additional notes about the resolution';
COMMENT ON COLUMN public.missing_reports.resolved_at IS 'When the animal was found/resolved';
COMMENT ON COLUMN public.missing_reports.resolved_by IS 'User who marked the report as resolved';
