import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import useBranchInfo from '@/hooks/useBranchInfo';
import { 
  DollarSign, 
  CreditCard, 
  Receipt, 
  TrendingUp, 
  Users, 
  FileSpreadsheet,
  Calculator,
  PieChart,
  Download,
  Plus
} from 'lucide-react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const AccountantDashboard = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const branchName = useBranchInfo();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingPayments: 0,
    paidPayments: 0,
    monthlyIncome: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinancialStats = async () => {
      if (!profile?.branch_id) return;

      try {
        // In a real implementation, these would fetch from your financial data
        // For now, showing the structure for accountant functionality
        setStats({
          totalRevenue: 125000,
          pendingPayments: 15000,
          paidPayments: 110000,
          monthlyIncome: 45000
        });
      } catch (error) {
        console.error('Error fetching financial stats:', error);
        toast({
          title: "Error",
          description: "Failed to load financial data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialStats();
  }, [profile?.branch_id, toast]);

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'fees':
        navigate('/fees');
        break;
      case 'reports':
        navigate('/reports');
        break;
      case 'analytics':
        navigate('/analytics');
        break;
      default:
        toast({
          title: "Feature Coming Soon",
          description: `${action} functionality will be available soon.`,
        });
    }
  };

  const dashboardStats = [
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      description: "Total income this year",
      icon: DollarSign,
      trend: "+12.5%",
      color: "text-emerald-600"
    },
    {
      title: "Pending Payments",
      value: `₹${stats.pendingPayments.toLocaleString()}`,
      description: "Outstanding fee payments",
      icon: CreditCard,
      trend: "-3.2%",
      color: "text-amber-600"
    },
    {
      title: "Monthly Income",
      value: `₹${stats.monthlyIncome.toLocaleString()}`,
      description: "Revenue this month",
      icon: TrendingUp,
      trend: "+8.1%",
      color: "text-blue-600"
    },
    {
      title: "Paid Payments",
      value: `₹${stats.paidPayments.toLocaleString()}`,
      description: "Completed payments",
      icon: Receipt,
      trend: "+15.3%",
      color: "text-green-600"
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-2"></div>
          <div className="h-4 bg-muted rounded w-48"></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-muted rounded-xl"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
          Financial Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome back! Here's your financial overview for {branchName}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat, index) => (
          <Card key={stat.title} className="card-hover border-0 shadow-elegant">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-muted-foreground">{stat.description}</span>
                <Badge variant="secondary" className="text-xs">
                  {stat.trend}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="card-hover border-0 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription>Frequently used financial tools</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={() => handleQuickAction('fees')} 
              className="w-full justify-start gap-2 button-hover"
              variant="ghost"
            >
              <DollarSign className="h-4 w-4" />
              Manage Fee Payments
            </Button>
            <Button 
              onClick={() => handleQuickAction('reports')} 
              className="w-full justify-start gap-2 button-hover"
              variant="ghost"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Generate Reports
            </Button>
            <Button 
              onClick={() => handleQuickAction('analytics')} 
              className="w-full justify-start gap-2 button-hover"
              variant="ghost"
            >
              <PieChart className="h-4 w-4" />
              View Analytics
            </Button>
            <Button 
              onClick={() => handleQuickAction('export')} 
              className="w-full justify-start gap-2 button-hover"
              variant="ghost"
            >
              <Download className="h-4 w-4" />
              Export Data
            </Button>
          </CardContent>
        </Card>

        <Card className="card-hover border-0 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              Recent Transactions
            </CardTitle>
            <CardDescription>Latest payment activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                <span>John Doe - Grade 10A</span>
                <Badge variant="default">₹5,000</Badge>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                <span>Jane Smith - Grade 9B</span>
                <Badge variant="default">₹4,500</Badge>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                <span>Mike Johnson - Grade 8A</span>
                <Badge variant="secondary">₹3,000</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover border-0 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Financial Overview
            </CardTitle>
            <CardDescription>Key financial metrics for {branchName}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Collection Rate</span>
                <span className="font-medium">88.5%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-gradient-primary h-2 rounded-full" style={{ width: '88.5%' }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Monthly Target</span>
                <span className="font-medium">₹50,000</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-gradient-primary h-2 rounded-full" style={{ width: '90%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccountantDashboard;