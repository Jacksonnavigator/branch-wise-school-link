import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, GraduationCap, UserCheck, BookOpen, Calendar, FileText, TrendingUp } from 'lucide-react';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

const TeacherDashboard = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState([
    { title: 'My Students', value: '0', icon: GraduationCap, color: 'text-primary' },
    { title: 'My Classes', value: '2', icon: BookOpen, color: 'text-secondary' },
    { title: 'Subjects', value: '3', icon: UserCheck, color: 'text-accent' },
    { title: 'Attendance Rate', value: '95%', icon: TrendingUp, color: 'text-green-600' },
  ]);
  const [branchName, setBranchName] = useState<string>('Loading...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!profile?.branch_id) return;
      
      try {
        // Fetch branch name
        const branchRef = doc(db, 'branches', profile.branch_id);
        const branchDoc = await getDoc(branchRef);
        if (branchDoc.exists()) {
          setBranchName(branchDoc.data().name);
        }

        // Fetch students count for this branch
        const studentsQuery = query(
          collection(db, 'students'),
          where('branch_id', '==', profile.branch_id)
        );
        const studentsSnapshot = await getDocs(studentsQuery);
        const students = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        setStats([
          { title: 'My Students', value: (students?.length || 0).toString(), icon: GraduationCap, color: 'text-primary' },
          { title: 'My Classes', value: '2', icon: BookOpen, color: 'text-secondary' },
          { title: 'Subjects', value: '3', icon: UserCheck, color: 'text-accent' },
          { title: 'Attendance Rate', value: '95%', icon: TrendingUp, color: 'text-green-600' },
        ]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [profile?.branch_id]);

  return (
    <div className="space-y-8 animate-fade-in p-6">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary-glow/5 rounded-2xl blur-3xl"></div>
        <div className="relative">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Teacher Dashboard
          </h2>
          <p className="text-muted-foreground mt-2 text-lg">Welcome back, {profile?.name} 👨‍🏫</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Teaching at: {branchName}</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="card-interactive group glass border-border/50 relative overflow-hidden" 
                  style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary-glow/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">{stat.title}</p>
                    <p className="text-3xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">{stat.value}</p>
                  </div>
                  <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform duration-300">
                    <stat.icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-xs text-muted-foreground">
                  <span className="w-1 h-1 bg-green-500 rounded-full mr-2"></span>
                  Teaching tools
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass border-border animate-fade-in">
          <CardHeader>
            <CardTitle className="text-foreground">Quick Actions</CardTitle>
            <CardDescription className="text-muted-foreground">
              Manage your teaching activities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="premium" 
                size="sm"
                className="interactive-scale"
                onClick={() => navigate('/attendance')}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Mark Attendance
              </Button>
              <Button 
                variant="secondary" 
                size="sm"
                className="interactive-scale"
                onClick={() => navigate('/results')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Enter Results
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="interactive-scale"
                onClick={() => navigate('/my-students')}
              >
                <GraduationCap className="h-4 w-4 mr-2" />
                View Students
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="interactive-scale"
                onClick={() => toast({ title: "Feature Coming Soon!", description: "Class schedule functionality will be available soon." })}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Class Schedule
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <CardHeader>
            <CardTitle className="text-foreground">Teaching Overview</CardTitle>
            <CardDescription className="text-muted-foreground">
              Your current teaching assignments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm font-medium text-foreground">Branch: {branchName}</p>
                <p className="text-xs text-muted-foreground">
                  Managing classes and student progress
                </p>
              </div>
              <div className="p-3 bg-secondary/10 rounded-lg border border-secondary/20">
                <p className="text-sm font-medium text-foreground">Academic Progress</p>
                <p className="text-xs text-muted-foreground">
                  Track student performance and conduct assessments
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherDashboard;
