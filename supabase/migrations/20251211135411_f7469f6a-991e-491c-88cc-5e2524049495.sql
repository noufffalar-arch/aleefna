-- Enable realtime for missing_reports and stray_reports tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.missing_reports;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stray_reports;