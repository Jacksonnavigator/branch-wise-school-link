-- Fix the search path for the update function
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;