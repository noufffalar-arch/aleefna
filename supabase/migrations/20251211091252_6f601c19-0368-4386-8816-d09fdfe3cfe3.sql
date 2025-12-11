-- Allow admins to view all stray reports (already public, but adding for completeness)
CREATE POLICY "Admins can manage stray reports" 
ON public.stray_reports 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));