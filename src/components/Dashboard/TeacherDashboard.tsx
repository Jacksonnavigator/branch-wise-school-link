import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import useBranchInfo from '@/hooks/useBranchInfo';
import StudentManagement from '@/components/Teachers/StudentManagement';
import SubjectManagement from '@/components/Teachers/SubjectManagement';
import ClassManagement from '@/components/Teachers/ClassManagement';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  ClipboardCheck, 
  TrendingUp, 
  UserCheck,
  FileText,
  GraduationCap,
  Clock,
  Plus
} from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const TeacherDashboard = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const branchName = useBranchInfo();
  const [stats, setStats] = useState({
    myStudents: 0,
    myClasses: 0,
    subjects: 0,
    attendanceRate: '95%'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeacherStats = async () => {
      if (!profile?.branch_id) return;

      try {
        // Fetch students assigned to this teacher
        const studentsQuery = query(
          collection(db, 'students'),
          where('branch_id', '==', profile.branch_id)
        );
        const studentsSnapshot = await getDocs(studentsQuery);
        
        setStats({
          myStudents: studentsSnapshot.size || 0,
          myClasses: 2,
          subjects: 3,
          attendanceRate: '95%'
        });
      } catch (error) {
        console.error('Error fetching teacher stats:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherStats();
  }, [profile?.branch_id, toast]);

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'attendance':
        navigate('/attendance');
        break;
      case 'results':
        navigate('/results');
        break;
      case 'students':
        navigate('/students');
        break;
      case 'schedule':
        toast({
          title: "Feature Coming Soon",
          description: "Class schedule functionality will be available soon.",
        });
        break;
      default:
        toast({
          title: "Feature Coming Soon",
          description: `${action} functionality will be available soon.`,
        });
    }
  };

  const dashboardStats = [
    {
      title: "My Students",
      value: stats.myStudents.toString(),
      description: "Students in my classes",
      icon: GraduationCap,
      trend: "+5.2%",
      color: "text-blue-600"
    },
    {
      title: "My Classes",
      value: stats.myClasses.toString(),
      description: "Active class assignments",
      icon: BookOpen,
      trend: "Stable",
      color: "text-green-600"
    },
    {
      title: "Subjects",
      value: stats.subjects.toString(),
      description: "Subjects I teach",
      icon: UserCheck,
      trend: "+1",
      color: "text-purple-600"
    },
    {
      title: "Attendance Rate",
      value: stats.attendanceRate,
      description: "Class attendance average",
      icon: TrendingUp,
      trend: "+2.1%",
      color: "text-emerald-600"
    }
  ];

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
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
          Teacher Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome back! Here's your teaching overview for {branchName}
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">My Students</TabsTrigger>
          <TabsTrigger value="subjects">My Subjects</TabsTrigger>
          <TabsTrigger value="classes">My Classes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {dashboardStats.map((stat, index) => (
              <Card key={stat.title} className="card-hover border-0 shadow-elegant">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="text-muted-foreground">{stat.description}</span>
                    <Badge variant="secondary" className="text-xs">
                      {stat.trend}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="card-hover border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5 text-primary" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Frequently used teacher tools</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => handleQuickAction('attendance')} 
                  className="w-full justify-start gap-2 button-hover"
                  variant="ghost"
                >
                  <UserCheck className="h-4 w-4" />
                  Mark Attendance
                </Button>
                <Button 
                  onClick={() => handleQuickAction('results')} 
                  className="w-full justify-start gap-2 button-hover"
                  variant="ghost"
                >
                  <FileText className="h-4 w-4" />
                  Enter Results
                </Button>
                <Button 
                  onClick={() => handleQuickAction('students')} 
                  className="w-full justify-start gap-2 button-hover"
                  variant="ghost"
                >
                  <Users className="h-4 w-4" />
                  View Students
                </Button>
                <Button 
                  onClick={() => handleQuickAction('schedule')} 
                  className="w-full justify-start gap-2 button-hover"
                  variant="ghost"
                >
                  <Calendar className="h-4 w-4" />
                  Class Schedule
                </Button>
              </CardContent>
            </Card>

            <Card className="card-hover border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  Teaching Overview
                </CardTitle>
                <CardDescription>Your current teaching assignments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Branch</span>
                    <span className="font-medium">{branchName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Academic Year</span>
                    <span className="font-medium">2024-25</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Term</span>
                    <span className="font-medium">First Term</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Academic Progress</span>
                    <span className="font-medium">65%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-gradient-primary h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Today's Schedule
                </CardTitle>
                <CardDescription>Your classes for today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                    <div>
                      <div className="font-medium">Mathematics</div>
                      <div className="text-muted-foreground">Grade 10A</div>
                    </div>
                    <Badge variant="outline">9:00 AM</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                    <div>
                      <div className="font-medium">Physics</div>
                      <div className="text-muted-foreground">Grade 11B</div>
                    </div>
                    <Badge variant="outline">11:00 AM</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                    <div>
                      <div className="font-medium">Mathematics</div>
                      <div className="text-muted-foreground">Grade 9A</div>
                    </div>
                    <Badge variant="outline">2:00 PM</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students">
          <StudentManagement />
        </TabsContent>

        <TabsContent value="subjects">
          <SubjectManagement />
        </TabsContent>

        <TabsContent value="classes">
          <ClassManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeacherDashboard;
