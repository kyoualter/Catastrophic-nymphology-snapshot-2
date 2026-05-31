
import React, { useState, useCallback } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface DeepDiveSectionProps {
  onDeepDiveSubmit: (file: File) => void;
  isLoading: boolean;
}

const ACCEPTED_FILE_TYPES = ['application/pdf'];

export const DeepDiveSection: React.FC<DeepDiveSectionProps> = ({ onDeepDiveSubmit, isLoading }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = event.target.files?.[0];
    if (file) {
      if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
        setError(`Invalid file type. Please upload a PDF document.`);
        setSelectedFile(null);
        event.target.value = '';
        return;
      }
      setSelectedFile(file);
    }
  }, []);

  const handleSubmit = useCallback(() => {
    if (selectedFile && !isLoading) {
      onDeepDiveSubmit(selectedFile);
    }
  }, [selectedFile, isLoading, onDeepDiveSubmit]);

  return (
    <div className="w-full max-w-2xl bg-gray-800 p-6 rounded-lg shadow-xl my-8 ring-1 ring-gray-700 border-l-4 border-sky-500">
      <h3 className="text-xl font-bold text-sky-400 mb-2 flex items-center gap-2">
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>
        Deep Dive Production (PDF)
      </h3>
      <p className="text-sm text-gray-400 mb-4">Upload a manuscript or paper. The hosts will perform a rigorous, multi-track exegesis and prepare a downloadable standalone podcast.</p>
      
      {error && (
        <div className="bg-red-900 border border-red-700 text-red-300 px-3 py-2 rounded-md mb-3 text-sm">
          {error}
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Select Document (Max 10MB)
        </label>
        <div className="flex items-center gap-4">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="flex-1 text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-sky-600 file:text-white hover:file:bg-sky-700 cursor-pointer"
            disabled={isLoading}
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isLoading || !selectedFile}
        className="w-full bg-sky-600 hover:bg-sky-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg shadow-lg transition-all flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <LoadingSpinner />
            Processing Manuscript...
          </>
        ) : (
          'Initiate Deep Dive'
        )}
      </button>
    </div>
  );
};
