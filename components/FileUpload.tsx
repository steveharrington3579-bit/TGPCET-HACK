'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import { Transaction } from '@/types';
import { parseTransactions } from '@/lib/parser';

interface FileUploadProps {
  onParsed: (transactions: Transaction[]) => void;
  isLoading?: boolean;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export default function FileUpload({ onParsed, isLoading = false }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rowCount, setRowCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const processingRef = useRef(false); // Prevent duplicate processing

  // Memoize the processing state
  const processingState = useMemo(() => ({
    isProcessing,
    isLoading
  }), [isProcessing, isLoading]);

  const validateFile = useCallback((file: File): string | null => {
    if (!file.name.toLowerCase().endsWith('.csv') && !file.name.toLowerCase().endsWith('.json')) {
      return 'Please upload .csv or .json files only.';
    }

    if (file.size > MAX_FILE_SIZE) {
      return 'File size exceeds 2MB limit.';
    }

    return null;
  }, []);

  const handleFile = useCallback(async (file: File) => {
    // Prevent duplicate processing
    if (processingRef.current || processingState.isLoading) {
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      processingRef.current = true;
      setError(null);
      setFileName(file.name);
      setRowCount(null);
      setIsProcessing(true);

      const transactions = await parseTransactions(file);

      // Ensure we have valid transactions before proceeding
      if (transactions.length === 0) {
        setError('No valid transactions found in the file.');
        processingRef.current = false;
        setIsProcessing(false);
        return;
      }

      setRowCount(transactions.length);
      onParsed(transactions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file');
      setFileName(null);
      setRowCount(null);
    } finally {
      processingRef.current = false;
      setIsProcessing(false);
    }
  }, [onParsed, processingState, validateFile]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    // Reset input to allow re-uploading the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFile]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!processingRef.current && !processingState.isLoading) {
      fileInputRef.current?.click();
    }
  }, [processingState]);

  const isDisabled = processingRef.current || processingState.isLoading;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDisabled
            ? 'opacity-50 cursor-not-allowed'
            : isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".csv,.json"
          onChange={handleFileSelect}
          disabled={isDisabled}
        />

        <div className="space-y-2">
          {isDisabled ? (
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
              <p className="text-sm text-gray-600">Processing file...</p>
            </div>
          ) : (
            <>
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="text-sm text-gray-600">
                <span className="font-medium text-blue-600 hover:text-blue-500">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">CSV or JSON files only (max 2MB)</p>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {fileName && rowCount !== null && !isDisabled && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-green-800">{fileName}</span>
            <span className="text-sm text-green-600">{rowCount} transactions</span>
          </div>
        </div>
      )}
    </div>
  );
}