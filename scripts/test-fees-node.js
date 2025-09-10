(async () => {
  try {
    const fees = require('../src/lib/fees');
    const csv = fees.exportPaymentsToCSV([{ id: '1', student_id: 's1', student_name: 'Alice', amount: 500, method: 'cash', note: '', recorded_by: 'u1', created_at: null, receipt_id: 'r1' }]);
    console.log('CSV OK', csv.includes('Alice'));
    const pdf = await fees.generateReceiptPDF({ receipt_id: 'r1', student_name: 'Alice', amount: 500 });
    console.log('PDF result', pdf && pdf.receipt_id);
  } catch (e) {
    console.error('error', e && e.stack ? e.stack : e);
    process.exit(1);
  }
})();
