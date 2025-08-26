import { describe, it, expect } from 'vitest';
import { exportPaymentsToCSV, generateReceiptPDF } from '../fees';

describe('fees utilities', () => {
  it('exports payments to CSV', () => {
    const payments = [{ id: '1', student_id: 's1', student_name: 'Alice', amount: 500, method: 'cash', note: '', recorded_by: 'u1', created_at: null, receipt_id: 'r1' }];
    const csv = exportPaymentsToCSV(payments);
    expect(csv).toContain('student_id,student_name');
    expect(csv).toContain('Alice');
  });

  it('generates a PDF blob for receipt', () => {
    const payment = { receipt_id: 'r1', student_name: 'Alice', amount: 500, method: 'cash', recorded_by: 'u1', note: 'Test' };
    const blob = generateReceiptPDF(payment);
    expect(blob).toBeDefined();
  });
});
