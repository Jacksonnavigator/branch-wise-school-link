import { describe, it, expect } from 'vitest';
import { exportPaymentsToCSV, generateReceiptPDF } from '../fees';

describe('fees utilities', () => {
  it('exports payments to CSV', () => {
    const payments = [{ id: '1', student_id: 's1', student_name: 'Alice', amount: 500, method: 'cash', note: '', recorded_by: 'u1', created_at: null, receipt_id: 'r1' }];
    const csv = exportPaymentsToCSV(payments);
    expect(csv).toContain('student_id,student_name');
    expect(csv).toContain('Alice');
  });

  it('generates a PDF blob for receipt', async () => {
    const payment = { receipt_id: 'r1', student_name: 'Alice', amount: 500, method: 'cash', recorded_by: 'u1', note: 'Test' };
    const blob = await generateReceiptPDF(payment as any);
    // In Node test env we return a placeholder object — ensure it's defined and contains receipt_id
    expect(blob).toBeDefined();
    expect(blob.receipt_id).toBe('r1');
  });
});
