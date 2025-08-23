import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, GraduationCap, UserCheck, BookOpen, Calendar, FileText, TrendingUp } from 'lucide-react';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const HeadmasterDashboard = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState([
    { title: 'Students', value: '0', icon: GraduationCap, color: 'text-primary' },
    { title: 'Teachers', value: '0', icon: UserCheck, color: 'text-secondary' },
    { title: 'Subjects', value: '8', icon: BookOpen, color: 'text-accent' },
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

        // Fetch teachers count for this branch
        const teachersQuery = query(
          collection(db, 'users'),
          where('role', '==', 'teacher'),
          where('branch_id', '==', profile.branch_id)
        );
        const teachersSnapshot = await getDocs(teachersQuery);
        const teachers = teachersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        setStats([
          { title: 'Students', value: (students?.length || 0).toString(), icon: GraduationCap, color: 'text-primary' },
          { title: 'Teachers', value: (teachers?.length || 0).toString(), icon: UserCheck, color: 'text-secondary' },
          { title: 'Subjects', value: '8', icon: BookOpen, color: 'text-accent' },
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
            Headmaster Dashboard
          </h2>
          <p className="text-muted-foreground mt-2 text-lg">Welcome back, {profile?.name} 👨‍🎓</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Managing: {branchName}</p>
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
                  Branch specific
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
              Manage your branch operations efficiently
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="premium" 
                size="sm"
                className="interactive-scale"
                onClick={() => navigate('/students')}
              >
                <GraduationCap className="h-4 w-4 mr-2" />
                Add Student
              </Button>
              <Button 
                variant="secondary" 
                size="sm"
                className="interactive-scale"
                onClick={() => navigate('/teachers')}
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Add Teacher
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="interactive-scale"
                onClick={() => navigate('/attendance')}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Mark Attendance
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="interactive-scale"
                onClick={() => navigate('/reports')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <CardHeader>
            <CardTitle className="text-foreground">Recent Activities</CardTitle>
            <CardDescription className="text-muted-foreground">
              Latest updates from your branch
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm font-medium text-foreground">Branch Overview</p>
                <p className="text-xs text-muted-foreground">
                  Managing {branchName} with dedicated staff and students
                </p>
              </div>
              <div className="p-3 bg-secondary/10 rounded-lg border border-secondary/20">
                <p className="text-sm font-medium text-foreground">Academic Progress</p>
                <p className="text-xs text-muted-foreground">
                  Track student performance and generate comprehensive reports
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HeadmasterDashboard;
