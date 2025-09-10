
import React, { useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Calendar, Users, GraduationCap, TrendingUp, BarChart3 } from 'lucide-react';

const Reports = () => {
  const { profile } = useAuth();
  const [selectedReportType, setSelectedReportType] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');

  const reportTypes = [
    { value: 'student-performance', label: 'Student Performance Report', icon: GraduationCap },
    { value: 'attendance', label: 'Attendance Report', icon: Users },
    { value: 'teacher-performance', label: 'Teacher Performance Report', icon: TrendingUp },
    { value: 'financial', label: 'Financial Report', icon: BarChart3 },
    { value: 'branch-summary', label: 'Branch Summary Report', icon: FileText },
  ];

  const periods = [
    { value: 'current-month', label: 'Current Month' },
    { value: 'last-month', label: 'Last Month' },
    { value: 'current-term', label: 'Current Term' },
    { value: 'last-term', label: 'Last Term' },
    { value: 'current-year', label: 'Current Academic Year' },
    { value: 'custom', label: 'Custom Date Range' },
  ];

  const handleGenerateReport = () => {
    if (!selectedReportType || !selectedPeriod) {
      alert('Please select both report type and period');
      return;
    }
    
    // Placeholder for report generation
    alert(`Generating ${reportTypes.find(r => r.value === selectedReportType)?.label} for ${periods.find(p => p.value === selectedPeriod)?.label}`);
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Generate and view comprehensive academic and administrative reports"
        actions={<Button onClick={handleGenerateReport} className="gradient-primary hover:scale-105 transition-all h-12"><Download className="h-4 w-4 mr-2" />Generate & Download Report</Button>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 glass border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <FileText className="h-5 w-5" />
              Generate Report
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Select report type and period to generate comprehensive reports
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Report Type</label>
                <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Period</label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select time period" />
                  </SelectTrigger>
                  <SelectContent>
                    {periods.map((period) => (
                      <SelectItem key={period.value} value={period.value}>
                        {period.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleGenerateReport}
                className="w-full gradient-primary hover:scale-105 transition-all h-12"
                disabled={!selectedReportType || !selectedPeriod}
              >
                <Download className="h-4 w-4 mr-2" />
                Generate & Download Report
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Calendar className="h-5 w-5" />
              Quick Stats
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Overview of key metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">This Month</span>
                  <GraduationCap className="h-4 w-4 text-primary" />
                </div>
                <p className="text-lg font-semibold text-foreground">95% Attendance</p>
              </div>
              
              <div className="p-3 bg-secondary/10 rounded-lg border border-secondary/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Current Term</span>
                  <TrendingUp className="h-4 w-4 text-secondary" />
                </div>
                <p className="text-lg font-semibold text-foreground">87% Pass Rate</p>
              </div>
              
              <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Students</span>
                  <Users className="h-4 w-4 text-accent" />
                </div>
                <p className="text-lg font-semibold text-foreground">247 Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportTypes.map((type, index) => (
          <Card 
            key={type.value} 
            className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] animate-fade-in border-border cursor-pointer"
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => setSelectedReportType(type.value)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
                  <type.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">{type.label}</p>
                  <p className="text-xs text-muted-foreground">Generate report</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Reports;
