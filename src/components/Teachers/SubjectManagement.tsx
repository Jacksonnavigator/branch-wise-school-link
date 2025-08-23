import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Award,
  GraduationCap,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
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
  assigned_date: string;
  is_active: boolean;
}

interface Class {
  id: string;
  name: string;
  grade_level?: number;
  section?: string;
}

interface SubjectRequest {
  id: string;
  teacher_id: string;
  subject_name: string;
  subject_code: string;
  description?: string;
  justification?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

const SubjectManagement = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [mySubjects, setMySubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [subjectRequests, setSubjectRequests] = useState<SubjectRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newSubject, setNewSubject] = useState({ 
    name: '', 
    code: '', 
    description: '',
    justification: ''
  });

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

        // Fetch teacher assignments for this teacher
        const { data: assignmentsData, error: assignmentsError } = await supabase
          .from('teacher_assignments')
          .select('*')
          .eq('teacher_id', profile.id)
          .eq('branch_id', profile.branch_id)
          .eq('is_active', true);

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

        // Fetch subject requests for this teacher
        const { data: requestsData, error: requestsError } = await supabase
          .from('subject_requests')
          .select('*')
          .eq('teacher_id', profile.id)
          .order('created_at', { ascending: false });

        if (requestsError) throw requestsError;
        setSubjectRequests(requestsData || []);

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
    subject.code?.toLowerCase().includes(searchTerm.toLowerCase())
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
        .from('subject_requests')
        .insert({
          teacher_id: profile.id,
          subject_name: newSubject.name,
          subject_code: newSubject.code,
          description: newSubject.description,
          justification: newSubject.justification,
          branch_id: profile.branch_id,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Subject request submitted successfully.",
      });

      setNewSubject({ name: '', code: '', description: '', justification: '' });
      setIsAddDialogOpen(false);
      
      // Refresh requests data
      const { data: requestsData } = await supabase
        .from('subject_requests')
        .select('*')
        .eq('teacher_id', profile.id)
        .order('created_at', { ascending: false });
      
      setSubjectRequests(requestsData || []);
    } catch (error) {
      console.error('Error adding subject request:', error);
      toast({
        title: "Error",
        description: "Failed to submit subject request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
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
          <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            My Subjects
          </h2>
          <p className="text-muted-foreground">
            Manage subjects you're assigned to teach
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 button-hover bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
              <Plus className="h-4 w-4" />
              Request New Subject
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Request New Subject</DialogTitle>
              <DialogDescription>
                Submit a request to add a new subject to the curriculum.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddSubject} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject-name">Subject Name *</Label>
                <Input
                  id="subject-name"
                  value={newSubject.name}
                  onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                  placeholder="e.g., Advanced Mathematics"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject-code">Subject Code *</Label>
                <Input
                  id="subject-code"
                  value={newSubject.code}
                  onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
                  placeholder="e.g., MATH101"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newSubject.description}
                  onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
                  placeholder="Brief description of the subject"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="justification">Justification</Label>
                <Textarea
                  id="justification"
                  value={newSubject.justification}
                  onChange={(e) => setNewSubject({ ...newSubject, justification: e.target.value })}
                  placeholder="Why is this subject needed?"
                  rows={3}
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

      {/* Subject Requests */}
      {subjectRequests.length > 0 && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              My Subject Requests
            </CardTitle>
            <CardDescription>
              Track the status of your subject requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {subjectRequests.slice(0, 3).map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium">{request.subject_name}</p>
                    <p className="text-sm text-muted-foreground">{request.subject_code}</p>
                  </div>
                  {getStatusBadge(request.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* My Subjects */}
      {filteredSubjects.length === 0 ? (
        <Card className="border-dashed border-2 border-muted-foreground/25">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <BookOpen className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Subjects Assigned</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              {searchTerm 
                ? "No subjects match your search criteria." 
                : "You haven't been assigned any subjects yet. Contact your headmaster for subject assignments or request new subjects."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSubjects.map((subject) => {
            const assignedClasses = getClassesForSubject(subject.id);
            return (
              <Card key={subject.id} className="card-hover border-0 shadow-elegant hover:shadow-glow transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
                        <BookOpen className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{subject.name}</CardTitle>
                        <CardDescription className="font-mono text-xs">
                          Code: {subject.code}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="gap-1">
                      <GraduationCap className="h-3 w-3" />
                      {assignedClasses.length} Classes
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {subject.description && (
                    <p className="text-sm text-muted-foreground">{subject.description}</p>
                  )}
                  
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
                    <Button size="sm" variant="outline" className="gap-1 hover:bg-primary/10">
                      <FileText className="h-3 w-3" />
                      Syllabus
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1 hover:bg-primary/10">
                      <Edit className="h-3 w-3" />
                      Results
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1 hover:bg-primary/10">
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