import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Users, Shield, BookOpen, BarChart3 } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const features = [
    {
      icon: Users,
      title: "Multi-Role Access",
      description: "Admin, Headmaster, Teacher, and Parent dashboards with role-based permissions"
    },
    {
      icon: Shield,
      title: "Branch Isolation",
      description: "Secure data separation between different school branches"
    },
    {
      icon: BookOpen,
      title: "Complete Student Records",
      description: "Academic results, attendance, behavior, fees, and medical records"
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Comprehensive reporting and analytics for informed decision making"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GraduationCap className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <GraduationCap className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            School Management System
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            A comprehensive multi-branch school management platform with role-based access control, 
            designed to streamline educational administration and enhance parent engagement.
          </p>
          <div className="space-x-4">
            <Button size="lg" onClick={() => navigate('/auth')}>
              Get Started
            </Button>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* System Overview */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Complete Educational Management</CardTitle>
            <CardDescription>
              Everything you need to manage a modern multi-branch educational institution
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-semibold mb-3">For Administrators</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• System-wide user management</li>
                <li>• Multi-branch oversight</li>
                <li>• Global analytics and reporting</li>
                <li>• Role and permission management</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">For Educators</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Student academic tracking</li>
                <li>• Attendance management</li>
                <li>• Behavior record keeping</li>
                <li>• Fee management and receipts</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">For Parents</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Real-time child progress monitoring</li>
                <li>• Fee payment tracking</li>
                <li>• Attendance notifications</li>
                <li>• Secure document access</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Security & Privacy</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Row-level security policies</li>
                <li>• Branch-isolated data access</li>
                <li>• Encrypted data transmission</li>
                <li>• Audit trail logging</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
