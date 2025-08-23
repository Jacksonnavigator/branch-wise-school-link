
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building2, GraduationCap, UserCheck } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
        const studentsSnapshot = await getDocs(collection(db, 'students'));
        const students = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Fetch teachers count
        const teachersQuery = query(collection(db, 'users'), where('role', '==', 'teacher'));
        const teachersSnapshot = await getDocs(teachersQuery);
        const teachers = teachersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Fetch branches count
        const branchesSnapshot = await getDocs(collection(db, 'branches'));
        const branches = branchesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Fetch total users count
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

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
    <div className="space-y-8 animate-fade-in p-6">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary-glow/5 rounded-2xl blur-3xl"></div>
        <div className="relative">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Admin Dashboard
          </h2>
          <p className="text-muted-foreground mt-2 text-lg">System-wide overview and management</p>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              System Online
            </div>
            <div className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
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
                  Updated live
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass border-border/50 animate-slide-up hover-lift group">
          <CardHeader className="pb-4">
            <CardTitle className="text-foreground flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              System Overview
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Quick overview of your school management system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-5 bg-gradient-to-br from-primary/10 to-primary-glow/5 rounded-xl border border-primary/20 group-hover:border-primary/30 transition-colors duration-300">
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  🚀 Getting Started
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Welcome to your school management system. Start by adding branches, 
                  then manage students, teachers, and track academic progress.
                </p>
              </div>
              <div className="p-5 bg-gradient-to-br from-accent/10 to-secondary/5 rounded-xl border border-accent/20 group-hover:border-accent/30 transition-colors duration-300">
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  ⚡ Quick Actions
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Use the navigation menu to access different sections: 
                  Students, Teachers, Branches, Analytics, and Reports.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50 animate-slide-up hover-lift group" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="pb-4">
            <CardTitle className="text-foreground flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              System Status
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Current status of your school management system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <div>
                  <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                    💾 Database Status
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">All systems operational</p>
                </div>
                <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse shadow-glow"></div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div>
                  <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                    🔐 Authentication
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Firebase Auth active</p>
                </div>
                <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse shadow-glow"></div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                <div>
                  <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                    ⚡ Performance
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Optimal response times</p>
                </div>
                <div className="w-4 h-4 bg-purple-500 rounded-full animate-pulse shadow-glow"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
