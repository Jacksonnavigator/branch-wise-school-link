import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Calendar,
  DollarSign,
  FileText,
  Settings,
  LogOut
} from 'lucide-react';

const Dashboard = () => {
  const { user, userRole, branchId, signOut, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <GraduationCap className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'headmaster': return 'bg-blue-100 text-blue-800';
      case 'teacher': return 'bg-green-100 text-green-800';
      case 'parent': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getQuickActions = () => {
    switch (userRole) {
      case 'admin':
        return [
          { icon: Users, title: 'Manage Users', description: 'Add and manage all system users' },
          { icon: BookOpen, title: 'Manage Branches', description: 'Configure school branches' },
          { icon: Settings, title: 'System Settings', description: 'Global system configuration' },
          { icon: FileText, title: 'Reports', description: 'View system-wide reports' }
        ];
      case 'headmaster':
        return [
          { icon: Users, title: 'Manage Students', description: 'View and manage branch students' },
          { icon: BookOpen, title: 'Manage Classes', description: 'Configure classes and subjects' },
          { icon: Users, title: 'Assign Teachers', description: 'Assign teachers to classes' },
          { icon: FileText, title: 'Branch Reports', description: 'View branch reports' }
        ];
      case 'teacher':
        return [
          { icon: Users, title: 'My Students', description: 'View assigned students' },
          { icon: Calendar, title: 'Attendance', description: 'Mark student attendance' },
          { icon: BookOpen, title: 'Academic Results', description: 'Enter grades and results' },
          { icon: FileText, title: 'Behavior Records', description: 'Add behavior notes' }
        ];
      case 'parent':
        return [
          { icon: Users, title: 'My Children', description: 'View children profiles' },
          { icon: BookOpen, title: 'Academic Progress', description: 'View grades and results' },
          { icon: Calendar, title: 'Attendance Record', description: 'Check attendance history' },
          { icon: DollarSign, title: 'Fee Status', description: 'View fee payments' }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <GraduationCap className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">School Management System</h1>
              <p className="text-sm text-muted-foreground">Multi-Branch Education Platform</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="font-medium">{user.email}</p>
              <div className="flex items-center space-x-2">
                <Badge className={getRoleColor(userRole || '')}>{userRole}</Badge>
                {branchId && <Badge variant="outline">Branch ID: {branchId.slice(0, 8)}</Badge>}
              </div>
            </div>
            <Button onClick={handleSignOut} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back!</h2>
          <p className="text-muted-foreground">
            {userRole === 'admin' ? 'Manage the entire school system across all branches.' :
             userRole === 'headmaster' ? 'Oversee your branch operations and staff.' :
             userRole === 'teacher' ? 'Manage your students and classroom activities.' :
             'Monitor your children\'s academic progress and school activities.'}
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {getQuickActions().map((action, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <action.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{action.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                {userRole === 'parent' ? 'Children Enrolled' : 'Total Students'}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                {userRole === 'parent' ? 'Fee Payments Due' : 'New Enrollments'}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Active</div>
              <p className="text-xs text-muted-foreground">All systems operational</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity placeholder */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest updates and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recent activity to display</p>
              <p className="text-sm">Start using the system to see your activity here</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;