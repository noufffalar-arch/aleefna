-- Create user roles enum
CREATE TYPE public.user_role AS ENUM ('owner', 'clinic', 'store', 'shelter', 'government');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT,
  role user_role NOT NULL DEFAULT 'owner',
  avatar_url TEXT,
  phone TEXT,
  preferred_language TEXT DEFAULT 'ar',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pets table
CREATE TABLE public.pets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  species TEXT NOT NULL,
  breed TEXT,
  gender TEXT,
  age TEXT,
  color TEXT,
  microchip_id TEXT,
  photo_url TEXT,
  vaccinations TEXT[],
  medical_notes TEXT,
  is_missing BOOLEAN DEFAULT false,
  is_for_adoption BOOLEAN DEFAULT false,
  health_status TEXT,
  is_vaccinated BOOLEAN DEFAULT false,
  is_neutered BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create missing_reports table
CREATE TABLE public.missing_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  last_seen_date TIMESTAMP WITH TIME ZONE NOT NULL,
  last_seen_location TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  description TEXT,
  contact_phone TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create stray_reports table
CREATE TABLE public.stray_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  animal_type TEXT NOT NULL,
  danger_level TEXT NOT NULL,
  location_text TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  photo_url TEXT,
  description TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create clinics table
CREATE TABLE public.clinics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  area TEXT,
  address TEXT,
  phone TEXT,
  services TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE SET NULL,
  service_type TEXT NOT NULL,
  service_price DECIMAL(10,2),
  doctor_name TEXT,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create adoption_requests table
CREATE TABLE public.adoption_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  adopter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  shelter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'new',
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create clinic_support_cases table
CREATE TABLE public.clinic_support_cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  shelter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE SET NULL,
  estimated_cost DECIMAL(10,2),
  notes TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missing_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stray_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adoption_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_support_cases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for pets
CREATE POLICY "Users can view their own pets" ON public.pets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view adoption pets" ON public.pets FOR SELECT USING (is_for_adoption = true);
CREATE POLICY "Users can insert their own pets" ON public.pets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own pets" ON public.pets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own pets" ON public.pets FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for missing_reports
CREATE POLICY "Anyone can view missing reports" ON public.missing_reports FOR SELECT USING (true);
CREATE POLICY "Users can insert their own reports" ON public.missing_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reports" ON public.missing_reports FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reports" ON public.missing_reports FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for stray_reports
CREATE POLICY "Anyone can view stray reports" ON public.stray_reports FOR SELECT USING (true);
CREATE POLICY "Users can insert stray reports" ON public.stray_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own stray reports" ON public.stray_reports FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for clinics (publicly readable)
CREATE POLICY "Anyone can view clinics" ON public.clinics FOR SELECT USING (true);

-- RLS Policies for appointments
CREATE POLICY "Users can view their own appointments" ON public.appointments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own appointments" ON public.appointments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own appointments" ON public.appointments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own appointments" ON public.appointments FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for adoption_requests
CREATE POLICY "Adopters can view their requests" ON public.adoption_requests FOR SELECT USING (auth.uid() = adopter_id);
CREATE POLICY "Shelters can view requests for their animals" ON public.adoption_requests FOR SELECT USING (auth.uid() = shelter_id);
CREATE POLICY "Users can insert adoption requests" ON public.adoption_requests FOR INSERT WITH CHECK (auth.uid() = adopter_id);
CREATE POLICY "Shelters can update adoption requests" ON public.adoption_requests FOR UPDATE USING (auth.uid() = shelter_id);

-- RLS Policies for clinic_support_cases
CREATE POLICY "Shelters can view their cases" ON public.clinic_support_cases FOR SELECT USING (auth.uid() = shelter_id);
CREATE POLICY "Shelters can insert cases" ON public.clinic_support_cases FOR INSERT WITH CHECK (auth.uid() = shelter_id);
CREATE POLICY "Shelters can update their cases" ON public.clinic_support_cases FOR UPDATE USING (auth.uid() = shelter_id);

-- Create function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    COALESCE((new.raw_user_meta_data ->> 'role')::user_role, 'owner')
  );
  RETURN new;
END;
$$;

-- Create trigger for new user profiles
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pets_updated_at BEFORE UPDATE ON public.pets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_missing_reports_updated_at BEFORE UPDATE ON public.missing_reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_stray_reports_updated_at BEFORE UPDATE ON public.stray_reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_adoption_requests_updated_at BEFORE UPDATE ON public.adoption_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_clinic_support_cases_updated_at BEFORE UPDATE ON public.clinic_support_cases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample clinics
INSERT INTO public.clinics (name, city, area, address, phone, services) VALUES
  ('عيادة الرحمة البيطرية', 'الدمام', 'الخالدية الشمالية', 'شارع الملك فهد', '0138234567', ARRAY['فحص عام', 'تطعيمات', 'جراحة', 'طوارئ']),
  ('مركز الحياة للحيوانات', 'الدمام', 'الشاطئ', 'شارع الأمير محمد', '0138345678', ARRAY['فحص عام', 'تطعيمات', 'عناية بالأسنان']),
  ('عيادة السلام البيطرية', 'الخبر', 'العليا', 'شارع الظهران', '0138456789', ARRAY['فحص عام', 'تطعيمات', 'جراحة', 'أشعة']);