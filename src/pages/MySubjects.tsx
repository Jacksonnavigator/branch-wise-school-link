import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import PageHeader from '@/components/ui/PageHeader';
import SubjectManagement from '@/components/Teachers/SubjectManagement';
import { Navigate } from 'react-router-dom';

const MySubjects = () => {
  const { profile } = useAuth();

  if (!profile) {
    return <Navigate to="/auth" replace />;
  }

  if (profile?.role !== 'teacher') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="p-6">
      <PageHeader title="My Subjects" subtitle="Manage the subjects you teach" />
      <SubjectManagement />
    </div>
  );
};

export default MySubjects;