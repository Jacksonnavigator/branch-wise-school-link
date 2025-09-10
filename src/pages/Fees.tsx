
import React, { useEffect, useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { collection, getDocs, query, where, deleteDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { exportPaymentsToCSV, generateReceiptPDF, createPayment } from '@/lib/fees';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<'all' | string>('all');
  const [periodFilter, setPeriodFilter] = useState<'all' | '7' | '30'>('all');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [exporting, setExporting] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Derived filtered & paginated lists
  const getCreatedAtDate = (p: Payment) => {
    if (!p.created_at) return new Date(0);
    if (typeof (p.created_at as any).toDate === 'function') return (p.created_at as any).toDate();
    if (typeof p.created_at === 'number') return new Date(p.created_at);
    if (p.created_at instanceof Date) return p.created_at as Date;
    try { return new Date(p.created_at as any); } catch { return new Date(0); }
  };

  const filteredPayments = payments.filter(p => {
    // search
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      const matchesName = (p.student_name || '')!.toLowerCase().includes(q);
      const matchesId = (p.student_id || '')!.toLowerCase().includes(q);
      if (!matchesName && !matchesId) return false;
    }

    // method filter
    if (methodFilter && methodFilter !== 'all' && p.method !== methodFilter) return false;

    // period filter
    if (periodFilter && periodFilter !== 'all') {
      const days = Number(periodFilter);
      if (!isNaN(days)) {
        const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const created = getCreatedAtDate(p);
        if (created < cutoff) return false;
      }
    }

    return true;
  });

  const pageCount = Math.max(1, Math.ceil(filteredPayments.length / pageSize));
  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [pageCount]);

  const paginatedPayments = filteredPayments.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    if (!profile?.branch_id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // fetch students for branch
        try {
          const studentsQuery = query(collection(db, 'students'), where('branch_id', '==', profile.branch_id));
          const studentsSnap = await getDocs(studentsQuery);
          const studentsData = studentsSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Student[];
          setStudents(studentsData || []);
        } catch (err) {
          console.error('Failed fetching students for branch', profile.branch_id, err);
          toast({ title: 'Error', description: `Failed to load students: ${(err as any)?.message || String(err)}`, variant: 'destructive' });
        }

        // fetch payments for branch
        try {
          // Avoid requiring a composite index for branch_id + created_at by ordering client-side
          const paymentsQuery = query(collection(db, 'payments'), where('branch_id', '==', profile.branch_id));
          const paymentsSnap = await getDocs(paymentsQuery);
          const paymentsData = paymentsSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Payment[];
          // sort by created_at descending on the client
          paymentsData.sort((a, b) => getCreatedAtDate(b).getTime() - getCreatedAtDate(a).getTime());
          setPayments(paymentsData || []);
        } catch (err) {
          console.error('Failed fetching payments for branch', profile.branch_id, err);
          toast({ title: 'Error', description: `Failed to load payments: ${(err as any)?.message || String(err)}`, variant: 'destructive' });
        }

      } catch (error) {
        console.error('Unexpected error loading fees data:', error);
        toast({ title: 'Error', description: `Failed to load fees data: ${(error as any)?.message || String(error)}`, variant: 'destructive' });
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
              <div className="flex items-center gap-3 mb-4">
                <Input placeholder="Search by student name or id..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }} />
                <Select value={methodFilter} onValueChange={(v) => { setMethodFilter(v); setPage(1); }}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={periodFilter} onValueChange={(v) => { setPeriodFilter(v as any); setPage(1); }}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any time</SelectItem>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                  </SelectContent>
                </Select>
                <div className="ml-auto flex items-center gap-2">
                  <Button className="gradient-primary" onClick={async () => {
                    setExporting(true);
                    try {
                      const csv = exportPaymentsToCSV(filteredPayments);
                      const blob = new Blob([csv], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `payments-${profile.branch_id || 'all'}.csv`;
                      a.click();
                      URL.revokeObjectURL(url);
                      toast({ title: 'Exported', description: 'CSV exported' });
                    } catch (e) {
                      console.error(e);
                      toast({ title: 'Error', description: 'Export failed', variant: 'destructive' });
                    } finally {
                      setExporting(false);
                    }
                  }} disabled={exporting}>{exporting ? 'Exporting...' : 'Export CSV'}</Button>
                </div>
              </div>

              {loading ? (
                <p className="text-muted-foreground">Loading payments...</p>
              ) : filteredPayments.length === 0 ? (
                <p className="text-muted-foreground">No payments match your criteria.</p>
              ) : (
                <div className="space-y-3">
                  {paginatedPayments.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-card rounded-md border border-border">
                      <div>
                        <div className="font-medium text-foreground">{p.student_name || p.student_id} <span className="text-sm text-muted-foreground">{p.student_name ? `• #${p.student_id}` : ''}</span></div>
                        <div className="text-sm text-muted-foreground">{p.method || 'N/A'} • {p.note || ''}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-lg font-semibold">₹{p.amount.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">{p.created_at?.toDate ? new Date(p.created_at.toDate()).toLocaleString() : ''}</div>
                        <Button size="sm" onClick={async () => {
                          setDownloadingId(p.id);
                          try {
                            const result = await generateReceiptPDF(p);
                            if (result && (result as any).receipt_id && typeof result !== 'string' && (result as any).ok !== false) {
                              // If it's a blob-like object, try to download
                              if (result instanceof Blob) {
                                const url = URL.createObjectURL(result);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `receipt-${p.id}.pdf`;
                                a.click();
                                URL.revokeObjectURL(url);
                              } else if ((result as any).ok === true) {
                                toast({ title: 'Receipt', description: 'Receipt generation placeholder (test environment).' });
                              } else if ((result as any).error) {
                                toast({ title: 'Error', description: 'Receipt generation failed', variant: 'destructive' });
                              }
                            } else {
                              // Handle when generateReceiptPDF returns a doc output (string)
                              if (result && typeof result === 'string') {
                                const blob = new Blob([result], { type: 'application/pdf' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `receipt-${p.id}.pdf`;
                                a.click();
                                URL.revokeObjectURL(url);
                              } else {
                                toast({ title: 'Receipt', description: 'Receipt generated (placeholder).'});
                              }
                            }
                          } catch (e) {
                            console.error('Receipt error', e);
                            toast({ title: 'Error', description: 'Failed to generate receipt', variant: 'destructive' });
                          } finally {
                            setDownloadingId(null);
                          }
                        }}>{downloadingId === p.id ? 'Downloading...' : 'Download Receipt'}</Button>
                        {(profile.role === 'admin' || profile.role === 'headmaster' || profile.role === 'accountant') && (
                          <Button variant="destructive" size="sm" onClick={() => handleDeletePayment(p.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center justify-between mt-4">
                    <div>
                      Page {page} of {Math.max(1, Math.ceil(filteredPayments.length / pageSize))}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
                      <Button size="sm" onClick={() => setPage(p => Math.min(Math.ceil(filteredPayments.length / pageSize), p + 1))} disabled={page >= Math.ceil(filteredPayments.length / pageSize)}>Next</Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Fees;
