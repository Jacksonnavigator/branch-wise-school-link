import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, User, Plus, Search, GraduationCap, Mail, Phone, Trash2 } from 'lucide-react';
import { collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AddTeacherDialog from '@/components/Teachers/AddTeacherDialog';
import TeacherDetailsDialog from '@/components/Teachers/TeacherDetailsDialog';
import { useToast } from '@/hooks/use-toast';

interface Teacher {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subjects: string[];
  classes: string[];
  branchId: string;
  role: string;
}

const Teachers = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isTeacherDetailsOpen, setIsTeacherDetailsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchTeachers();
  }, [profile?.branch_id]);

  const fetchTeachers = async () => {
    if (!profile?.branch_id) return;
    
    try {
      // Fetch teachers for this branch
      const teachersQuery = query(
        collection(db, 'profiles'),
        where('role', '==', 'teacher'),
        where('branch_id', '==', profile.branch_id)
      );
      const teachersSnapshot = await getDocs(teachersQuery);
      const teachersData = teachersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        subjects: doc.data().subjects || ['Mathematics', 'Science'],
        classes: doc.data().classes || ['Grade 8A', 'Grade 9B'],
      })) as Teacher[];
      
      setTeachers(teachersData);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeacher = async (teacherId: string) => {
    if (!confirm('Are you sure you want to delete this teacher?')) return;
    
    try {
      await deleteDoc(doc(db, 'profiles', teacherId));
      setTeachers(prev => prev.filter(t => t.id !== teacherId));
      toast({
        title: "Success",
        description: "Teacher has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting teacher:', error);
      toast({
        title: "Error",
        description: "Failed to delete teacher. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.subjects.some(subject => subject.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Teachers
          </h2>
          <p className="text-muted-foreground mt-2">Manage teacher profiles and assignments</p>
        </div>
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          className="gradient-primary hover:scale-105 transition-all duration-200 shadow-soft"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Teacher
        </Button>
      </div>

      <Card className="glass shadow-elegant border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <GraduationCap className="h-5 w-5" />
            Teaching Staff
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            View and manage all teachers in your institution
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search teachers by name, email, or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 transition-all focus:scale-[1.02]"
            />
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading teachers...</p>
            </div>
          ) : filteredTeachers.length > 0 ? (
            <div className="grid gap-4">
              {filteredTeachers.map((teacher, index) => (
                <Card 
                  key={teacher.id} 
                  className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] animate-fade-in border-border"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-14 w-14 ring-2 ring-primary/20">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-primary-foreground font-semibold text-lg">
                            {teacher.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-foreground">
                              {teacher.name}
                            </h3>
                            <Badge variant={teacher.role === 'headmaster' ? 'default' : 'secondary'} className="capitalize">
                              {teacher.role}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {teacher.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {teacher.phone}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Subjects:</span>
                            <div className="flex gap-1">
                              {teacher.subjects.map((subject, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {subject}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="hover:scale-105 transition-all"
                          onClick={() => {
                            setSelectedTeacher(teacher);
                            setIsEditing(false);
                            setIsTeacherDetailsOpen(true);
                          }}
                        >
                          <User className="h-4 w-4 mr-1" />
                          View Profile
                        </Button>
                        <Button 
                          size="sm" 
                          className="gradient-primary hover:scale-105 transition-all"
                          onClick={() => {
                            setSelectedTeacher(teacher);
                            setIsEditing(true);
                            setIsTeacherDetailsOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                        {(profile?.role === 'headmaster' || profile?.role === 'admin') && (
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            className="hover:scale-105 transition-all"
                            onClick={() => handleDeleteTeacher(teacher.id)}
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
                <GraduationCap className="h-20 w-20 text-muted-foreground mx-auto animate-float" />
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary-glow/20 rounded-full blur-xl"></div>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">No Teachers Found</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                {searchTerm 
                  ? "No teachers match your search criteria. Try adjusting your search terms."
                  : "Start building your teaching staff by adding teachers to the system."
                }
              </p>
              {!searchTerm && (
                <Button 
                  onClick={() => setIsAddDialogOpen(true)}
                  className="gradient-primary hover:scale-105 transition-all duration-200 shadow-soft"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Teacher
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <AddTeacherDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onTeacherAdded={fetchTeachers}
      />

      <TeacherDetailsDialog
        open={isTeacherDetailsOpen}
        onOpenChange={setIsTeacherDetailsOpen}
        teacher={selectedTeacher}
        isEditing={isEditing}
        onTeacherUpdated={fetchTeachers}
      />
    </div>
  );
};

export default Teachers;