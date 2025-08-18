
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Children = () => {
  return (
    <div className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">My Children</h2>
          <p className="text-gray-600">View your children's academic progress</p>
        </div>
        
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
