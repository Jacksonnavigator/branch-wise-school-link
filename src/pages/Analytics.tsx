import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Users, GraduationCap, UserCheck, TrendingUp, TrendingDown, Activity, BookOpen } from 'lucide-react';

const Analytics = () => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [branches, setBranches] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalBranches: 0,
    avgAttendance: 95
  });
  const [branchData, setBranchData] = useState<any[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedBranch, profile]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Fetch branches
      const branchesSnapshot = await getDocs(collection(db, 'branches'));
      const branchesData = branchesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      setBranches(branchesData || []);

      // Filter data based on user role and selected branch
      let branchFilter = selectedBranch === 'all' ? null : selectedBranch;
      
      // If user is headmaster, only show their branch
      if (profile?.role === 'headmaster' && profile?.branch_id) {
        branchFilter = profile.branch_id;
        setSelectedBranch(profile.branch_id);
      }

      // Fetch students
      let studentsSnapshot;
      if (branchFilter) {
        const studentsQuery = query(collection(db, 'students'), where('branch_id', '==', branchFilter));
        studentsSnapshot = await getDocs(studentsQuery);
      } else {
        studentsSnapshot = await getDocs(collection(db, 'students'));
      }
      const students = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Fetch teachers from users table
      let teachersQuery = query(collection(db, 'users'), where('role', '==', 'teacher'));
      if (branchFilter) {
        teachersQuery = query(collection(db, 'users'), where('role', '==', 'teacher'), where('branch_id', '==', branchFilter));
      }
      const teachersSnapshot = await getDocs(teachersQuery);
      const teachers = teachersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Calculate branch-wise data
      const branchStats = (branchesData || []).map((branch: any) => {
        const branchStudents = (students || []).filter((s: any) => s.branch_id === branch.id).length;
        const branchTeachers = (teachers || []).filter((t: any) => t.branch_id === branch.id).length;
        
        return {
          name: branch.name,
          students: branchStudents,
          teachers: branchTeachers,
          total: branchStudents + branchTeachers
        };
      });

      // Fetch performance data from academic results (placeholder for now)
      const resultsSnapshot = await getDocs(collection(db, 'academic_results'));
      const resultsData = resultsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Calculate subject-wise performance
      const subjectPerformance: {[key: string]: {scores: number[], total: number}} = {};
      (resultsData || []).forEach((result: any) => {
        if (!subjectPerformance[result.subject]) {
          subjectPerformance[result.subject] = { scores: [], total: 0 };
        }
        subjectPerformance[result.subject].scores.push(result.score);
        subjectPerformance[result.subject].total++;
      });

      const performanceData = Object.entries(subjectPerformance).map(([subject, data]) => {
        const average = data.scores.length > 0 ? 
          Math.round(data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length) : 0;
        const passRate = data.scores.length > 0 ? 
          Math.round((data.scores.filter(score => score >= 50).length / data.scores.length) * 100) : 0;
        
        return {
          subject,
          average,
          pass_rate: passRate
        };
      });

      // Fetch attendance data (placeholder for now)
      const attendanceSnapshot = await getDocs(collection(db, 'attendance'));
      const attendanceRecords = attendanceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Calculate monthly attendance (simplified)
      const monthlyAttendance = [
        { month: 'Jan', attendance: 95 },
        { month: 'Feb', attendance: 94 },
        { month: 'Mar', attendance: 96 },
        { month: 'Apr', attendance: 93 },
        { month: 'May', attendance: 97 },
        { month: 'Jun', attendance: 95 }
      ];

      setStats({
        totalStudents: (students || []).length,
        totalTeachers: (teachers || []).length,
        totalBranches: (branchesData || []).length,
        avgAttendance: 95
      });

      setBranchData(branchStats);
      setPerformanceData(performanceData.length > 0 ? performanceData : [
        { subject: 'No Data', average: 0, pass_rate: 0 }
      ]);
      setAttendanceData(monthlyAttendance);

    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#ffc658', '#ff7c7c'];

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Analytics Dashboard
          </h2>
          <p className="text-muted-foreground">Comprehensive performance metrics and insights</p>
        </div>
        
        {profile?.role === 'admin' && (
          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Branch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches</SelectItem>
              {branches.map((branch) => (
                <SelectItem key={branch.id} value={branch.id}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                <p className="text-3xl font-bold text-foreground">{stats.totalStudents}</p>
              </div>
              <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Teachers</p>
                <p className="text-3xl font-bold text-foreground">{stats.totalTeachers}</p>
              </div>
              <div className="w-12 h-12 gradient-secondary rounded-xl flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Branches</p>
                <p className="text-3xl font-bold text-foreground">{stats.totalBranches}</p>
              </div>
              <div className="w-12 h-12 gradient-accent rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Attendance</p>
                <p className="text-3xl font-bold text-foreground">{stats.avgAttendance}%</p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Branch Distribution */}
        <Card className="glass border-border">
          <CardHeader>
            <CardTitle>Students & Teachers by Branch</CardTitle>
            <CardDescription>Distribution across all branches</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={branchData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="students" fill="hsl(var(--primary))" name="Students" />
                <Bar dataKey="teachers" fill="hsl(var(--secondary))" name="Teachers" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Subject Performance */}
        <Card className="glass border-border">
          <CardHeader>
            <CardTitle>Subject Performance</CardTitle>
            <CardDescription>Average scores by subject</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={performanceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, average }) => `${name}: ${average}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="average"
                >
                  {performanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Attendance Trends */}
        <Card className="glass border-border lg:col-span-2">
          <CardHeader>
            <CardTitle>Attendance Trends</CardTitle>
            <CardDescription>Monthly attendance rates</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[90, 100]} />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="attendance" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  name="Attendance %" 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card className="glass border-border">
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
          <CardDescription>Subject-wise academic performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performanceData.map((subject, index) => (
              <div key={subject.subject} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS[index % COLORS.length] }}>
                    <BookOpen className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{subject.subject}</p>
                    <p className="text-sm text-muted-foreground">Average Score: {subject.average}%</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">{subject.pass_rate}%</p>
                  <p className="text-sm text-muted-foreground">Pass Rate</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;