
import React, { useState, useCallback } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface ImageUploadProps {
  onImageSubmit: (file: File, caption?: string) => void;
  isLoading: boolean;
  chatActive: boolean;
}

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSubmit, isLoading, chatActive }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = event.target.files?.[0];
    if (file) {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        setError(`Invalid file type. Please upload a JPG, PNG, WEBP, or GIF image.`);
        setSelectedFile(null);
        setPreviewUrl(null);
        event.target.value = ''; 
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setError(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
        setSelectedFile(null);
        setPreviewUrl(null);
        event.target.value = '';
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  }, []);

  const handleSubmit = useCallback(() => {
    if (selectedFile && !isLoading && chatActive) {
      onImageSubmit(selectedFile, caption.trim() || undefined);
    } else if (!chatActive) {
        setError("Console Locked: Initiate session first.");
    }
  }, [selectedFile, caption, isLoading, onImageSubmit, chatActive]);

  return (
    <div className="w-full bg-black p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,1)] ring-1 ring-gray-800 border-t-2 border-teal-500/30">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-black text-teal-400 uppercase tracking-[0.4em]">Iconographic Offering</h3>
        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Aura Analysis Mode</span>
      </div>

      {error && (
        <div className="bg-red-950/30 border-2 border-red-500 text-red-200 px-4 py-3 rounded-xl mb-6 text-xs font-bold uppercase tracking-tight">
          {error}
        </div>
      )}

      <div className="mb-6">
        <label htmlFor="image-upload-input" className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-3">
          Ingest Visual Signal (Max {MAX_FILE_SIZE_MB}MB)
        </label>
        <div className="relative group">
            <input
              id="image-upload-input"
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(',')}
              onChange={handleFileChange}
              className="w-full text-xs text-gray-400 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-2 file:border-teal-500/50 file:text-xs file:font-black file:bg-teal-950/20 file:text-teal-400 hover:file:bg-teal-600 hover:file:text-white cursor-pointer transition-all"
              disabled={isLoading || !chatActive}
            />
        </div>
      </div>

      {previewUrl && (
        <div className="mb-6 relative group">
          <div className="absolute inset-0 bg-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />
          <img src={previewUrl} alt="Selected preview" className="w-full max-h-64 object-cover rounded-2xl border-2 border-gray-800 shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]" />
        </div>
      )}

      <div className="mb-6">
        <label htmlFor="image-caption-input" className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-3">
          Symbolic Context (Optional)
        </label>
        <input
          id="image-caption-input"
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Narrate your intent for this emanation..."
          className="w-full p-4 bg-black text-white border-2 border-gray-800 rounded-xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-base font-medium placeholder:text-gray-700 transition-all"
          disabled={isLoading || !chatActive || !selectedFile}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={isLoading || !selectedFile || !chatActive}
        className="w-full bg-teal-600 hover:bg-teal-500 disabled:bg-gray-900 disabled:text-gray-700 disabled:border-gray-800 disabled:cursor-not-allowed text-white font-black py-4 px-8 rounded-2xl shadow-2xl transition-all duration-300 transform active:scale-[0.98] uppercase tracking-[0.3em] text-xs flex items-center justify-center border-b-4 border-teal-900"
      >
        {isLoading ? (
          <div className="flex items-center gap-4">
            <LoadingSpinner />
            <span className="animate-pulse">Metabolizing Aura...</span>
          </div>
        ) : (
          'Analyze Aesthetics'
        )}
      </button>
    </div>
  );
};
