
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, FileText, Users, Bell, BookOpen } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const ParentDashboard = () => {
  const { user, profile } = useAuth();
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
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Parent Dashboard</h2>
        <p className="text-gray-600">Monitor your child's academic progress</p>
        <p className="text-sm text-gray-500">Welcome, {profile?.name}</p>
      </div>

      {/* Child Profile Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={child.profile_photo} />
              <AvatarFallback className="text-lg">
                {child.full_name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">{child.full_name}</CardTitle>
              <CardDescription className="text-base">
                {child.class} • Admission #: {child.admission_number}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                <p className="text-3xl font-bold text-green-600">95%</p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Fees</p>
                <p className="text-3xl font-bold text-orange-600">$250</p>
              </div>
              <FileText className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Recent Grades</p>
                <p className="text-3xl font-bold text-blue-600">A-</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
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
            <Button variant="outline" className="w-full mt-4">
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
            <Button variant="outline" className="w-full mt-4">
              View All Notifications
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ParentDashboard;
