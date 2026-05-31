
import React from 'react';

interface SessionManagerProps {
  onSave: () => void;
  onLoad: () => void;
  onReset: () => void;
  onDeleteSaved: () => void;
  onDownload: () => void;
  onExportMP3: () => void;
  isSessionActive: boolean;
  hasSavedSession: boolean;
  isMastering?: boolean;
}

export const SessionManager: React.FC<SessionManagerProps> = ({ 
  onSave, 
  onLoad, 
  onReset,
  onDeleteSaved,
  onDownload, 
  onExportMP3,
  isSessionActive,
  hasSavedSession,
  isMastering = false
}) => {
  return (
    <div className="w-full max-w-2xl bg-gray-800 p-5 rounded-lg shadow-xl mb-8 ring-1 ring-gray-700 border-l-4 border-pink-500">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Session Controls</h3>
        {hasSavedSession && (
          <span className="text-[10px] bg-green-900 text-green-300 px-2 py-0.5 rounded-full border border-green-700">
            Saved Session Available
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Active Session Actions */}
        <div className="sm:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
          <button
            onClick={onSave}
            disabled={!isSessionActive || isMastering}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-[10px] font-black py-2.5 px-4 rounded shadow-md transition-all duration-150 uppercase tracking-wider"
          >
            SAVE LIVE
          </button>
          
          <button
            onClick={onDownload}
            disabled={!isSessionActive || isMastering}
            className="flex-1 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-[10px] font-black py-2.5 px-4 rounded shadow-md transition-all duration-150 uppercase tracking-wider"
          >
            EXPORT TXT
          </button>

          <button
            onClick={onExportMP3}
            disabled={!isSessionActive || isMastering}
            className="flex-1 bg-sky-600 hover:bg-sky-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-[10px] font-black py-2.5 px-4 rounded shadow-md transition-all duration-150 uppercase tracking-wider"
          >
            {isMastering ? 'MASTERING...' : 'EXPORT MP3'}
          </button>

          <button
            onClick={onReset}
            disabled={!isSessionActive || isMastering}
            className="flex-1 bg-orange-700 hover:bg-orange-600 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-[10px] font-black py-2.5 px-4 rounded shadow-md transition-all duration-150 uppercase tracking-wider"
          >
            RESET STUDIO
          </button>
        </div>

        {/* Storage Actions */}
        <div className="sm:col-span-3 flex flex-wrap gap-3 pt-3 border-t border-gray-700">
          <button
            onClick={onLoad}
            disabled={!hasSavedSession || isMastering}
            className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-[10px] font-black py-2.5 px-4 rounded shadow-md transition-all duration-150 uppercase tracking-wider"
          >
            RELOAD SAVED
          </button>
          
          <button
            onClick={onDeleteSaved}
            disabled={!hasSavedSession || isMastering}
            className="flex-1 bg-red-900 hover:bg-red-800 disabled:bg-gray-700 disabled:text-gray-500 text-[10px] font-black py-2.5 px-4 rounded shadow-md transition-all duration-150 uppercase tracking-wider"
          >
            PURGE STORAGE
          </button>
        </div>
      </div>
    </div>
  );
};
