import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  GraduationCap,
  ClipboardCheck,
  TrendingUp,
  UserCheck,
  Target,
  Award,
  Clock,
  FileText
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface Student {
  id: string;
  admission_number: string;
  full_name: string;
  date_of_birth: string;
  gender: string;
  email?: string;
  phone?: string;
  guardian_name?: string;
  guardian_phone?: string;
  guardian_email?: string;
  class_id: string;
  branch_id: string;
  profile_photo_url?: string;
  status: string;
}

interface Class {
  id: string;
  name: string;
  grade_level?: number;
  section?: string;
  academic_year: string;
  max_students: number;
}

interface Subject {
  id: string;
  name: string;
  code?: string;
}

interface TeacherAssignment {
  id: string;
  teacher_id: string;
  subject_id: string;
  class_id: string;
  academic_year: string;
  subjects?: Subject;
  classes?: Class;
}

const ClassManagement = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [myClasses, setMyClasses] = useState<Class[]>([]);
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClasses: 0,
    attendanceRate: 95,
    avgPerformance: 78
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!profile?.id || !profile?.branch_id) return;

      try {
        // Fetch teacher assignments with subject and class details
        const { data: assignmentsData, error: assignmentsError } = await supabase
          .from('teacher_assignments')
          .select(`
            *,
            subjects:subject_id (id, name, code),
            classes:class_id (id, name, grade_level, section, academic_year, max_students)
          `)
          .eq('teacher_id', profile.id)
          .eq('branch_id', profile.branch_id)
          .eq('is_active', true);

        if (assignmentsError) throw assignmentsError;
        setAssignments(assignmentsData || []);

        // Extract unique classes from assignments
        const uniqueClasses = assignmentsData?.reduce((acc: Class[], assignment: any) => {
          const classData = assignment.classes;
          if (classData && !acc.find(c => c.id === classData.id)) {
            acc.push(classData);
          }
          return acc;
        }, []) || [];
        
        setMyClasses(uniqueClasses);

        // Fetch students from assigned classes
        const classIds = uniqueClasses.map(cls => cls.id);
        if (classIds.length > 0) {
          const { data: studentsData, error: studentsError } = await supabase
            .from('students')
            .select('*')
            .eq('branch_id', profile.branch_id)
            .in('class_id', classIds)
            .eq('status', 'active')
            .order('full_name');

          if (studentsError) throw studentsError;
          setStudents(studentsData || []);

          // Calculate stats
          setStats({
            totalStudents: studentsData?.length || 0,
            totalClasses: uniqueClasses.length,
            attendanceRate: Math.floor(Math.random() * 10) + 90, // Mock data
            avgPerformance: Math.floor(Math.random() * 20) + 70  // Mock data
          });
        }

      } catch (error) {
        console.error('Error fetching data:', error);
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
  }, [profile?.id, profile?.branch_id, toast]);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.admission_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.guardian_name?.toLowerCase().includes(searchTerm.toLowerCase()) || '';
    const matchesClass = selectedClass === 'all' || student.class_id === selectedClass;
    return matchesSearch && matchesClass;
  });

  const getClassName = (classId: string) => {
    const cls = myClasses.find(c => c.id === classId);
    return cls?.name || 'Unknown Class';
  };

  const getSubjectsForClass = (classId: string) => {
    return assignments
      .filter(assignment => assignment.class_id === classId)
      .map(assignment => assignment.subjects?.name)
      .filter(Boolean);
  };

  const getClassStats = (classId: string) => {
    const classStudents = students.filter(s => s.class_id === classId);
    const cls = myClasses.find(c => c.id === classId);
    return {
      enrolled: classStudents.length,
      capacity: cls?.max_students || 30,
      subjects: getSubjectsForClass(classId).length
    };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-2"></div>
          <div className="h-4 bg-muted rounded w-48"></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-muted rounded-xl"></div>
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
          <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            My Classes
          </h2>
          <p className="text-muted-foreground">
            Manage and monitor your assigned classes and students
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover border-0 shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Across {stats.totalClasses} classes
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover border-0 shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              My Classes
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalClasses}</div>
            <p className="text-xs text-muted-foreground">
              Active assignments
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover border-0 shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Attendance Rate
            </CardTitle>
            <UserCheck className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.attendanceRate}%</div>
            <p className="text-xs text-muted-foreground">
              This month average
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover border-0 shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Performance
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.avgPerformance}%</div>
            <p className="text-xs text-muted-foreground">
              Last assessment
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Class Overview</TabsTrigger>
          <TabsTrigger value="students">All Students</TabsTrigger>
          <TabsTrigger value="management">Class Management</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Class Cards */}
          {myClasses.length === 0 ? (
            <Card className="border-dashed border-2 border-muted-foreground/25">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <GraduationCap className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Classes Assigned</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  You haven't been assigned any classes yet. Contact your headmaster for class assignments.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {myClasses.map((classItem) => {
                const classStats = getClassStats(classItem.id);
                const subjects = getSubjectsForClass(classItem.id);
                
                return (
                  <Card key={classItem.id} className="card-hover border-0 shadow-elegant hover:shadow-glow transition-all duration-300">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
                            <GraduationCap className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-xl">{classItem.name}</CardTitle>
                            <CardDescription className="flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              {classItem.academic_year}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline" className="gap-1">
                          <Users className="h-3 w-3" />
                          {classStats.enrolled}/{classStats.capacity}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-primary">{classStats.enrolled}</p>
                          <p className="text-xs text-muted-foreground">Students</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-green-600">{classStats.subjects}</p>
                          <p className="text-xs text-muted-foreground">Subjects</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-blue-600">{Math.round((classStats.enrolled / classStats.capacity) * 100)}%</p>
                          <p className="text-xs text-muted-foreground">Capacity</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Subjects Teaching:</p>
                        <div className="flex flex-wrap gap-1">
                          {subjects.map((subject, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {subject}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        <Button size="sm" variant="outline" className="gap-1 p-2">
                          <ClipboardCheck className="h-3 w-3" />
                          <span className="sr-only">Attendance</span>
                        </Button>
                        <Button size="sm" variant="outline" className="gap-1 p-2">
                          <FileText className="h-3 w-3" />
                          <span className="sr-only">Results</span>
                        </Button>
                        <Button size="sm" variant="outline" className="gap-1 p-2">
                          <Target className="h-3 w-3" />
                          <span className="sr-only">Analytics</span>
                        </Button>
                        <Button size="sm" variant="outline" className="gap-1 p-2">
                          <Award className="h-3 w-3" />
                          <span className="sr-only">Reports</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          {/* Search and Filter */}
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
              {myClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {/* Students Grid */}
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
                <Card key={student.id} className="card-hover border-0 shadow-elegant hover:shadow-glow transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={student.profile_photo_url} />
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
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
                      <Badge variant="outline" className="text-xs">
                        {student.admission_number}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>Guardian: {student.guardian_name || 'Not provided'}</span>
                      </div>
                      {student.guardian_phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{student.guardian_phone}</span>
                        </div>
                      )}
                      {student.guardian_email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{student.guardian_email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>DOB: {new Date(student.date_of_birth).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" className="flex-1 gap-1">
                        <Eye className="h-3 w-3" />
                        Profile
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 gap-1">
                        <FileText className="h-3 w-3" />
                        Results
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="management" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Quick Actions */}
            <Card className="card-hover border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Common tasks for class management
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start gap-3 h-12">
                  <ClipboardCheck className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-medium">Mark Attendance</p>
                    <p className="text-xs text-muted-foreground">Record today's attendance</p>
                  </div>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3 h-12">
                  <FileText className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-medium">Enter Results</p>
                    <p className="text-xs text-muted-foreground">Record exam scores</p>
                  </div>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3 h-12">
                  <Award className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-medium">Generate Reports</p>
                    <p className="text-xs text-muted-foreground">Class performance reports</p>
                  </div>
                </Button>
              </CardContent>
            </Card>

            {/* Class Performance */}
            <Card className="card-hover border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Class Performance Overview
                </CardTitle>
                <CardDescription>
                  Recent performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {myClasses.slice(0, 3).map((classItem) => {
                  const classStats = getClassStats(classItem.id);
                  const performance = Math.floor(Math.random() * 30) + 70;
                  
                  return (
                    <div key={classItem.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium">{classItem.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {classStats.enrolled} students
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">{performance}%</p>
                        <p className="text-xs text-muted-foreground">Avg Score</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClassManagement;