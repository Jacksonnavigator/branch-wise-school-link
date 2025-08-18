
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building2, GraduationCap, UserCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const AdminDashboard = () => {
  const [stats, setStats] = useState([
    { title: 'Total Students', value: '0', icon: GraduationCap, color: 'text-primary' },
    { title: 'Total Teachers', value: '0', icon: UserCheck, color: 'text-secondary' },
    { title: 'Active Branches', value: '0', icon: Building2, color: 'text-accent' },
    { title: 'Total Users', value: '0', icon: Users, color: 'text-muted-foreground' },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch students count
        const { data: students, error: studentsError } = await supabase
          .from('students')
          .select('id');
        
        if (studentsError) throw studentsError;

        // Fetch teachers count
        const { data: teachers, error: teachersError } = await supabase
          .from('users')
          .select('id')
          .eq('role', 'teacher');
        
        if (teachersError) throw teachersError;

        // Fetch branches count
        const { data: branches, error: branchesError } = await supabase
          .from('branches')
          .select('id');
        
        if (branchesError) throw branchesError;

        // Fetch total users count
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('id');
        
        if (usersError) throw usersError;

        setStats([
          { title: 'Total Students', value: (students?.length || 0).toString(), icon: GraduationCap, color: 'text-primary' },
          { title: 'Total Teachers', value: (teachers?.length || 0).toString(), icon: UserCheck, color: 'text-secondary' },
          { title: 'Active Branches', value: (branches?.length || 0).toString(), icon: Building2, color: 'text-accent' },
          { title: 'Total Users', value: (users?.length || 0).toString(), icon: Users, color: 'text-muted-foreground' },
        ]);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold text-foreground bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          Admin Dashboard
        </h2>
        <p className="text-muted-foreground">System-wide overview and management</p>
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
            <CardTitle className="text-foreground">System Overview</CardTitle>
            <CardDescription className="text-muted-foreground">
              Quick overview of your school management system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <h4 className="font-semibold text-foreground mb-2">Getting Started</h4>
                <p className="text-sm text-muted-foreground">
                  Welcome to your school management system. Start by adding branches, 
                  then manage students, teachers, and track academic progress.
                </p>
              </div>
              <div className="p-4 bg-secondary/10 rounded-lg border border-secondary/20">
                <h4 className="font-semibold text-foreground mb-2">Quick Actions</h4>
                <p className="text-sm text-muted-foreground">
                  Use the navigation menu to access different sections: 
                  Students, Teachers, Branches, Analytics, and Reports.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <CardHeader>
            <CardTitle className="text-foreground">System Status</CardTitle>
            <CardDescription className="text-muted-foreground">
              Current status of your school management system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-foreground">Database Status</p>
                  <p className="text-xs text-muted-foreground">All systems operational</p>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-foreground">Authentication</p>
                  <p className="text-xs text-muted-foreground">Firebase Auth active</p>
                </div>
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
