import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Edit, 
  Users, 
  Calendar,
  FileText,
  Award
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Subject {
  id: string;
  name: string;
  code: string;
  branch_id: string;
  created_at: string;
}

interface TeacherAssignment {
  id: string;
  teacher_id: string;
  subject_id: string;
  class_id: string;
  academic_year: string;
  branch_id: string;
}

interface Class {
  id: string;
  name: string;
}

const SubjectManagement = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [mySubjects, setMySubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', code: '' });

  useEffect(() => {
    const fetchData = async () => {
      if (!profile?.branch_id) return;

      try {
        // Fetch all subjects in branch
        const { data: subjectsData, error: subjectsError } = await supabase
          .from('subjects')
          .select('*')
          .eq('branch_id', profile.branch_id)
          .order('name');

        if (subjectsError) throw subjectsError;
        setSubjects(subjectsData || []);

        // Fetch teacher assignments
        const { data: assignmentsData, error: assignmentsError } = await supabase
          .from('teacher_assignments')
          .select('*')
          .eq('teacher_id', profile.id)
          .eq('branch_id', profile.branch_id);

        if (assignmentsError) throw assignmentsError;
        setAssignments(assignmentsData || []);

        // Filter subjects assigned to this teacher
        const mySubjectIds = assignmentsData?.map(assignment => assignment.subject_id) || [];
        const mySubjectsData = subjectsData?.filter(subject => mySubjectIds.includes(subject.id)) || [];
        setMySubjects(mySubjectsData);

        // Fetch classes
        const { data: classesData, error: classesError } = await supabase
          .from('classes')
          .select('*')
          .eq('branch_id', profile.branch_id)
          .order('name');

        if (classesError) throw classesError;
        setClasses(classesData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load subject data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [profile?.branch_id, profile?.id, toast]);

  const filteredSubjects = mySubjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getClassesForSubject = (subjectId: string) => {
    const subjectAssignments = assignments.filter(assignment => assignment.subject_id === subjectId);
    return subjectAssignments.map(assignment => {
      const cls = classes.find(c => c.id === assignment.class_id);
      return cls?.name || 'Unknown Class';
    });
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.branch_id || !newSubject.name || !newSubject.code) return;

    try {
      const { error } = await supabase
        .from('subjects')
        .insert({
          name: newSubject.name,
          code: newSubject.code,
          branch_id: profile.branch_id,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Subject request submitted successfully.",
      });

      setNewSubject({ name: '', code: '' });
      setIsAddDialogOpen(false);
      
      // Refresh data
      window.location.reload();
    } catch (error) {
      console.error('Error adding subject:', error);
      toast({
        title: "Error",
        description: "Failed to submit subject request. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-2"></div>
          <div className="h-4 bg-muted rounded w-48"></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-48 bg-muted rounded-xl"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Subjects</h2>
          <p className="text-muted-foreground">
            Manage subjects you're assigned to teach
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 button-hover">
              <Plus className="h-4 w-4" />
              Request New Subject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request New Subject</DialogTitle>
              <DialogDescription>
                Submit a request to add a new subject to the curriculum.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddSubject} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject-name">Subject Name</Label>
                <Input
                  id="subject-name"
                  value={newSubject.name}
                  onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                  placeholder="e.g., Advanced Mathematics"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject-code">Subject Code</Label>
                <Input
                  id="subject-code"
                  value={newSubject.code}
                  onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
                  placeholder="e.g., MATH101"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Submit Request</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search subjects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredSubjects.length === 0 ? (
        <Card className="border-dashed border-2 border-muted-foreground/25">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <BookOpen className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Subjects Assigned</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              {searchTerm 
                ? "No subjects match your search criteria." 
                : "You haven't been assigned any subjects yet. Contact your headmaster for subject assignments."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSubjects.map((subject) => {
            const assignedClasses = getClassesForSubject(subject.id);
            return (
              <Card key={subject.id} className="card-hover border-0 shadow-elegant">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{subject.name}</CardTitle>
                        <CardDescription>Code: {subject.code}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline">{assignedClasses.length} Classes</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>Classes: {assignedClasses.join(', ') || 'No classes assigned'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>Academic Year: 2024-25</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <Button size="sm" variant="outline" className="gap-1">
                      <FileText className="h-3 w-3" />
                      Syllabus
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1">
                      <Edit className="h-3 w-3" />
                      Results
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1">
                      <Award className="h-3 w-3" />
                      Reports
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SubjectManagement;