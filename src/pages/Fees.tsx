
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { collection, getDocs, query, where, addDoc, serverTimestamp, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Users, Plus, Trash2, DollarSign } from 'lucide-react';

interface Student {
  id: string;
  full_name: string;
  admission_number?: string;
  branch_id?: string;
}

interface Payment {
  id: string;
  student_id: string;
  student_name?: string;
  amount: number;
  method?: string;
  note?: string;
  created_at?: any;
  recorded_by?: string;
}

const Fees = () => {
  const { profile } = useAuth();
  const { toast } = useToast();

  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [selectedStudent, setSelectedStudent] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('cash');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!profile?.branch_id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // fetch students for branch
        const studentsQuery = query(collection(db, 'students'), where('branch_id', '==', profile.branch_id));
        const studentsSnap = await getDocs(studentsQuery);
        const studentsData = studentsSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Student[];
        setStudents(studentsData || []);

        // fetch payments for branch
        const paymentsQuery = query(collection(db, 'payments'), where('branch_id', '==', profile.branch_id), orderBy('created_at', 'desc'));
        const paymentsSnap = await getDocs(paymentsQuery);
        const paymentsData = paymentsSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Payment[];
        setPayments(paymentsData || []);
      } catch (error) {
        console.error('Error loading fees data:', error);
        toast({ title: 'Error', description: 'Failed to load fees data', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [profile?.branch_id, toast]);

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return toast({ title: 'Error', description: 'Select a student', variant: 'destructive' });
    const parsed = Number(amount);
    if (!parsed || parsed <= 0) return toast({ title: 'Error', description: 'Enter a valid amount', variant: 'destructive' });
    setSubmitting(true);

    try {
      const student = students.find(s => s.id === selectedStudent);
      const payload = {
        student_id: selectedStudent,
        student_name: student?.full_name || null,
        amount: parsed,
        method,
        note: note || null,
        branch_id: profile?.branch_id || null,
        recorded_by: profile?.id || null,
        created_at: serverTimestamp()
      } as any;

      const ref = await addDoc(collection(db, 'payments'), payload);
      setPayments(prev => [{ id: ref.id, ...payload }, ...prev]);
      setSelectedStudent('');
      setAmount('');
      setMethod('cash');
      setNote('');
      toast({ title: 'Success', description: 'Payment recorded' });
    } catch (error) {
      console.error('Error adding payment:', error);
      toast({ title: 'Error', description: 'Failed to record payment', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm('Delete this payment?')) return;
    try {
      await deleteDoc(doc(db, 'payments', paymentId));
      setPayments(prev => prev.filter(p => p.id !== paymentId));
      toast({ title: 'Deleted', description: 'Payment removed' });
    } catch (error) {
      console.error('Error deleting payment:', error);
      toast({ title: 'Error', description: 'Failed to delete payment', variant: 'destructive' });
    }
  };

  if (!profile) return null;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">Fee Management</h2>
          <p className="text-muted-foreground mt-2">Record payments, generate receipts and track balances for {profile && profile.branch_id ? 'your campus' : 'the system'}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="capitalize">Role: {profile.role}</Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="glass shadow-elegant md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><DollarSign className="h-4 w-4" /> Record Payment</CardTitle>
            <CardDescription>Quickly add a fee payment</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddPayment} className="space-y-4">
              <div>
                <Label>Student</Label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.full_name} {s.admission_number ? `- #${s.admission_number}` : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Amount</Label>
                <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" type="number" />
              </div>

              <div>
                <Label>Method</Label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Note (optional)</Label>
                <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note" />
              </div>

              <div className="flex items-center justify-end">
                <Button type="submit" className="gradient-primary" disabled={submitting}>{submitting ? 'Saving...' : 'Record Payment'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="glass shadow-elegant md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="h-4 w-4" /> Recent Payments</CardTitle>
            <CardDescription>Latest payments for this campus</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Loading payments...</p>
            ) : payments.length === 0 ? (
              <p className="text-muted-foreground">No payments recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {payments.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-card rounded-md border border-border">
                    <div>
                      <div className="font-medium text-foreground">{p.student_name || p.student_id} <span className="text-sm text-muted-foreground">{p.student_name ? `• #${p.student_id}` : ''}</span></div>
                      <div className="text-sm text-muted-foreground">{p.method || 'N/A'} • {p.note || ''}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-lg font-semibold">₹{p.amount.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">{p.created_at?.toDate ? new Date(p.created_at.toDate()).toLocaleString() : ''}</div>
                      {(profile.role === 'admin' || profile.role === 'headmaster' || profile.role === 'accountant') && (
                        <Button variant="destructive" size="sm" onClick={() => handleDeletePayment(p.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Fees;
