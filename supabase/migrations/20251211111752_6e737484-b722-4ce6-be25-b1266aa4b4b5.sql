
-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Users can book slots" ON public.appointment_slots;

-- Create a proper policy that allows authenticated users to book available slots
CREATE POLICY "Users can book slots" 
ON public.appointment_slots 
FOR UPDATE 
TO authenticated
USING (is_booked = false)
WITH CHECK (is_booked = true AND booked_by = auth.uid());
