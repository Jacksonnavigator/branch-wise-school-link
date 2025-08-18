import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, GraduationCap, UserCheck, BookOpen, Calendar, FileText, TrendingUp } from 'lucide-react';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const HeadmasterDashboard = () => {
  const { profile } = useAuth();
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
        const branchDoc = await getDoc(doc(db, 'branches', profile.branch_id));
        if (branchDoc.exists()) {
          setBranchName(branchDoc.data().name);
        }

        // Fetch students count for this branch
        const studentsQuery = query(
          collection(db, 'students'), 
          where('branch_id', '==', profile.branch_id)
        );
        const studentsSnapshot = await getDocs(studentsQuery);
        const studentsCount = studentsSnapshot.size;

        // Fetch teachers count for this branch
        const teachersQuery = query(
          collection(db, 'profiles'), 
          where('role', '==', 'teacher'),
          where('branch_id', '==', profile.branch_id)
        );
        const teachersSnapshot = await getDocs(teachersQuery);
        const teachersCount = teachersSnapshot.size;

        setStats([
          { title: 'Students', value: studentsCount.toString(), icon: GraduationCap, color: 'text-primary' },
          { title: 'Teachers', value: teachersCount.toString(), icon: UserCheck, color: 'text-secondary' },
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
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold text-foreground bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          Headmaster Dashboard
        </h2>
        <p className="text-muted-foreground">Welcome back, {profile?.name}</p>
        <p className="text-sm text-muted-foreground">Managing: {branchName}</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] animate-scale-in glass border-border" 
                  style={{ animationDelay: `${index * 0.1}s` }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center">
                    <stat.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
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
              <Button className="gradient-primary hover:scale-105 transition-all" size="sm">
                <GraduationCap className="h-4 w-4 mr-2" />
                Add Student
              </Button>
              <Button className="gradient-secondary hover:scale-105 transition-all" size="sm">
                <UserCheck className="h-4 w-4 mr-2" />
                Add Teacher
              </Button>
              <Button variant="outline" className="hover:scale-105 transition-all" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Mark Attendance
              </Button>
              <Button variant="outline" className="hover:scale-105 transition-all" size="sm">
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
