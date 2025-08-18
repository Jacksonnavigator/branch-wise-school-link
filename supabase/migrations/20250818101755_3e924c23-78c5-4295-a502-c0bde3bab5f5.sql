-- Fix the search path for existing function  
ALTER FUNCTION public.get_user_role_and_branch(UUID) SET search_path = public;

-- Add remaining policies for academic_results, attendance, and behavior_records tables

-- Additional policies for academic_results
CREATE POLICY "Admin can manage all academic results" ON public.academic_results
  FOR ALL TO authenticated
  USING (
    (SELECT role FROM public.get_user_role_and_branch_safe(auth.uid())) = 'admin'
  );

CREATE POLICY "Headmaster can manage branch academic results" ON public.academic_results
  FOR ALL TO authenticated
  USING (
    (SELECT role FROM public.get_user_role_and_branch_safe(auth.uid())) = 'headmaster'
    AND branch_id = (SELECT branch_id FROM public.get_user_role_and_branch_safe(auth.uid()))
  );

-- Additional policies for attendance
CREATE POLICY "Admin can manage all attendance records" ON public.attendance
  FOR ALL TO authenticated
  USING (
    (SELECT role FROM public.get_user_role_and_branch_safe(auth.uid())) = 'admin'
  );

CREATE POLICY "Headmaster can manage branch attendance records" ON public.attendance
  FOR ALL TO authenticated
  USING (
    (SELECT role FROM public.get_user_role_and_branch_safe(auth.uid())) = 'headmaster'
    AND branch_id = (SELECT branch_id FROM public.get_user_role_and_branch_safe(auth.uid()))
  );

-- Additional policies for behavior_records
CREATE POLICY "Admin can manage all behavior records table" ON public.behavior_records
  FOR ALL TO authenticated
  USING (
    (SELECT role FROM public.get_user_role_and_branch_safe(auth.uid())) = 'admin'
  );

CREATE POLICY "Headmaster can manage branch behavior records table" ON public.behavior_records
  FOR ALL TO authenticated
  USING (
    (SELECT role FROM public.get_user_role_and_branch_safe(auth.uid())) = 'headmaster'
    AND branch_id = (SELECT branch_id FROM public.get_user_role_and_branch_safe(auth.uid()))
  );

-- Create triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to tables with updated_at columns
CREATE TRIGGER update_branches_updated_at
    BEFORE UPDATE ON public.branches
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_classes_updated_at
    BEFORE UPDATE ON public.classes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_students_updated_at
    BEFORE UPDATE ON public.students
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_academic_results_updated_at
    BEFORE UPDATE ON public.academic_results
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fee_payments_updated_at
    BEFORE UPDATE ON public.fee_payments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data to test the system
INSERT INTO public.branches (name, address, phone, email) VALUES
('Main Campus', '123 Education Street, City Center', '+1-555-0101', 'main@school.edu'),
('North Branch', '456 Learning Ave, North District', '+1-555-0102', 'north@school.edu'),
('South Campus', '789 Knowledge Blvd, South Area', '+1-555-0103', 'south@school.edu');