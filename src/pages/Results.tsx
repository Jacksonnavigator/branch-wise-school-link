import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, BookOpen, Edit, Save, X } from 'lucide-react';
import { collection, getDocs, query, where, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Student {
  id: string;
  full_name: string;
  admission_number: string;
  class: string;
}

interface Result {
  id?: string;
  student_id: string;
  subject: string;
  score: number;
  grade: string;
  term: string;
  year: string;
  teacher_id: string;
  remarks?: string;
}

const Results = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [loading, setLoading] = useState(true);
  const [isAddingResults, setIsAddingResults] = useState(false);
  const [editingResult, setEditingResult] = useState<string | null>(null);
  const [tempResults, setTempResults] = useState<{[key: string]: Partial<Result>}>({});

  const subjects = ['Mathematics', 'English', 'Science', 'Social Studies', 'Physical Education', 'Art', 'Music'];
  const terms = ['Term 1', 'Term 2', 'Term 3'];
  const classes = ['Form One', 'Form Two', 'Form Three', 'Form Four'];

  useEffect(() => {
    fetchStudents();
    fetchResults();
  }, [profile?.branch_id, selectedClass, selectedSubject, selectedTerm, selectedYear]);

  const fetchStudents = async () => {
    if (!profile?.branch_id) return;
    
    try {
      let studentsQuery = query(
        collection(db, 'students'),
        where('branch_id', '==', profile.branch_id)
      );

      if (selectedClass) {
        studentsQuery = query(studentsQuery, where('class', '==', selectedClass));
      }

      const studentsSnapshot = await getDocs(studentsQuery);
      const studentsData = studentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Student[];
      
      setStudents(studentsData);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchResults = async () => {
    try {
      const resultsSnapshot = await getDocs(collection(db, 'academic_results'));
      const resultsData = resultsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Result[];
      
      setResults(resultsData);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateGrade = (score: number): string => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B+';
    if (score >= 60) return 'B';
    if (score >= 50) return 'C+';
    if (score >= 40) return 'C';
    if (score >= 30) return 'D';
    return 'F';
  };

  const handleAddResults = async () => {
    if (!selectedClass || !selectedSubject || !selectedTerm || !selectedYear) {
      toast({
        title: "Error",
        description: "Please select class, subject, term, and year first.",
        variant: "destructive",
      });
      return;
    }

    setIsAddingResults(true);
    const newTempResults: {[key: string]: Partial<Result>} = {};
    
    students.forEach(student => {
      const existingResult = results.find(r => 
        r.student_id === student.id && 
        r.subject === selectedSubject && 
        r.term === selectedTerm && 
        r.year === selectedYear
      );
      
      if (!existingResult) {
        newTempResults[student.id] = {
          student_id: student.id,
          subject: selectedSubject,
          term: selectedTerm,
          year: selectedYear,
          teacher_id: profile?.id || '',
          score: 0,
          grade: 'F',
          remarks: ''
        };
      }
    });
    
    setTempResults(newTempResults);
  };

  const handleSaveResult = async (studentId: string) => {
    const tempResult = tempResults[studentId];
    if (!tempResult || !tempResult.score) return;

    try {
      const score = Number(tempResult.score);
      const grade = calculateGrade(score);
      
      await addDoc(collection(db, 'academic_results'), {
        ...tempResult,
        score,
        grade,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      toast({
        title: "Success",
        description: "Result saved successfully.",
      });

      // Remove from temp results
      const newTempResults = { ...tempResults };
      delete newTempResults[studentId];
      setTempResults(newTempResults);
      
      fetchResults();
    } catch (error) {
      console.error('Error saving result:', error);
      toast({
        title: "Error",
        description: "Failed to save result. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateResult = async (resultId: string, updatedData: Partial<Result>) => {
    try {
      const score = Number(updatedData.score);
      const grade = calculateGrade(score);
      
      await updateDoc(doc(db, 'academic_results', resultId), {
        ...updatedData,
        score,
        grade,
        updated_at: new Date().toISOString()
      });

      toast({
        title: "Success",
        description: "Result updated successfully.",
      });

      setEditingResult(null);
      fetchResults();
    } catch (error) {
      console.error('Error updating result:', error);
      toast({
        title: "Error",
        description: "Failed to update result. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredStudents = students.filter(student =>
    student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.admission_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStudentResults = (studentId: string) => {
    return results.filter(result => 
      result.student_id === studentId &&
      (!selectedSubject || result.subject === selectedSubject) &&
      (!selectedTerm || result.term === selectedTerm) &&
      (!selectedYear || result.year === selectedYear)
    );
  };

  if (profile?.role !== 'teacher' && profile?.role !== 'headmaster') {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h3>
            <p className="text-gray-600">
              Only teachers and headmasters can manage academic results.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Academic Results
          </h2>
          <p className="text-muted-foreground mt-2">Manage student academic performance and grades</p>
        </div>
        <Button 
          onClick={handleAddResults}
          className="gradient-primary hover:scale-105 transition-all duration-200 shadow-soft"
          disabled={!selectedClass || !selectedSubject || !selectedTerm}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Results
        </Button>
      </div>

      <Card className="glass shadow-elegant border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <BookOpen className="h-5 w-5" />
            Results Management
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Filter and manage academic results for your students
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="class">Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map(cls => (
                    <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(subject => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="term">Term</Label>
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger>
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  {terms.map(term => (
                    <SelectItem key={term} value={term}>{term}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="search">Search Students</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading results...</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Admission No.</TableHead>
                    <TableHead>Class</TableHead>
                    {selectedSubject && <TableHead>Score</TableHead>}
                    {selectedSubject && <TableHead>Grade</TableHead>}
                    {selectedSubject && <TableHead>Remarks</TableHead>}
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => {
                    const studentResults = getStudentResults(student.id);
                    const hasResult = studentResults.length > 0;
                    const result = studentResults[0];
                    const hasTempResult = tempResults[student.id];

                    return (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.full_name}</TableCell>
                        <TableCell>{student.admission_number}</TableCell>
                        <TableCell>{student.class}</TableCell>
                        {selectedSubject && (
                          <>
                            <TableCell>
                              {editingResult === result?.id ? (
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  defaultValue={result?.score || 0}
                                  className="w-20"
                                  onChange={(e) => {
                                    const updatedResults = { ...tempResults };
                                    updatedResults[student.id] = {
                                      ...result,
                                      score: Number(e.target.value)
                                    };
                                    setTempResults(updatedResults);
                                  }}
                                />
                              ) : hasTempResult ? (
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={tempResults[student.id]?.score || 0}
                                  className="w-20"
                                  onChange={(e) => {
                                    const updatedResults = { ...tempResults };
                                    updatedResults[student.id] = {
                                      ...updatedResults[student.id],
                                      score: Number(e.target.value)
                                    };
                                    setTempResults(updatedResults);
                                  }}
                                />
                              ) : (
                                result?.score || '-'
                              )}
                            </TableCell>
                            <TableCell>
                              {hasTempResult ? (
                                <Badge variant="outline">
                                  {calculateGrade(Number(tempResults[student.id]?.score) || 0)}
                                </Badge>
                              ) : result ? (
                                <Badge variant={result.grade.startsWith('A') ? 'default' : result.grade.startsWith('B') ? 'secondary' : 'destructive'}>
                                  {result.grade}
                                </Badge>
                              ) : '-'}
                            </TableCell>
                            <TableCell>
                              {editingResult === result?.id ? (
                                <Input
                                  defaultValue={result?.remarks || ''}
                                  placeholder="Add remarks..."
                                  className="w-32"
                                  onChange={(e) => {
                                    const updatedResults = { ...tempResults };
                                    updatedResults[student.id] = {
                                      ...result,
                                      remarks: e.target.value
                                    };
                                    setTempResults(updatedResults);
                                  }}
                                />
                              ) : hasTempResult ? (
                                <Input
                                  value={tempResults[student.id]?.remarks || ''}
                                  placeholder="Add remarks..."
                                  className="w-32"
                                  onChange={(e) => {
                                    const updatedResults = { ...tempResults };
                                    updatedResults[student.id] = {
                                      ...updatedResults[student.id],
                                      remarks: e.target.value
                                    };
                                    setTempResults(updatedResults);
                                  }}
                                />
                              ) : (
                                result?.remarks || '-'
                              )}
                            </TableCell>
                          </>
                        )}
                        <TableCell>
                          {hasTempResult ? (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => handleSaveResult(student.id)}
                                className="h-8 w-8 p-0"
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const newTempResults = { ...tempResults };
                                  delete newTempResults[student.id];
                                  setTempResults(newTempResults);
                                }}
                                className="h-8 w-8 p-0"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : result ? (
                            editingResult === result.id ? (
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateResult(result.id!, tempResults[student.id])}
                                  className="h-8 w-8 p-0"
                                >
                                  <Save className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingResult(null)}
                                  className="h-8 w-8 p-0"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingResult(result.id!)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )
                          ) : selectedSubject ? (
                            <span className="text-muted-foreground text-sm">No result</span>
                          ) : (
                            <span className="text-muted-foreground text-sm">Select subject</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {isAddingResults && Object.keys(tempResults).length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 font-medium">
                {Object.keys(tempResults).length} new result(s) ready to be saved. 
                Enter scores and click the save button for each student.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Results;