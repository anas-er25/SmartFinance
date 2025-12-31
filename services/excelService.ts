import * as XLSX from 'xlsx';
import { Transaction } from '../types';

export const exportTransactionsToExcel = (transactions: Transaction[]) => {
  const data = transactions.map(t => ({
    Date: new Date(t.date).toLocaleDateString(),
    Type: t.type,
    Category: t.category,
    Description: t.description,
    Amount: t.amount,
    'Is Harmful': t.isHarmful ? 'Yes' : 'No',
    'Is Unnecessary': t.isUnnecessary ? 'Yes' : 'No',
    'Analysis Reasoning': t.analysisReasoning || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
  
  // Generate file and trigger download
  XLSX.writeFile(workbook, `Finance_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
};