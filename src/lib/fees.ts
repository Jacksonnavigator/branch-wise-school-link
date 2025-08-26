import { collection, addDoc, doc, getDocs, query, where, serverTimestamp, updateDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import jsPDF from 'jspdf';
import { v4 as uuidv4 } from 'uuid';

// Small contract:
// - Inputs: payment data { student_id, amount, method, note, branch_id, recorded_by }
// - Outputs: created/updated payment doc
// - Error modes: duplicate receipt, missing fields

export async function createPayment(payment: { student_id: string; amount: number; method?: string; note?: string; branch_id?: string; recorded_by?: string; receipt_id?: string }) {
  if (!payment.student_id) throw new Error('student_id required');
  if (!payment.amount || payment.amount <= 0) throw new Error('invalid amount');

  // Simple duplicate check: prevent same student/amount/branch within short window if receipt_id not provided
  if (!payment.receipt_id) {
    const recentQuery = query(
      collection(db, 'payments'),
      where('student_id', '==', payment.student_id),
      where('amount', '==', payment.amount),
      where('branch_id', '==', payment.branch_id || null)
    );
    const recent = await getDocs(recentQuery);
    if (!recent.empty) {
      // If any exact match exists, consider duplicate
      throw new Error('Duplicate payment detected');
    }
  }

  const receiptId = payment.receipt_id || uuidv4();

  const payload = {
    student_id: payment.student_id,
    amount: payment.amount,
    method: payment.method || 'cash',
    note: payment.note || null,
    branch_id: payment.branch_id || null,
    recorded_by: payment.recorded_by || null,
    receipt_id: receiptId,
    created_at: serverTimestamp()
  } as any;

  const ref = await addDoc(collection(db, 'payments'), payload);
  return { id: ref.id, ...payload };
}

export async function editPayment(paymentId: string, updates: Partial<{ amount: number; method: string; note: string }>) {
  if (!paymentId) throw new Error('paymentId required');
  const ref = doc(db, 'payments', paymentId);
  await updateDoc(ref, { ...updates, updated_at: serverTimestamp() } as any);
  const updated = await getDoc(ref);
  return { id: updated.id, ...(updated.data() as any) };
}

export function exportPaymentsToCSV(payments: any[]) {
  if (!Array.isArray(payments)) return '';
  const headers = ['id', 'student_id', 'student_name', 'amount', 'method', 'note', 'recorded_by', 'created_at', 'receipt_id'];
  const rows = payments.map(p => headers.map(h => {
    const v = p[h];
    if (v && v.toDate) return new Date(v.toDate()).toISOString();
    return v ?? '';
  }).join(','));
  return [headers.join(','), ...rows].join('\n');
}

export function generateReceiptPDF(payment: any) {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text('School Payment Receipt', 20, 20);
  doc.setFontSize(12);
  doc.text(`Receipt ID: ${payment.receipt_id || ''}`, 20, 36);
  doc.text(`Student: ${payment.student_name || payment.student_id}`, 20, 46);
  doc.text(`Amount: ₹${payment.amount}`, 20, 56);
  doc.text(`Method: ${payment.method || ''}`, 20, 66);
  doc.text(`Recorded by: ${payment.recorded_by || ''}`, 20, 76);
  doc.text(`Note: ${payment.note || ''}`, 20, 86);
  return doc.output('blob');
}
