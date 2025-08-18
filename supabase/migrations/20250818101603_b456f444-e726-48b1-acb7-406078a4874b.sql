-- Create function to get user role and branch from users table
CREATE OR REPLACE FUNCTION public.get_user_role_and_branch(user_id UUID)
RETURNS TABLE(role user_role, branch_id UUID)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT u.role, u.branch_id
  FROM public.users u
  WHERE u.id = user_id;
$$;

-- RLS Policies for branches table
CREATE POLICY "Admin can view all branches" ON public.branches
  FOR SELECT TO authenticated
  USING (
    (SELECT role FROM public.get_user_role_and_branch(auth.uid())) = 'admin'
  );

CREATE POLICY "Branch staff can view their branch" ON public.branches
  FOR SELECT TO authenticated
  USING (
    id = (SELECT branch_id FROM public.get_user_role_and_branch(auth.uid()))
  );

CREATE POLICY "Admin can manage all branches" ON public.branches
  FOR ALL TO authenticated
  USING (
    (SELECT role FROM public.get_user_role_and_branch(auth.uid())) = 'admin'
  );

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Admin can view all users" ON public.users
  FOR SELECT TO authenticated
  USING (
    (SELECT role FROM public.get_user_role_and_branch(auth.uid())) = 'admin'
  );

CREATE POLICY "Headmaster can view branch users" ON public.users
  FOR SELECT TO authenticated
  USING (
    (SELECT role FROM public.get_user_role_and_branch(auth.uid())) = 'headmaster'
    AND branch_id = (SELECT branch_id FROM public.get_user_role_and_branch(auth.uid()))
  );

CREATE POLICY "Admin can manage all users" ON public.users
  FOR ALL TO authenticated
  USING (
    (SELECT role FROM public.get_user_role_and_branch(auth.uid())) = 'admin'
  );

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE TO authenticated
  USING (id = auth.uid());

-- RLS Policies for classes table
CREATE POLICY "Admin can view all classes" ON public.classes
  FOR SELECT TO authenticated
  USING (
    (SELECT role FROM public.get_user_role_and_branch(auth.uid())) = 'admin'
  );

CREATE POLICY "Branch staff can view their branch classes" ON public.classes
  FOR SELECT TO authenticated
  USING (
    branch_id = (SELECT branch_id FROM public.get_user_role_and_branch(auth.uid()))
  );

CREATE POLICY "Admin can manage all classes" ON public.classes
  FOR ALL TO authenticated
  USING (
    (SELECT role FROM public.get_user_role_and_branch(auth.uid())) = 'admin'
  );

CREATE POLICY "Headmaster can manage branch classes" ON public.classes
  FOR ALL TO authenticated
  USING (
    (SELECT role FROM public.get_user_role_and_branch(auth.uid())) = 'headmaster'
    AND branch_id = (SELECT branch_id FROM public.get_user_role_and_branch(auth.uid()))
  );

-- RLS Policies for subjects table
CREATE POLICY "Admin can view all subjects" ON public.subjects
  FOR SELECT TO authenticated
  USING (
    (SELECT role FROM public.get_user_role_and_branch(auth.uid())) = 'admin'
  );

CREATE POLICY "Branch staff can view their branch subjects" ON public.subjects
  FOR SELECT TO authenticated
  USING (
    branch_id = (SELECT branch_id FROM public.get_user_role_and_branch(auth.uid()))
  );

CREATE POLICY "Admin can manage all subjects" ON public.subjects
  FOR ALL TO authenticated
  USING (
    (SELECT role FROM public.get_user_role_and_branch(auth.uid())) = 'admin'
  );

CREATE POLICY "Headmaster can manage branch subjects" ON public.subjects
  FOR ALL TO authenticated
  USING (
    (SELECT role FROM public.get_user_role_and_branch(auth.uid())) = 'headmaster'
    AND branch_id = (SELECT branch_id FROM public.get_user_role_and_branch(auth.uid()))
  );

-- RLS Policies for students table
CREATE POLICY "Admin can view all students" ON public.students
  FOR SELECT TO authenticated
  USING (
    (SELECT role FROM public.get_user_role_and_branch(auth.uid())) = 'admin'
  );

CREATE POLICY "Branch staff can view their branch students" ON public.students
  FOR SELECT TO authenticated
  USING (
    branch_id = (SELECT branch_id FROM public.get_user_role_and_branch(auth.uid()))
  );

CREATE POLICY "Parents can view their children" ON public.students
  FOR SELECT TO authenticated
  USING (
    parent_id = auth.uid()
  );

CREATE POLICY "Teachers can view assigned students" ON public.students
  FOR SELECT TO authenticated
  USING (
    (SELECT role FROM public.get_user_role_and_branch(auth.uid())) = 'teacher'
    AND branch_id = (SELECT branch_id FROM public.get_user_role_and_branch(auth.uid()))
    AND id IN (
      SELECT DISTINCT ta.class_id
      FROM public.teacher_assignments ta
      WHERE ta.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Admin can manage all students" ON public.students
  FOR ALL TO authenticated
  USING (
    (SELECT role FROM public.get_user_role_and_branch(auth.uid())) = 'admin'
  );

CREATE POLICY "Headmaster can manage branch students" ON public.students
  FOR ALL TO authenticated
  USING (
    (SELECT role FROM public.get_user_role_and_branch(auth.uid())) = 'headmaster'
    AND branch_id = (SELECT branch_id FROM public.get_user_role_and_branch(auth.uid()))
  );

-- RLS Policies for teacher_assignments table
CREATE POLICY "Admin can view all assignments" ON public.teacher_assignments
  FOR SELECT TO authenticated
  USING (
    (SELECT role FROM public.get_user_role_and_branch(auth.uid())) = 'admin'
  );

CREATE POLICY "Branch staff can view their branch assignments" ON public.teacher_assignments
  FOR SELECT TO authenticated
  USING (
    branch_id = (SELECT branch_id FROM public.get_user_role_and_branch(auth.uid()))
  );

CREATE POLICY "Teachers can view their assignments" ON public.teacher_assignments
  FOR SELECT TO authenticated
  USING (
    teacher_id = auth.uid()
  );

CREATE POLICY "Admin can manage all assignments" ON public.teacher_assignments
  FOR ALL TO authenticated
  USING (
    (SELECT role FROM public.get_user_role_and_branch(auth.uid())) = 'admin'
  );

CREATE POLICY "Headmaster can manage branch assignments" ON public.teacher_assignments
  FOR ALL TO authenticated
  USING (
    (SELECT role FROM public.get_user_role_and_branch(auth.uid())) = 'headmaster'
    AND branch_id = (SELECT branch_id FROM public.get_user_role_and_branch(auth.uid()))
  );