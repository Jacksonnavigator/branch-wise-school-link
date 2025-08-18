-- Fix the search path issue for the function
DROP FUNCTION public.get_user_role_and_branch(UUID);

CREATE OR REPLACE FUNCTION public.get_user_role_and_branch(user_id UUID)
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

-- RLS Policies for academic_results table
CREATE POLICY "Admin can view all results" ON public.academic_results
  FOR SELECT TO authenticated
  USING (
    (SELECT role FROM public.get_user_role_and_branch(auth.uid())) = 'admin'
  );

CREATE POLICY "Branch staff can view their branch results" ON public.academic_results
  FOR SELECT TO authenticated
  USING (
    branch_id = (SELECT branch_id FROM public.get_user_role_and_branch(auth.uid()))
  );

CREATE POLICY "Teachers can view their students results" ON public.academic_results
  FOR SELECT TO authenticated
  USING (
    teacher_id = auth.uid()
    OR (
      (SELECT role FROM public.get_user_role_and_branch(auth.uid())) = 'teacher'
      AND student_id IN (
        SELECT s.id 
        FROM public.students s
        JOIN public.teacher_assignments ta ON s.class_id = ta.class_id
        WHERE ta.teacher_id = auth.uid()
      )
    )
  );

CREATE POLICY "Parents can view their children results" ON public.academic_results
  FOR SELECT TO authenticated
  USING (
    student_id IN (
      SELECT id FROM public.students WHERE parent_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can manage results for their students" ON public.academic_results
  FOR ALL TO authenticated
  USING (
    teacher_id = auth.uid()
    OR (
      (SELECT role FROM public.get_user_role_and_branch(auth.uid())) = 'teacher'
      AND student_id IN (
        SELECT s.id 
        FROM public.students s
        JOIN public.teacher_assignments ta ON s.class_id = ta.class_id
        WHERE ta.teacher_id = auth.uid()
      )
    )
  );

CREATE POLICY "Admin can manage all results" ON public.academic_results
  FOR ALL TO authenticated
  USING (
    (SELECT role FROM public.get_user_role_and_branch(auth.uid())) = 'admin'
  );

CREATE POLICY "Headmaster can manage branch results" ON public.academic_results
  FOR ALL TO authenticated
  USING (
    (SELECT role FROM public.get_user_role_and_branch(auth.uid())) = 'headmaster'
    AND branch_id = (SELECT branch_id FROM public.get_user_role_and_branch(auth.uid()))
  );

-- RLS Policies for attendance table
CREATE POLICY "Admin can view all attendance" ON public.attendance
  FOR SELECT TO authenticated
  USING (
    (SELECT role FROM public.get_user_role_and_branch(auth.uid())) = 'admin'
  );

CREATE POLICY "Branch staff can view their branch attendance" ON public.attendance
  FOR SELECT TO authenticated
  USING (
    branch_id = (SELECT branch_id FROM public.get_user_role_and_branch(auth.uid()))
  );

CREATE POLICY "Teachers can view their students attendance" ON public.attendance
  FOR SELECT TO authenticated
  USING (
    teacher_id = auth.uid()
    OR (
      (SELECT role FROM public.get_user_role_and_branch(auth.uid())) = 'teacher'
      AND student_id IN (
        SELECT s.id 
        FROM public.students s
        JOIN public.teacher_assignments ta ON s.class_id = ta.class_id
        WHERE ta.teacher_id = auth.uid()
      )
    )
  );

CREATE POLICY "Parents can view their children attendance" ON public.attendance
  FOR SELECT TO authenticated
  USING (
    student_id IN (
      SELECT id FROM public.students WHERE parent_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can manage attendance for their students" ON public.attendance
  FOR ALL TO authenticated
  USING (
    teacher_id = auth.uid()
    OR (
      (SELECT role FROM public.get_user_role_and_branch(auth.uid())) = 'teacher'
      AND student_id IN (
        SELECT s.id 
        FROM public.students s
        JOIN public.teacher_assignments ta ON s.class_id = ta.class_id
        WHERE ta.teacher_id = auth.uid()
      )
    )
  );

CREATE POLICY "Admin can manage all attendance" ON public.attendance
  FOR ALL TO authenticated
  USING (
    (SELECT role FROM public.get_user_role_and_branch(auth.uid())) = 'admin'
  );

CREATE POLICY "Headmaster can manage branch attendance" ON public.attendance
  FOR ALL TO authenticated
  USING (
    (SELECT role FROM public.get_user_role_and_branch(auth.uid())) = 'headmaster'
    AND branch_id = (SELECT branch_id FROM public.get_user_role_and_branch(auth.uid()))
  );

-- RLS Policies for behavior_records table
CREATE POLICY "Admin can view all behavior records" ON public.behavior_records
  FOR SELECT TO authenticated
  USING (
    (SELECT role FROM public.get_user_role_and_branch(auth.uid())) = 'admin'
  );

CREATE POLICY "Branch staff can view their branch behavior records" ON public.behavior_records
  FOR SELECT TO authenticated
  USING (
    branch_id = (SELECT branch_id FROM public.get_user_role_and_branch(auth.uid()))
  );

CREATE POLICY "Teachers can view their students behavior records" ON public.behavior_records
  FOR SELECT TO authenticated
  USING (
    teacher_id = auth.uid()
    OR (
      (SELECT role FROM public.get_user_role_and_branch(auth.uid())) = 'teacher'
      AND student_id IN (
        SELECT s.id 
        FROM public.students s
        JOIN public.teacher_assignments ta ON s.class_id = ta.class_id
        WHERE ta.teacher_id = auth.uid()
      )
    )
  );

CREATE POLICY "Parents can view their children behavior records" ON public.behavior_records
  FOR SELECT TO authenticated
  USING (
    student_id IN (
      SELECT id FROM public.students WHERE parent_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can manage behavior records for their students" ON public.behavior_records
  FOR ALL TO authenticated
  USING (
    teacher_id = auth.uid()
    OR (
      (SELECT role FROM public.get_user_role_and_branch(auth.uid())) = 'teacher'
      AND student_id IN (
        SELECT s.id 
        FROM public.students s
        JOIN public.teacher_assignments ta ON s.class_id = ta.class_id
        WHERE ta.teacher_id = auth.uid()
      )
    )
  );

CREATE POLICY "Admin can manage all behavior records" ON public.behavior_records
  FOR ALL TO authenticated
  USING (
    (SELECT role FROM public.get_user_role_and_branch(auth.uid())) = 'admin'
  );

CREATE POLICY "Headmaster can manage branch behavior records" ON public.behavior_records
  FOR ALL TO authenticated
  USING (
    (SELECT role FROM public.get_user_role_and_branch(auth.uid())) = 'headmaster'
    AND branch_id = (SELECT branch_id FROM public.get_user_role_and_branch(auth.uid()))
  );