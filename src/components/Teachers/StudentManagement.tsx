import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Search, 
  Eye, 
  Plus, 
  BookOpen, 
  Calendar,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Student {
  id: string;
  full_name: string;
  admission_number: string;
  profile_photo_url?: string;
  guardian_name: string;
  guardian_phone: string;
  guardian_email: string;
  class_id: string;
  branch_id: string;
  gender: string;
  date_of_birth: string;
}

interface Class {
  id: string;
  name: string;
}

const StudentManagement = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!profile?.branch_id) return;

      try {
        // Fetch classes in the teacher's branch
        const { data: classesData, error: classesError } = await supabase
          .from('classes')
          .select('*')
          .eq('branch_id', profile.branch_id)
          .order('name');

        if (classesError) throw classesError;
        setClasses(classesData || []);

        // Fetch students from teacher's assigned classes via teacher_assignments
        if (profile.id) {
          const { data: assignmentData, error: assignmentError } = await supabase
            .from('teacher_assignments')
            .select('class_id')
            .eq('teacher_id', profile.id)
            .eq('branch_id', profile.branch_id);

          if (assignmentError) throw assignmentError;

          const classIds = assignmentData?.map(assignment => assignment.class_id) || [];
          
          if (classIds.length > 0) {
            const { data: studentsData, error: studentsError } = await supabase
              .from('students')
              .select('*')
              .eq('branch_id', profile.branch_id)
              .in('class_id', classIds)
              .order('full_name');

            if (studentsError) throw studentsError;
            setStudents(studentsData || []);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load student data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [profile?.branch_id, profile?.id, toast]);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.admission_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.guardian_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'all' || student.class_id === selectedClass;
    return matchesSearch && matchesClass;
  });

  const getClassName = (classId: string) => {
    const cls = classes.find(c => c.id === classId);
    return cls?.name || 'Unknown Class';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-2"></div>
          <div className="h-4 bg-muted rounded w-48"></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-48 bg-muted rounded-xl"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Students</h2>
          <p className="text-muted-foreground">
            Manage students from your assigned classes
          </p>
        </div>
        <Button className="gap-2 button-hover">
          <Plus className="h-4 w-4" />
          Add Student Record
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="flex h-10 w-full sm:w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <option value="all">All Classes</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name}
            </option>
          ))}
        </select>
      </div>

      {filteredStudents.length === 0 ? (
        <Card className="border-dashed border-2 border-muted-foreground/25">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Students Found</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              {searchTerm || selectedClass !== 'all' 
                ? "No students match your current search criteria." 
                : "No students are assigned to your classes yet."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredStudents.map((student) => (
            <Card key={student.id} className="card-hover border-0 shadow-elegant">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={student.profile_photo_url} />
                      <AvatarFallback className="text-sm">
                        {student.full_name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{student.full_name}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {getClassName(student.class_id)}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline">{student.admission_number}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>Guardian: {student.guardian_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span>{student.guardian_phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{student.guardian_email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>DOB: {new Date(student.date_of_birth).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1 gap-1">
                    <Eye className="h-3 w-3" />
                    View Profile
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 gap-1">
                    <BookOpen className="h-3 w-3" />
                    Results
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentManagement;