-- Create subjects table
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    branch_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create classes table
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    grade_level INTEGER,
    section TEXT,
    academic_year TEXT NOT NULL DEFAULT '2024-25',
    branch_id UUID NOT NULL,
    class_teacher_id UUID,
    max_students INTEGER DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create students table
CREATE TABLE IF NOT EXISTS public.students (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    admission_number TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    email TEXT,
    phone TEXT,
    address TEXT,
    guardian_name TEXT NOT NULL,
    guardian_phone TEXT NOT NULL,
    guardian_email TEXT,
    guardian_relationship TEXT DEFAULT 'parent',
    class_id UUID REFERENCES public.classes(id),
    branch_id UUID NOT NULL,
    enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'graduated', 'transferred')),
    profile_photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create teacher_assignments table (links teachers to subjects and classes)
CREATE TABLE IF NOT EXISTS public.teacher_assignments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_id UUID NOT NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    academic_year TEXT NOT NULL DEFAULT '2024-25',
    branch_id UUID NOT NULL,
    assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(teacher_id, subject_id, class_id, academic_year)
);

-- Create subject_requests table (for teachers to request new subjects)
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

-- Enable Row Level Security
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for subjects
CREATE POLICY "Users can view subjects in their branch" ON public.subjects
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM public.profiles 
            WHERE branch_id = subjects.branch_id
        )
    );

CREATE POLICY "Admins and headmasters can manage subjects" ON public.subjects
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM public.profiles 
            WHERE role IN ('admin', 'headmaster') 
            AND (role = 'admin' OR branch_id = subjects.branch_id)
        )
    );

-- Create RLS policies for classes
CREATE POLICY "Users can view classes in their branch" ON public.classes
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM public.profiles 
            WHERE branch_id = classes.branch_id
        )
    );

CREATE POLICY "Admins and headmasters can manage classes" ON public.classes
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM public.profiles 
            WHERE role IN ('admin', 'headmaster') 
            AND (role = 'admin' OR branch_id = classes.branch_id)
        )
    );

-- Create RLS policies for students
CREATE POLICY "Users can view students in their branch" ON public.students
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM public.profiles 
            WHERE branch_id = students.branch_id
        )
    );

CREATE POLICY "Admins and headmasters can manage students" ON public.students
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM public.profiles 
            WHERE role IN ('admin', 'headmaster') 
            AND (role = 'admin' OR branch_id = students.branch_id)
        )
    );

-- Create RLS policies for teacher_assignments
CREATE POLICY "Teachers can view their assignments" ON public.teacher_assignments
    FOR SELECT USING (
        teacher_id = auth.uid() OR
        auth.uid() IN (
            SELECT user_id FROM public.profiles 
            WHERE role IN ('admin', 'headmaster') 
            AND (role = 'admin' OR branch_id = teacher_assignments.branch_id)
        )
    );

CREATE POLICY "Admins and headmasters can manage teacher assignments" ON public.teacher_assignments
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM public.profiles 
            WHERE role IN ('admin', 'headmaster') 
            AND (role = 'admin' OR branch_id = teacher_assignments.branch_id)
        )
    );

-- Create RLS policies for subject_requests
CREATE POLICY "Teachers can view their own subject requests" ON public.subject_requests
    FOR SELECT USING (
        teacher_id = auth.uid() OR
        auth.uid() IN (
            SELECT user_id FROM public.profiles 
            WHERE role IN ('admin', 'headmaster') 
            AND (role = 'admin' OR branch_id = subject_requests.branch_id)
        )
    );

CREATE POLICY "Teachers can create subject requests" ON public.subject_requests
    FOR INSERT WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Admins and headmasters can manage subject requests" ON public.subject_requests
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM public.profiles 
            WHERE role IN ('admin', 'headmaster') 
            AND (role = 'admin' OR branch_id = subject_requests.branch_id)
        )
    );

-- Create update trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create update triggers
CREATE TRIGGER update_subjects_updated_at
    BEFORE UPDATE ON public.subjects
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

CREATE TRIGGER update_teacher_assignments_updated_at
    BEFORE UPDATE ON public.teacher_assignments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subject_requests_updated_at
    BEFORE UPDATE ON public.subject_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.subjects (name, code, description, branch_id) VALUES
('Mathematics', 'MATH101', 'Basic Mathematics', '11111111-1111-1111-1111-111111111111'),
('Physics', 'PHY101', 'Introduction to Physics', '11111111-1111-1111-1111-111111111111'),
('Chemistry', 'CHEM101', 'Basic Chemistry', '11111111-1111-1111-1111-111111111111'),
('English', 'ENG101', 'English Language and Literature', '11111111-1111-1111-1111-111111111111'),
('Biology', 'BIO101', 'Introduction to Biology', '11111111-1111-1111-1111-111111111111')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.classes (name, grade_level, section, branch_id) VALUES
('Grade 10A', 10, 'A', '11111111-1111-1111-1111-111111111111'),
('Grade 10B', 10, 'B', '11111111-1111-1111-1111-111111111111'),
('Grade 11A', 11, 'A', '11111111-1111-1111-1111-111111111111'),
('Grade 11B', 11, 'B', '11111111-1111-1111-1111-111111111111'),
('Grade 12A', 12, 'A', '11111111-1111-1111-1111-111111111111')
ON CONFLICT DO NOTHING;