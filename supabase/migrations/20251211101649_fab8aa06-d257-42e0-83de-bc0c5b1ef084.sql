-- Add user_id to clinics table to link clinic account to clinic data
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Add doctor_name column for the primary doctor
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS doctor_name text;

-- Add prices column for service prices
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS prices jsonb DEFAULT '{}';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_clinics_user_id ON public.clinics(user_id);

-- Add RLS policies for clinic owners to manage their clinics
CREATE POLICY "Clinic owners can update their clinic"
ON public.clinics
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Clinic owners can insert their clinic"
ON public.clinics
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow clinics to view appointments for their clinic
CREATE POLICY "Clinics can view their appointments"
ON public.appointments
FOR SELECT
USING (clinic_id IN (SELECT id FROM public.clinics WHERE user_id = auth.uid()));

-- Allow clinics to update appointment status
CREATE POLICY "Clinics can update appointment status"
ON public.appointments
FOR UPDATE
USING (clinic_id IN (SELECT id FROM public.clinics WHERE user_id = auth.uid()));