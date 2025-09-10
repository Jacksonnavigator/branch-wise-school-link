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
import { Calendar, Search, Users, Check, X, Clock, Save } from 'lucide-react';
import { collection, getDocs, query, where, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Student {
  id: string;
  full_name: string;
  admission_number: string;
  class_id: string;
}

interface AttendanceRecord {
  id?: string;
  student_id: string;
  date: string;
  present: boolean;
  remarks?: string;
}

const Attendance = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState<{[key: string]: AttendanceRecord}>({});
  const [isMarkingAttendance, setIsMarkingAttendance] = useState(false);

  const classes = ['Form One', 'Form Two', 'Form Three', 'Form Four'];

  useEffect(() => {
    fetchStudents();
    fetchAttendance();
  }, [profile?.branch_id, selectedClass, selectedDate]);

  const fetchStudents = async () => {
    if (!profile?.branch_id) return;
    
    try {
      let studentsQuery = query(
        collection(db, 'students'),
        where('branch_id', '==', profile.branch_id)
      );

      if (selectedClass) {
        studentsQuery = query(studentsQuery, where('class_id', '==', selectedClass));
      }

      const studentsSnapshot = await getDocs(studentsQuery);
      const studentsData = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Student[];
      
      setStudents(studentsData || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchAttendance = async () => {
    try {
      const attendanceQuery = query(
        collection(db, 'attendance'),
        where('date', '==', selectedDate)
      );
      const attendanceSnapshot = await getDocs(attendanceQuery);
      const attendanceData = attendanceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AttendanceRecord[];
      
      setAttendanceRecords(attendanceData || []);
      
      // Initialize attendance data for current date
      const attendanceMap: {[key: string]: AttendanceRecord} = {};
      (attendanceData || []).forEach((record: any) => {
        attendanceMap[record.student_id] = {
          ...record,
          status: record.present ? 'present' : 'absent'
        } as any;
      });
      setAttendanceData(attendanceMap);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = () => {
    if (!selectedClass) {
      toast({
        title: "Error",
        description: "Please select a class first.",
        variant: "destructive",
      });
      return;
    }

    setIsMarkingAttendance(true);
    
    // Initialize attendance for students who don't have records for today
    const newAttendanceData = { ...attendanceData };
    students.forEach(student => {
      if (!newAttendanceData[student.id]) {
        newAttendanceData[student.id] = {
          student_id: student.id,
          date: selectedDate,
          present: true,
          remarks: ''
        } as any;
      }
    });
    setAttendanceData(newAttendanceData);
  };

  const handleAttendanceChange = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        present: status === 'present',
        status
      } as any
    }));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks
      }
    }));
  };

  const handleSaveAttendance = async () => {
    try {
      const promises = Object.values(attendanceData).map(async (record) => {
        if (record.id) {
          // Update existing record
          const attendanceRef = doc(db, 'attendance', record.id);
          await updateDoc(attendanceRef, {
            present: (record as any).present,
            remarks: record.remarks
          });
        } else {
          // Create new record
          await addDoc(collection(db, 'attendance'), {
            student_id: record.student_id,
            date: record.date,
            present: (record as any).present,
            remarks: record.remarks || '',
            branch_id: profile?.branch_id || '',
            teacher_id: profile?.id || ''
          });
        }
      });

      await Promise.all(promises);

      toast({
        title: "Success",
        description: "Attendance saved successfully.",
      });

      setIsMarkingAttendance(false);
      fetchAttendance();
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast({
        title: "Error",
        description: "Failed to save attendance. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getAttendanceStats = () => {
    const totalStudents = students.length;
    const presentCount = Object.values(attendanceData).filter(record => (record as any).status === 'present').length;
    const absentCount = Object.values(attendanceData).filter(record => (record as any).status === 'absent').length;
    const lateCount = Object.values(attendanceData).filter(record => (record as any).status === 'late').length;

    return { totalStudents, presentCount, absentCount, lateCount };
  };

  const filteredStudents = students.filter(student =>
    student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.admission_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = getAttendanceStats();

  if (profile?.role !== 'teacher' && profile?.role !== 'headmaster') {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h3>
            <p className="text-gray-600">
              Only teachers and headmasters can manage attendance records.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <PageHeader
        title="Attendance Management"
        subtitle="Track and manage student attendance records"
        actions={(
          <div className="flex space-x-2">
            {isMarkingAttendance ? (
              <>
                <Button 
                  onClick={handleSaveAttendance}
                  className="gradient-primary hover:scale-105 transition-all duration-200 shadow-soft"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Attendance
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setIsMarkingAttendance(false);
                    fetchAttendance();
                  }}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button 
                onClick={handleMarkAttendance}
                className="gradient-primary hover:scale-105 transition-all duration-200 shadow-soft"
                disabled={!selectedClass}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Mark Attendance
              </Button>
            )}
          </div>
        )}
      />

      {/* Quick Stats */}
      {selectedClass && Object.keys(attendanceData).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.totalStudents}</p>
              <p className="text-sm text-gray-600">Total Students</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{stats.presentCount}</p>
              <p className="text-sm text-gray-600">Present</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-red-600">{stats.absentCount}</p>
              <p className="text-sm text-gray-600">Absent</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.lateCount}</p>
              <p className="text-sm text-gray-600">Late</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="glass shadow-elegant border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Calendar className="h-5 w-5" />
            Daily Attendance
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Select class and date to view or mark attendance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Label htmlFor="date">Date</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
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
              <p className="text-muted-foreground">Loading attendance data...</p>
            </div>
          ) : selectedClass ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Admission No.</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => {
                    const attendanceRecord = attendanceData[student.id];
                    
                    return (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.full_name}</TableCell>
                        <TableCell>{student.admission_number}</TableCell>
                        <TableCell>{student.class_id}</TableCell>
                        <TableCell>
                          {isMarkingAttendance || !attendanceRecord ? (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant={(attendanceRecord as any)?.status === 'present' ? 'default' : 'outline'}
                                onClick={() => handleAttendanceChange(student.id, 'present')}
                                className="h-8 w-8 p-0"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant={(attendanceRecord as any)?.status === 'late' ? 'default' : 'outline'}
                                onClick={() => handleAttendanceChange(student.id, 'late')}
                                className="h-8 w-8 p-0"
                              >
                                <Clock className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant={(attendanceRecord as any)?.status === 'absent' ? 'destructive' : 'outline'}
                                onClick={() => handleAttendanceChange(student.id, 'absent')}
                                className="h-8 w-8 p-0"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Badge 
                              variant={
                                (attendanceRecord as any).status === 'present' ? 'default' :
                                (attendanceRecord as any).status === 'late' ? 'secondary' : 'destructive'
                              }
                              className="capitalize"
                            >
                              {(attendanceRecord as any).status}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {isMarkingAttendance || !attendanceRecord ? (
                            <Input
                              value={attendanceRecord?.remarks || ''}
                              placeholder="Add remarks..."
                              className="w-32"
                              onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                            />
                          ) : (
                            attendanceRecord.remarks || '-'
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Please select a class to view attendance records.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Attendance;