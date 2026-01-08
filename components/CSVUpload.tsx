'use client';

import { useRef, useState } from 'react';
import Papa from 'papaparse';
import { Employee, ProcessedData } from '@/lib/types';
import { processEmployeeData } from '@/lib/dataProcessor';

interface CSVUploadProps {
  onDataProcessed: (data: ProcessedData) => void;
}

export default function CSVUpload({ onDataProcessed }: CSVUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    setIsUploading(true);
    setError(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const processed = processEmployeeData(results.data);
          onDataProcessed(processed);
          setIsUploading(false);
        } catch (err) {
          setError('Error processing CSV data. Please check the format.');
          setIsUploading(false);
          console.error(err);
        }
      },
      error: (error) => {
        setError('Error parsing CSV file: ' + error.message);
        setIsUploading(false);
      },
    });
  };

  return (
    <div className="w-full">
      <div className="relative border-2 border-dashed border-slate-600 rounded-lg p-8 hover:border-slate-500 transition-colors bg-slate-900/50 backdrop-blur-sm">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />
        <div className="text-center">
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="text-slate-400">Processing CSV...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <svg
                className="w-12 h-12 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-slate-300 font-medium">
                Click to upload CSV or drag and drop
              </p>
              <p className="text-slate-500 text-sm">
                CSV with: employee_id, name, role, hourly_rate, hours_worked, output_score, team
              </p>
            </div>
          )}
        </div>
      </div>
      {error && (
        <div className="mt-4 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300">
          {error}
        </div>
      )}
    </div>
  );
}

