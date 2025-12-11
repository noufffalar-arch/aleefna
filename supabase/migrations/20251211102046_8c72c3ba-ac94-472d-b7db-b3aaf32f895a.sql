-- Add logo_url and photo_url columns to clinics table
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS logo_url text;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS photo_url text;

-- Create storage bucket for clinic images
INSERT INTO storage.buckets (id, name, public)
VALUES ('clinic-images', 'clinic-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their clinic images
CREATE POLICY "Clinic owners can upload images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'clinic-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to update their clinic images
CREATE POLICY "Clinic owners can update their images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'clinic-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to delete their clinic images
CREATE POLICY "Clinic owners can delete their images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'clinic-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access to clinic images
CREATE POLICY "Anyone can view clinic images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'clinic-images');