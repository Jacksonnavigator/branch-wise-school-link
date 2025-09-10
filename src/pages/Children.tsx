
import React from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Children = () => {
  return (
    <div className="p-6">
      <PageHeader title="My Children" subtitle="View your children's academic progress" />
      <div className="space-y-6">
        
        <Card>
          <CardHeader>
            <CardTitle>Children's Overview</CardTitle>
            <CardDescription>
              Access your children's academic records and progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              This page will show your children's academic performance, 
              attendance records, fee status, and behavior notes.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Children;
