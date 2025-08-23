
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'headmaster' | 'teacher' | 'parent' | 'accountant';
  branchId: string;
  profilePhoto?: string;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
}

export interface Student {
  id: string;
  fullName: string;
  gender: 'male' | 'female';
  dateOfBirth: string;
  admissionNumber: string;
  profilePhoto?: string;
  class: string;
  parentId: string;
  branchId: string;
  parentContact: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface AcademicResult {
  id: string;
  studentId: string;
  subject: string;
  term: string;
  year: string;
  score: number;
  grade: string;
  remarks?: string;
  teacherId: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  remarks?: string;
}

export interface BehaviorNote {
  id: string;
  studentId: string;
  type: 'good' | 'warning' | 'punishment' | 'counselor';
  note: string;
  date: string;
  teacherId: string;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  term: string;
  year: string;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  dueDate: string;
  paymentDate?: string;
  receiptUrl?: string;
}
