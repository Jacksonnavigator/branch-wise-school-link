import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import PageHeader from '@/components/ui/PageHeader';
import ClassManagement from '@/components/Teachers/ClassManagement';
import { Navigate } from 'react-router-dom';

const MyClasses = () => {
  const { profile } = useAuth();

  if (!profile) {
    return <Navigate to="/auth" replace />;
  }

  if (profile?.role !== 'teacher') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="p-6">
      <PageHeader title="My Classes" subtitle="Manage your classes and students" />
      <ClassManagement />
    </div>
  );
};

export default MyClasses;