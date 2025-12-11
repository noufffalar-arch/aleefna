-- Create doctors table
CREATE TABLE public.doctors (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  name text NOT NULL,
  specialization text,
  phone text,
  photo_url text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create available time slots table
CREATE TABLE public.appointment_slots (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id uuid NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  slot_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_booked boolean DEFAULT false,
  booked_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(doctor_id, slot_date, start_time)
);

-- Enable RLS
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_slots ENABLE ROW LEVEL SECURITY;

-- RLS policies for doctors
CREATE POLICY "Anyone can view doctors" ON public.doctors
FOR SELECT USING (true);

CREATE POLICY "Clinic owners can insert doctors" ON public.doctors
FOR INSERT WITH CHECK (
  clinic_id IN (SELECT id FROM clinics WHERE user_id = auth.uid())
);

CREATE POLICY "Clinic owners can update their doctors" ON public.doctors
FOR UPDATE USING (
  clinic_id IN (SELECT id FROM clinics WHERE user_id = auth.uid())
);

CREATE POLICY "Clinic owners can delete their doctors" ON public.doctors
FOR DELETE USING (
  clinic_id IN (SELECT id FROM clinics WHERE user_id = auth.uid())
);

-- RLS policies for appointment_slots
CREATE POLICY "Anyone can view available slots" ON public.appointment_slots
FOR SELECT USING (true);

CREATE POLICY "Clinic owners can insert slots" ON public.appointment_slots
FOR INSERT WITH CHECK (
  clinic_id IN (SELECT id FROM clinics WHERE user_id = auth.uid())
);

CREATE POLICY "Clinic owners can update slots" ON public.appointment_slots
FOR UPDATE USING (
  clinic_id IN (SELECT id FROM clinics WHERE user_id = auth.uid())
);

CREATE POLICY "Users can book slots" ON public.appointment_slots
FOR UPDATE USING (
  is_booked = false AND auth.uid() IS NOT NULL
);

CREATE POLICY "Clinic owners can delete slots" ON public.appointment_slots
FOR DELETE USING (
  clinic_id IN (SELECT id FROM clinics WHERE user_id = auth.uid())
);

-- Update appointments table to reference doctor
ALTER TABLE public.appointments ADD COLUMN doctor_id uuid REFERENCES public.doctors(id);

-- Triggers for updated_at
CREATE TRIGGER update_doctors_updated_at
BEFORE UPDATE ON public.doctors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointment_slots_updated_at
BEFORE UPDATE ON public.appointment_slots
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();