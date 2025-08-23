-- Create missing columns for subjects table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subjects' AND column_name='description') THEN
        ALTER TABLE public.subjects ADD COLUMN description TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subjects' AND column_name='updated_at') THEN
        ALTER TABLE public.subjects ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();
    END IF;
END $$;

-- Update classes table with missing columns
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='classes' AND column_name='grade_level') THEN
        ALTER TABLE public.classes ADD COLUMN grade_level INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='classes' AND column_name='section') THEN
        ALTER TABLE public.classes ADD COLUMN section TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='classes' AND column_name='class_teacher_id') THEN
        ALTER TABLE public.classes ADD COLUMN class_teacher_id UUID;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='classes' AND column_name='max_students') THEN
        ALTER TABLE public.classes ADD COLUMN max_students INTEGER DEFAULT 30;
    END IF;
END $$;

-- Update students table with missing columns
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='enrollment_date') THEN
        ALTER TABLE public.students ADD COLUMN enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='status') THEN
        ALTER TABLE public.students ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'graduated', 'transferred'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='guardian_relationship') THEN
        ALTER TABLE public.students ADD COLUMN guardian_relationship TEXT DEFAULT 'parent';
    END IF;
END $$;

-- Update teacher_assignments table with missing columns
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='teacher_assignments' AND column_name='assigned_date') THEN
        ALTER TABLE public.teacher_assignments ADD COLUMN assigned_date DATE NOT NULL DEFAULT CURRENT_DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='teacher_assignments' AND column_name='is_active') THEN
        ALTER TABLE public.teacher_assignments ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='teacher_assignments' AND column_name='updated_at') THEN
        ALTER TABLE public.teacher_assignments ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();
    END IF;
END $$;

-- Create subject_requests table
CREATE TABLE IF NOT EXISTS public.subject_requests (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_id UUID NOT NULL,
    subject_name TEXT NOT NULL,
    subject_code TEXT NOT NULL,
    description TEXT,
    justification TEXT,
    branch_id UUID NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_by UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security for subject_requests
ALTER TABLE public.subject_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for subject_requests using the existing user table structure
CREATE POLICY "Teachers can view their own subject requests" ON public.subject_requests
    FOR SELECT USING (
        teacher_id = auth.uid() OR
        auth.uid() IN (
            SELECT id FROM public.users 
            WHERE role IN ('admin', 'headmaster') 
            AND (role = 'admin' OR branch_id = subject_requests.branch_id)
        )
    );

CREATE POLICY "Teachers can create subject requests" ON public.subject_requests
    FOR INSERT WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Admins and headmasters can manage subject requests" ON public.subject_requests
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM public.users 
            WHERE role IN ('admin', 'headmaster') 
            AND (role = 'admin' OR branch_id = subject_requests.branch_id)
        )
    );

-- Create update triggers for new columns
CREATE TRIGGER update_subjects_updated_at
    BEFORE UPDATE ON public.subjects
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_teacher_assignments_updated_at
    BEFORE UPDATE ON public.teacher_assignments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subject_requests_updated_at
    BEFORE UPDATE ON public.subject_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add some sample teacher assignments for demo purposes
INSERT INTO public.teacher_assignments (teacher_id, subject_id, class_id, academic_year, branch_id) 
SELECT 
    u.id as teacher_id,
    s.id as subject_id,
    c.id as class_id,
    '2024-25' as academic_year,
    u.branch_id
FROM public.users u
CROSS JOIN public.subjects s
CROSS JOIN public.classes c
WHERE u.role = 'teacher' 
  AND u.branch_id = s.branch_id 
  AND u.branch_id = c.branch_id
LIMIT 10
ON CONFLICT (teacher_id, subject_id, class_id, academic_year) DO NOTHING;