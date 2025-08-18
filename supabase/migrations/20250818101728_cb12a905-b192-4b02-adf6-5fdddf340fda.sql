-- Create new function with fixed search path
CREATE OR REPLACE FUNCTION public.get_user_role_and_branch_safe(user_id UUID)
RETURNS TABLE(role user_role, branch_id UUID)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT u.role, u.branch_id
  FROM public.users u
  WHERE u.id = user_id;
$$;

-- Complete RLS Policies for remaining tables - fee_structure
CREATE POLICY "Admin can view all fee structure" ON public.fee_structure
  FOR SELECT TO authenticated
  USING (
    (SELECT role FROM public.get_user_role_and_branch_safe(auth.uid())) = 'admin'
  );

CREATE POLICY "Branch staff can view their branch fee structure" ON public.fee_structure
  FOR SELECT TO authenticated
  USING (
    branch_id = (SELECT branch_id FROM public.get_user_role_and_branch_safe(auth.uid()))
  );

CREATE POLICY "Admin can manage all fee structure" ON public.fee_structure
  FOR ALL TO authenticated
  USING (
    (SELECT role FROM public.get_user_role_and_branch_safe(auth.uid())) = 'admin'
  );

CREATE POLICY "Headmaster can manage branch fee structure" ON public.fee_structure
  FOR ALL TO authenticated
  USING (
    (SELECT role FROM public.get_user_role_and_branch_safe(auth.uid())) = 'headmaster'
    AND branch_id = (SELECT branch_id FROM public.get_user_role_and_branch_safe(auth.uid()))
  );

-- RLS Policies for fee_payments table
CREATE POLICY "Admin can view all fee payments" ON public.fee_payments
  FOR SELECT TO authenticated
  USING (
    (SELECT role FROM public.get_user_role_and_branch_safe(auth.uid())) = 'admin'
  );

CREATE POLICY "Branch staff can view their branch fee payments" ON public.fee_payments
  FOR SELECT TO authenticated
  USING (
    branch_id = (SELECT branch_id FROM public.get_user_role_and_branch_safe(auth.uid()))
  );

CREATE POLICY "Parents can view their children fee payments" ON public.fee_payments
  FOR SELECT TO authenticated
  USING (
    student_id IN (
      SELECT id FROM public.students WHERE parent_id = auth.uid()
    )
  );

CREATE POLICY "Admin can manage all fee payments" ON public.fee_payments
  FOR ALL TO authenticated
  USING (
    (SELECT role FROM public.get_user_role_and_branch_safe(auth.uid())) = 'admin'
  );

CREATE POLICY "Headmaster can manage branch fee payments" ON public.fee_payments
  FOR ALL TO authenticated
  USING (
    (SELECT role FROM public.get_user_role_and_branch_safe(auth.uid())) = 'headmaster'
    AND branch_id = (SELECT branch_id FROM public.get_user_role_and_branch_safe(auth.uid()))
  );

CREATE POLICY "Teachers can manage fee payments for their students" ON public.fee_payments
  FOR ALL TO authenticated
  USING (
    (SELECT role FROM public.get_user_role_and_branch_safe(auth.uid())) = 'teacher'
    AND student_id IN (
      SELECT s.id 
      FROM public.students s
      JOIN public.teacher_assignments ta ON s.class_id = ta.class_id
      WHERE ta.teacher_id = auth.uid()
    )
  );

-- RLS Policies for medical_records table
CREATE POLICY "Admin can view all medical records" ON public.medical_records
  FOR SELECT TO authenticated
  USING (
    (SELECT role FROM public.get_user_role_and_branch_safe(auth.uid())) = 'admin'
  );

CREATE POLICY "Branch staff can view their branch medical records" ON public.medical_records
  FOR SELECT TO authenticated
  USING (
    branch_id = (SELECT branch_id FROM public.get_user_role_and_branch_safe(auth.uid()))
  );

CREATE POLICY "Parents can view their children medical records" ON public.medical_records
  FOR SELECT TO authenticated
  USING (
    student_id IN (
      SELECT id FROM public.students WHERE parent_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can view their students medical records" ON public.medical_records
  FOR SELECT TO authenticated
  USING (
    (SELECT role FROM public.get_user_role_and_branch_safe(auth.uid())) = 'teacher'
    AND student_id IN (
      SELECT s.id 
      FROM public.students s
      JOIN public.teacher_assignments ta ON s.class_id = ta.class_id
      WHERE ta.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Admin can manage all medical records" ON public.medical_records
  FOR ALL TO authenticated
  USING (
    (SELECT role FROM public.get_user_role_and_branch_safe(auth.uid())) = 'admin'
  );

CREATE POLICY "Headmaster can manage branch medical records" ON public.medical_records
  FOR ALL TO authenticated
  USING (
    (SELECT role FROM public.get_user_role_and_branch_safe(auth.uid())) = 'headmaster'
    AND branch_id = (SELECT branch_id FROM public.get_user_role_and_branch_safe(auth.uid()))
  );

CREATE POLICY "Teachers can manage medical records for their students" ON public.medical_records
  FOR ALL TO authenticated
  USING (
    (SELECT role FROM public.get_user_role_and_branch_safe(auth.uid())) = 'teacher'
    AND student_id IN (
      SELECT s.id 
      FROM public.students s
      JOIN public.teacher_assignments ta ON s.class_id = ta.class_id
      WHERE ta.teacher_id = auth.uid()
    )
  );

-- RLS Policies for notifications table
CREATE POLICY "Admin can view all notifications" ON public.notifications
  FOR SELECT TO authenticated
  USING (
    (SELECT role FROM public.get_user_role_and_branch_safe(auth.uid())) = 'admin'
  );

CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT TO authenticated
  USING (
    recipient_id = auth.uid()
  );

CREATE POLICY "Admin can manage all notifications" ON public.notifications
  FOR ALL TO authenticated
  USING (
    (SELECT role FROM public.get_user_role_and_branch_safe(auth.uid())) = 'admin'
  );

CREATE POLICY "Branch staff can manage their branch notifications" ON public.notifications
  FOR ALL TO authenticated
  USING (
    branch_id = (SELECT branch_id FROM public.get_user_role_and_branch_safe(auth.uid()))
  );

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE TO authenticated
  USING (
    recipient_id = auth.uid()
  );