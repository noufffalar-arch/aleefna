-- Allow admins to view all pets
CREATE POLICY "Admins can view all pets" 
ON public.pets 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));