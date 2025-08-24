import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import SubjectManagement from '@/components/Teachers/SubjectManagement';
import Header from '@/components/Layout/Header';
import Sidebar from '@/components/Layout/Sidebar';

const MySubjects = () => {
  const { profile } = useAuth();

  if (profile?.role !== 'teacher') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-muted-foreground">Access Denied</h1>
              <p className="text-muted-foreground">This page is only accessible to teachers.</p>
            </div>
          </main>
        </div>
      </div>
    );
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