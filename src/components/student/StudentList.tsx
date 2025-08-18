
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Student } from '@/types';
import { Users, User } from 'lucide-react';

const StudentList = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // No mock data - will fetch from Firebase when data is available
  const students: Student[] = [];

  const filteredStudents = students.filter(student =>
    student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.class.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground animate-fade-in">Students</h2>
          <p className="text-muted-foreground animate-fade-in">Manage student records and information</p>
        </div>
        <Button className="gradient-primary hover:scale-105 transition-all duration-200 shadow-soft">
          <Users className="h-4 w-4 mr-2" />
          Add Student
        </Button>
      </div>

      <Card className="glass shadow-elegant border-0 animate-fade-in">
        <CardHeader>
          <CardTitle className="text-foreground">Student Directory</CardTitle>
          <CardDescription className="text-muted-foreground">
            Search and manage student records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Input
              placeholder="Search students by name, admission number, or class..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          <div className="grid gap-4">
            {filteredStudents.map((student) => (
              <Card key={student.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>
                          {student.fullName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {student.fullName}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>#{student.admissionNumber}</span>
                          <span>•</span>
                          <span>{student.class}</span>
                          <span>•</span>
                          <Badge variant="outline" className="capitalize">
                            {student.gender}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Parent: {student.parentContact.name} • {student.parentContact.phone}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <User className="h-4 w-4 mr-1" />
                        View Profile
                      </Button>
                      <Button size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-12 animate-fade-in">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 animate-float" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Students Yet</h3>
              <p className="text-muted-foreground mb-6">Start building your student database by adding students to the system.</p>
              <Button className="gradient-primary hover:scale-105 transition-all duration-200">
                <Users className="h-4 w-4 mr-2" />
                Add First Student
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentList;
