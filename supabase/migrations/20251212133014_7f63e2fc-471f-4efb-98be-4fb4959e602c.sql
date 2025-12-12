-- Add delete policy for stray_reports (owners can delete their own reports)
CREATE POLICY "Users can delete their own stray reports" 
ON public.stray_reports 
FOR DELETE 
USING (auth.uid() = user_id);