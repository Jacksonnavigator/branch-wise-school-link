
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AdminDashboard from '@/components/Dashboard/AdminDashboard';
import ParentDashboard from '@/components/Dashboard/ParentDashboard';
import HeadmasterDashboard from '@/components/Dashboard/HeadmasterDashboard';
import TeacherDashboard from '@/components/Dashboard/TeacherDashboard';
import AccountantDashboard from '@/components/Dashboard/AccountantDashboard';

const Dashboard = () => {
  const { user, profile } = useAuth();

  if (!user) return null;

  const renderDashboard = () => {
    switch (profile?.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'parent':
        return <ParentDashboard />;
      case 'headmaster':
        return <HeadmasterDashboard />;
      case 'teacher':
        return <TeacherDashboard />;
      case 'accountant':
        return <AccountantDashboard />;
      default:
        return <div>Dashboard not available for this role.</div>;
    }
  };

  return (
    <div className="p-6">
      {renderDashboard()}
    </div>
  );
};

export default Dashboard;
