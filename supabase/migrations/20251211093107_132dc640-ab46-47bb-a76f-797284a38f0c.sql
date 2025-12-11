-- Drop the insecure public access policy
DROP POLICY IF EXISTS "Anyone can view missing reports" ON missing_reports;

-- Create a new policy that requires authentication to view missing reports
CREATE POLICY "Authenticated users can view missing reports" 
ON missing_reports 
FOR SELECT 
TO authenticated
USING (true);