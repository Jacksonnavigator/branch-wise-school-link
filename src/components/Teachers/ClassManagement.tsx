import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  GraduationCap, 
  Search, 
  Users, 
  Calendar,
  BookOpen,
  Clock,
  Plus,
  School
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';

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
}

const ClassManagement = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [classes, setClasses] = useState<Class[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.branch_id) {
      setLoading(false);
      return;
    }

    // Mock data for classes assigned to this teacher
    setClasses([
      {
        id: '1',
        name: 'Grade 10A',
        grade_level: 10,
        section: 'A',
        student_count: 28,
        subjects: ['Mathematics', 'Physics'],
        schedule: 'Mon, Wed, Fri - 9:00 AM',
        teacher_id: profile.id,
        branch_id: profile.branch_id,
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Grade 11B',
        grade_level: 11,
        section: 'B',
        student_count: 25,
        subjects: ['Mathematics', 'Chemistry'],
        schedule: 'Tue, Thu - 11:00 AM',
        teacher_id: profile.id,
        branch_id: profile.branch_id,
        created_at: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Grade 9A',
        grade_level: 9,
        section: 'A',
        student_count: 30,
        subjects: ['Mathematics'],
        schedule: 'Mon, Wed, Fri - 2:00 PM',
        teacher_id: profile.id,
        branch_id: profile.branch_id,
        created_at: new Date().toISOString()
      }
    ]);

    setLoading(false);
  }, [profile?.branch_id]);

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.section?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            My Classes
          </h2>
          <p className="text-muted-foreground">
            Manage the classes you're assigned to teach
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search classes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Classes Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Classes
            </CardTitle>
            <School className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classes.length}</div>
            <p className="text-xs text-muted-foreground">Active assignments</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {classes.reduce((sum, cls) => sum + cls.student_count, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Across all classes</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Subjects Taught
            </CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(classes.flatMap(cls => cls.subjects)).size}
            </div>
            <p className="text-xs text-muted-foreground">Different subjects</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Weekly Hours
            </CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">Teaching hours</p>
          </CardContent>
        </Card>
      </div>

      {/* My Classes */}
      {filteredClasses.length === 0 ? (
        <Card className="border-dashed border-2 border-muted-foreground/25">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <GraduationCap className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Classes Found</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              {searchTerm 
                ? "No classes match your search criteria." 
                : "You haven't been assigned any classes yet. Contact your headmaster for class assignments."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredClasses.map((cls) => (
            <Card key={cls.id} className="card-hover border-0 shadow-elegant hover:shadow-glow transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
                      <GraduationCap className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{cls.name}</CardTitle>
                      <CardDescription>
                        Grade {cls.grade_level} - Section {cls.section}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="gap-1">
                    <Users className="h-3 w-3" />
                    {cls.student_count}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="h-3 w-3" />
                    <span>Subjects: {cls.subjects.join(', ')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Schedule: {cls.schedule}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Academic Year: 2024-25</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <Button size="sm" variant="outline" className="gap-1 hover:bg-primary/10">
                    <Users className="h-3 w-3" />
                    Students
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1 hover:bg-primary/10">
                    <BookOpen className="h-3 w-3" />
                    Attendance
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1 hover:bg-primary/10">
                    <Calendar className="h-3 w-3" />
                    Schedule
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

export default ClassManagement;