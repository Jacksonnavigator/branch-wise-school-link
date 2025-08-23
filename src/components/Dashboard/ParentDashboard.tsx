
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Calendar, FileText, Users, Bell, BookOpen } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';

const ParentDashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChildren = async () => {
      if (!user || !profile) return;
      
      try {
        // Fetch children where guardian_email matches user email
        const studentsQuery = query(
          collection(db, 'students'),
          where('guardian_email', '==', user.email)
        );
        const studentsSnapshot = await getDocs(studentsQuery);
        const studentsData = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        setChildren(studentsData || []);
      } catch (error) {
        console.error('Error fetching children:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, [user, profile]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your children's information...</p>
        </div>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Parent Dashboard</h2>
          <p className="text-gray-600">Monitor your child's academic progress</p>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Children Found</h3>
            <p className="text-gray-600">
              No student records found associated with your email address. 
              Please contact the school administration to ensure your email is correctly registered.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const child = children[0]; // Show first child (can be extended for multiple children)

  return (
    <div className="space-y-8 animate-fade-in p-6">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary-glow/5 rounded-2xl blur-3xl"></div>
        <div className="relative">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Parent Dashboard
          </h2>
          <p className="text-muted-foreground mt-2 text-lg">Monitor your child's academic progress</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Welcome back, {profile?.name} 👋</p>
        </div>
      </div>

      {/* Child Profile Card */}
      <Card className="glass border-border/50 relative overflow-hidden hover-lift">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary-glow/5 to-accent/10"></div>
        <CardHeader className="relative z-10">
          <div className="flex items-center space-x-6">
            <Avatar className="h-20 w-20 ring-4 ring-primary/20 hover:ring-primary/40 transition-all duration-300">
              <AvatarImage src={child.profile_photo} />
              <AvatarFallback className="text-xl bg-gradient-primary text-primary-foreground">
                {child.full_name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-2xl text-foreground mb-2">{child.full_name}</CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                📚 {child.class} • 🎫 Admission #: {child.admission_number}
              </CardDescription>
              <div className="mt-3 flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1 text-green-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Active Student
                </span>
                <span className="text-muted-foreground">Academic Year 2024-25</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-interactive glass border-border/50 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Attendance Rate</p>
                <p className="text-3xl font-bold text-green-600 group-hover:text-green-500 transition-colors">95%</p>
                <p className="text-xs text-green-600/70 mt-1">🎯 Excellent</p>
              </div>
              <div className="w-12 h-12 gradient-success rounded-2xl flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform duration-300">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-interactive glass border-border/50 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Pending Fees</p>
                <p className="text-3xl font-bold text-orange-600 group-hover:text-orange-500 transition-colors">$250</p>
                <p className="text-xs text-orange-600/70 mt-1">💳 Due Soon</p>
              </div>
              <div className="w-12 h-12 gradient-warning rounded-2xl flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform duration-300">
                <FileText className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-interactive glass border-border/50 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Recent Grades</p>
                <p className="text-3xl font-bold text-blue-600 group-hover:text-blue-500 transition-colors">A-</p>
                <p className="text-xs text-blue-600/70 mt-1">📈 Great Work</p>
              </div>
              <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform duration-300">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Grades */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Academic Results</CardTitle>
            <CardDescription>Latest subject grades and scores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Academic results will appear here</p>
                <p className="text-sm text-gray-400">Results are updated by teachers after exams</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4 interactive-scale"
              onClick={() => navigate('/results')}
            >
              View All Results
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Updates</CardTitle>
            <CardDescription>Latest notifications and activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-3 bg-blue-50 rounded-lg">
                <Bell className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <p className="font-medium text-blue-900">Welcome to Parent Portal</p>
                  <p className="text-sm text-blue-700">Monitor your child's progress and stay updated</p>
                  <p className="text-xs text-blue-600 mt-1">Today</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-3 bg-green-50 rounded-lg">
                <Calendar className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <p className="font-medium text-green-900">Student Enrollment Confirmed</p>
                  <p className="text-sm text-green-700">Your child has been successfully enrolled</p>
                  <p className="text-xs text-green-600 mt-1">1 day ago</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-3 bg-orange-50 rounded-lg">
                <FileText className="h-5 w-5 text-orange-600 mt-1" />
                <div>
                  <p className="font-medium text-orange-900">Fee Reminder</p>
                  <p className="text-sm text-orange-700">Term fee payment due in 5 days</p>
                  <p className="text-xs text-orange-600 mt-1">3 days ago</p>
                </div>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4 interactive-scale"
              onClick={() => toast({ title: "Feature Coming Soon!", description: "Notification history will be available soon." })}
            >
              View All Notifications
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ParentDashboard;
