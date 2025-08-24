import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import SubjectManagement from '@/components/Teachers/SubjectManagement';
import Header from '@/components/Layout/Header';
import Sidebar from '@/components/Layout/Sidebar';
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
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <SubjectManagement />
        </main>
      </div>
    </div>
  );
};

export default MySubjects;