import Papa from 'papaparse';
import { Transaction } from '@/types';

interface ParseResult {
  data: any[];
  errors: any[];
  meta: any;
}

// Helper function to normalize date to ISO format
const normalizeDate = (dateInput: string | Date): string => {
  if (dateInput instanceof Date) {
    return dateInput.toISOString().split('T')[0];
  }

  // Try to parse various date formats
  const date = new Date(dateInput);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0];
  }

  // If parsing fails, return original string (caller should handle validation)
  return dateInput;
};

// Parse CSV file using PapaParse with worker mode for large files
export const parseCSV = (file: File): Promise<Transaction[]> => {
  return new Promise((resolve, reject) => {
    // Use worker mode for better performance on large files
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      worker: true, // Enable worker mode for non-blocking parsing
      complete: (results: { data: any[] }) => {
        try {
          if (!results.data || results.data.length === 0) {
            resolve([]);
            return;
          }

          const transactions: Transaction[] = results.data
            .map((row) => ({
              id: row.id || `${row.merchant}-${row.date}-${row.amount}`,
              date: normalizeDate(row.date),
              merchant: row.merchant || row.description || row.name || '',
              amount: parseFloat(row.amount) || 0,
            }))
            .filter((t: Transaction) => t.merchant && t.amount > 0);

          resolve(transactions);
        } catch (error) {
          reject(new Error(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      },
      error: (error: { message: string }) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      },
    });
  });
};

// Parse JSON file
export const parseJSON = (file: File): Promise<Transaction[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        // Handle both array and object with transactions property
        let transactionsArray: any[] = [];
        if (Array.isArray(parsed)) {
          transactionsArray = parsed;
        } else if (parsed.transactions && Array.isArray(parsed.transactions)) {
          transactionsArray = parsed.transactions;
        } else {
          throw new Error('Invalid JSON format: expected array or object with transactions array');
        }

        const transactions: Transaction[] = transactionsArray.map((item: any) => ({
          id: item.id || `${item.merchant}-${item.date}-${item.amount}`,
          date: normalizeDate(item.date),
          merchant: item.merchant || item.description || item.name || '',
          amount: parseFloat(item.amount) || 0,
        })).filter((t: Transaction) => t.merchant && t.amount > 0);

        resolve(transactions);
      } catch (error) {
        reject(new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read JSON file'));
    };

    reader.readAsText(file);
  });
};

// Unified function that auto-detects format by file extension
export const parseTransactions = (file: File): Promise<Transaction[]> => {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.csv')) {
    return parseCSV(file);
  } else if (fileName.endsWith('.json')) {
    return parseJSON(file);
  } else {
    return Promise.reject(new Error('Unsupported file format. Please upload .csv or .json files.'));
  }
};