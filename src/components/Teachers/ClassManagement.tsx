import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  GraduationCap, 
  Search, 
  Users, 
  Calendar,
  BookOpen,
  Clock,
  School,
  ArrowRight,
  UserCheck,
  FileText,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';

interface Class {
  id: string;
  name: string;
  grade_level: number;
  section: string;
  student_count: number;
  subjects: string[];
  schedule: string;
  teacher_id: string;
  branch_id: string;
  created_at: string;
  class_teacher_id?: string;
  max_students?: number;
  academic_year: string;
}

interface Student {
  id: string;
  full_name: string;
  class_id: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

const ClassManagement = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.branch_id) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch teacher assignments to get classes
        const assignmentsQuery = query(
          collection(db, 'teacher_assignments'),
          where('teacher_id', '==', profile.id),
          where('branch_id', '==', profile.branch_id),
          where('is_active', '==', true)
        );
        const assignmentsSnapshot = await getDocs(assignmentsQuery);
        
        const classIds = new Set();
        const subjectIds = new Set();
        
        assignmentsSnapshot.docs.forEach(doc => {
          const data = doc.data();
          classIds.add(data.class_id);
          subjectIds.add(data.subject_id);
        });

        // Fetch classes
        if (classIds.size > 0) {
          const classesQuery = query(
            collection(db, 'classes'),
            where('branch_id', '==', profile.branch_id)
          );
          const classesSnapshot = await getDocs(classesQuery);
          const classesData = classesSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(cls => classIds.has(cls.id)) as Class[];

          // Fetch student counts for each class
          const classesWithCounts = await Promise.all(
            classesData.map(async (cls) => {
              const studentsQuery = query(
                collection(db, 'students'),
                where('class_id', '==', cls.id),
                where('status', '==', 'active')
              );
              const studentsSnapshot = await getDocs(studentsQuery);
              return {
                ...cls,
                student_count: studentsSnapshot.size
              };
            })
          );

          setClasses(classesWithCounts);
        }

        // Fetch subjects
        if (subjectIds.size > 0) {
          const subjectsQuery = query(
            collection(db, 'subjects'),
            where('branch_id', '==', profile.branch_id)
          );
          const subjectsSnapshot = await getDocs(subjectsQuery);
          const subjectsData = subjectsSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(sub => subjectIds.has(sub.id)) as Subject[];
          
          setSubjects(subjectsData);
        }

        // Fetch students for all classes
        const studentsQuery = query(
          collection(db, 'students'),
          where('branch_id', '==', profile.branch_id),
          where('status', '==', 'active')
        );
        const studentsSnapshot = await getDocs(studentsQuery);
        const studentsData = studentsSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }) as Student)
          .filter(student => Array.from(classIds).includes(student.class_id));
        
        setStudents(studentsData);

      } catch (error) {
        console.error('Error fetching classes:', error);
        toast({
          title: "Error",
          description: "Failed to load class data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [profile?.branch_id, profile?.id, toast]);

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.section?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalStudents = classes.reduce((sum, cls) => sum + cls.student_count, 0);
  const uniqueSubjects = new Set(subjects.map(s => s.name)).size;
  const weeklyHours = classes.length * 6; // Assuming 6 hours per class per week

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="animate-pulse">
          <div className="h-10 bg-muted rounded w-64 mb-4"></div>
          <div className="h-6 bg-muted rounded w-96"></div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-muted rounded-xl"></div>
            </div>
          ))}
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-64 bg-muted rounded-xl"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            My Classes
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage and monitor the classes you're assigned to teach
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search classes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-80 bg-background/50 backdrop-blur-sm border-muted-foreground/20 focus:border-primary/50"
            />
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden border-0 shadow-elegant hover:shadow-glow transition-all duration-300 group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/5"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Classes
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
              <School className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{classes.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active assignments</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-elegant hover:shadow-glow transition-all duration-300 group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-green-600/5"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Students
            </CardTitle>
            <div className="p-2 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
              <Users className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{totalStudents}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all classes</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-elegant hover:shadow-glow transition-all duration-300 group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-600/5"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Subjects Taught
            </CardTitle>
            <div className="p-2 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
              <BookOpen className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{uniqueSubjects}</div>
            <p className="text-xs text-muted-foreground mt-1">Different subjects</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-elegant hover:shadow-glow transition-all duration-300 group">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/5"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Weekly Hours
            </CardTitle>
            <div className="p-2 rounded-lg bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{weeklyHours}</div>
            <p className="text-xs text-muted-foreground mt-1">Teaching hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Classes Grid */}
      {filteredClasses.length === 0 ? (
        <Card className="border-dashed border-2 border-muted-foreground/25 bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <GraduationCap className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">No Classes Found</h3>
            <p className="text-muted-foreground max-w-md">
              {searchTerm 
                ? "No classes match your search criteria. Try adjusting your search terms." 
                : "You haven't been assigned any classes yet. Contact your headmaster for class assignments."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredClasses.map((cls, index) => {
            const classSubjects = subjects.filter(subject => 
              // This would need to be properly linked via assignments
              true // For now showing all subjects
            );
            const classStudents = students.filter(student => student.class_id === cls.id);
            
            return (
              <Card 
                key={cls.id} 
                className="group border-0 shadow-elegant hover:shadow-glow transition-all duration-300 transform hover:-translate-y-1 animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-300">
                        <GraduationCap className="h-7 w-7 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                          {cls.name}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          Grade {cls.grade_level} • Section {cls.section}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="gap-1 border-primary/20 text-primary bg-primary/5">
                      <Users className="h-3 w-3" />
                      {cls.student_count}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">{classSubjects.length}</p>
                        <p className="text-xs">Subjects</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">2024-25</p>
                        <p className="text-xs">Academic Year</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Class Capacity</span>
                      <span className="font-medium">
                        {cls.student_count}/{cls.max_students || 30}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(cls.student_count / (cls.max_students || 30)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="gap-1 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all group/btn"
                    >
                      <UserCheck className="h-3 w-3 group-hover/btn:scale-110 transition-transform" />
                      Attendance
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="gap-1 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all group/btn"
                    >
                      <BarChart3 className="h-3 w-3 group-hover/btn:scale-110 transition-transform" />
                      Results
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="gap-1 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all group/btn"
                    >
                      <FileText className="h-3 w-3 group-hover/btn:scale-110 transition-transform" />
                      Reports
                    </Button>
                  </div>

                  <Button 
                    className="w-full group/main bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    View Class Details
                    <ArrowRight className="ml-2 h-4 w-4 group-hover/main:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClassManagement;