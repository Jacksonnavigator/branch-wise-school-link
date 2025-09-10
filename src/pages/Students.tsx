import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, User, Plus, Search, BookOpen, Phone, Trash2 } from 'lucide-react';
import { collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AddStudentDialog from '@/components/student/AddStudentDialog';
import StudentDetailsDialog from '@/components/student/StudentDetailsDialog';
import { useToast } from '@/hooks/use-toast';

interface Student {
  id: string;
  full_name: string;
  admission_number: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  guardian_name: string;
  guardian_email: string;
  guardian_phone: string;
  branch_id: string;
  class_id: string;
}

const Students = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isStudentDetailsOpen, setIsStudentDetailsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, [profile?.branch_id]);

  const fetchStudents = async () => {
    if (!profile?.branch_id) return;
    
    try {
      const studentsQuery = query(
        collection(db, 'students'),
        where('branch_id', '==', profile.branch_id)
      );
      const studentsSnapshot = await getDocs(studentsQuery);
      const studentsData = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Student[];
      
      setStudents(studentsData || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    
    try {
      await deleteDoc(doc(db, 'students', studentId));
      
      setStudents(prev => prev.filter(s => s.id !== studentId));
      toast({
        title: "Success",
        description: "Student has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting student:', error);
      toast({
        title: "Error",
        description: "Failed to delete student. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredStudents = students.filter(student =>
    student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.admission_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Students
          </h2>
          <p className="text-muted-foreground mt-2">Manage student records and information</p>
        </div>
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          className="gradient-primary hover:scale-105 transition-all duration-200 shadow-soft"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Student
        </Button>
      </div>

      <Card className="glass shadow-elegant border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <BookOpen className="h-5 w-5" />
            Student Directory
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Search and manage student records across your institution
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students by name, admission number, or class..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 transition-all focus:scale-[1.02]"
            />
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading students...</p>
            </div>
          ) : filteredStudents.length > 0 ? (
            <div className="grid gap-4">
              {filteredStudents.map((student, index) => (
                <Card 
                  key={student.id} 
                  className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] animate-fade-in border-border"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-14 w-14 ring-2 ring-primary/20">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-primary-foreground font-semibold text-lg">
                            {student.full_name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold text-foreground">
                            {student.full_name}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              #{student.admission_number}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              Class ID: {student.class_id}
                            </span>
                            <span>•</span>
                            <Badge variant="outline" className="capitalize">
                              {student.gender}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              Guardian: {student.guardian_name}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {student.guardian_phone}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="hover:scale-105 transition-all"
                          onClick={() => {
                            setSelectedStudent(student);
                            setIsEditing(false);
                            setIsStudentDetailsOpen(true);
                          }}
                        >
                          <User className="h-4 w-4 mr-1" />
                          View Profile
                        </Button>
                        <Button 
                          size="sm" 
                          className="gradient-primary hover:scale-105 transition-all"
                          onClick={() => {
                            setSelectedStudent(student);
                            setIsEditing(true);
                            setIsStudentDetailsOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                        {(profile?.role === 'headmaster' || profile?.role === 'admin') && (
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            className="hover:scale-105 transition-all"
                            onClick={() => handleDeleteStudent(student.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 animate-fade-in">
              <div className="relative mb-6">
                <Users className="h-20 w-20 text-muted-foreground mx-auto animate-float" />
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary-glow/20 rounded-full blur-xl"></div>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">No Students Found</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                {searchTerm 
                  ? "No students match your search criteria. Try adjusting your search terms."
                  : "Start building your student database by adding students to the system."
                }
              </p>
              {!searchTerm && (
                <Button 
                  onClick={() => setIsAddDialogOpen(true)}
                  className="gradient-primary hover:scale-105 transition-all duration-200 shadow-soft"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Student
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <AddStudentDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onStudentAdded={fetchStudents}
      />

      <StudentDetailsDialog
        open={isStudentDetailsOpen}
        onOpenChange={setIsStudentDetailsOpen}
        student={selectedStudent}
        isEditing={isEditing}
        onStudentUpdated={fetchStudents}
      />
    </div>
  );
};

export default Students;