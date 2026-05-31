
import React, { forwardRef, useRef, useEffect } from 'react';
import type { ConversationEntry } from '../types';

interface ScriptDisplayProps {
  conversation: ConversationEntry[];
  onPlayLine: (id: string) => void;
  onDownload?: () => void;
  onDownloadMP3?: () => void;
  playingLineId: string | null;
}

const formatModelOutputLine = (
  line: string, 
  uniqueLineKey: string, 
  onPlayLine: (id: string) => void, 
  playingLineId: string | null
): React.ReactNode => {
  const match = line.match(/^\s*(\*\*?|)([\w\s."()✨🎙]+?)\1\s*:\s*(.*)/i);
  const isPlaying = playingLineId === uniqueLineKey;
  
  // High Contrast Container
  const baseClasses = `group flex items-start gap-5 rounded-xl px-5 py-3 -mx-2 mb-4 transition-all duration-300 ${
    isPlaying 
      ? 'bg-pink-900/40 border-l-4 border-pink-400 shadow-[0_0_25px_rgba(236,72,153,0.3)] ring-1 ring-pink-500/40' 
      : 'hover:bg-gray-800/80 border-l-4 border-transparent'
  }`;

  if (match) {
    const speaker = match[2].trim();
    const dialogue = match[3];
    
    // High Satiation Neon Colors for Names
    let speakerColor = 'text-white'; 
    if (speaker.startsWith('Ryo')) speakerColor = 'text-sky-300';
    else if (speaker.startsWith('Kita Ikuyo')) speakerColor = 'text-rose-400';
    else if (speaker.startsWith('Anna')) speakerColor = 'text-indigo-400';
    else if (speaker.startsWith('Utaha Kasumigaoka')) speakerColor = 'text-emerald-400';
    else if (speaker.startsWith('Shinka Nibutani')) speakerColor = 'text-pink-400';
    else if (speaker.startsWith('Marin Kitagawa')) speakerColor = 'text-amber-400';
    else if (speaker.startsWith('Aoba Suzukaze')) speakerColor = 'text-lime-400';
    
    return (
      <div 
        key={`${uniqueLineKey}-dialogue`} 
        id={`script-line-${uniqueLineKey}`}
        className={baseClasses}
      >
        <button 
          onClick={() => onPlayLine(uniqueLineKey)}
          className={`mt-1.5 flex-shrink-0 transition-all transform active:scale-90 ${isPlaying ? 'opacity-100 text-pink-400 scale-125' : 'opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white'}`}
          title="Venerate this line"
        >
          {isPlaying ? (
            <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
          ) : (
            <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          )}
        </button>
        <div className="flex-1">
          <span className={`text-[12px] font-black uppercase tracking-[0.2em] block mb-1.5 ${speakerColor}`}>{speaker}</span>
          <span className={`text-[17px] font-medium leading-relaxed block tracking-tight ${isPlaying ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" : "text-gray-100"}`}>
            {dialogue}
          </span>
        </div>
      </div>
    );
  }

  if (!line.trim()) return null;

  return (
    <div 
      key={`${uniqueLineKey}-line`} 
      className="px-5 py-2 mb-3"
    >
      <div className="flex-1 text-gray-400 italic text-base border-l-2 border-gray-600 pl-5 py-2 leading-relaxed font-medium">{line}</div>
    </div>
  );
};

export const ScriptDisplay = forwardRef<HTMLDivElement, ScriptDisplayProps>(({ conversation, onPlayLine, onDownload, onDownloadMP3, playingLineId }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);

  React.useImperativeHandle(ref, () => containerRef.current!, []);

  useEffect(() => {
    if (playingLineId) {
      const el = document.getElementById(`script-line-${playingLineId}`);
      if (el && containerRef.current) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [playingLineId]);

  return (
    <div className="w-full max-w-4xl bg-black p-10 rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.8)] ring-1 ring-gray-800 mt-10 mb-10 transition-all duration-500 border-t border-pink-500/30">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex flex-col">
            <h2 className="text-3xl font-black text-white flex items-center gap-4 uppercase tracking-tighter italic">
                <span className="text-pink-500">Theological</span> <span>Script</span>
                <div className="flex items-center gap-2">
                    {playingLineId && <span className="w-3 h-3 rounded-full bg-pink-500 animate-pulse shadow-[0_0_15px_#ec4899]" />}
                </div>
            </h2>
            <p className="text-[11px] text-gray-400 uppercase tracking-[0.4em] font-black mt-2 opacity-100">
              Metabolic Exegesis Protocol v2.5
            </p>
        </div>
        
        <div className="flex gap-3">
          {onDownloadMP3 && (
            <button 
              onClick={onDownloadMP3}
              className="flex items-center gap-2 text-[12px] font-black text-emerald-400 hover:text-white bg-emerald-950/20 hover:bg-emerald-600 px-5 py-3 rounded-xl border-2 border-emerald-500/50 transition-all uppercase tracking-widest"
            >
              Master Audio
            </button>
          )}
          {onDownload && (
            <button 
              onClick={onDownload}
              className="flex items-center gap-2 text-[12px] font-black text-sky-400 hover:text-white bg-sky-950/20 hover:bg-sky-600 px-5 py-3 rounded-xl border-2 border-sky-500/50 transition-all uppercase tracking-widest"
            >
              Archive Text
            </button>
          )}
        </div>
      </div>

      <div 
        ref={containerRef}
        className="bg-[#050505] p-8 rounded-2xl text-base leading-relaxed max-h-[75vh] overflow-y-auto shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] scroll-smooth custom-scrollbar border border-white/10"
        aria-live="polite"
      >
        <div className="font-sans">
          {conversation.map((entry) => {
            if (entry.source === 'user-text') {
              const uniqueLineKey = entry.id;
              const isPlaying = playingLineId === uniqueLineKey;
              return (
                <div 
                  key={entry.id} 
                  id={`script-line-${uniqueLineKey}`}
                  className={`group flex items-start gap-5 rounded-xl px-6 py-5 -mx-2 mb-8 transition-all duration-300 ${isPlaying ? 'bg-green-900/40 border-l-4 border-green-400' : 'bg-gray-900/50 border-l-4 border-gray-500'}`}
                >
                  <button 
                    onClick={() => onPlayLine(uniqueLineKey)}
                    className={`mt-1.5 flex-shrink-0 transition-all ${isPlaying ? 'opacity-100 text-green-400 scale-125' : 'opacity-0 group-hover:opacity-100 text-gray-400 hover:text-green-300'}`}
                  >
                    {isPlaying ? (
                      <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                    ) : (
                      <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    )}
                  </button>
                  <div className="flex-1">
                    <strong className="text-green-400 block mb-2 uppercase text-[11px] tracking-[0.3em] font-black opacity-100">Caller Transcription:</strong>
                    <span className={`text-lg italic leading-relaxed block font-medium ${isPlaying ? 'text-white' : 'text-green-50'}`}>"{entry.text}"</span>
                  </div>
                </div>
              );
            } else if (entry.source === 'user-chart-request' || entry.source === 'user-image') {
              const colorClass = entry.source === 'user-chart-request' ? 'text-purple-400' : 'text-teal-400';
              const label = entry.source === 'user-chart-request' ? 'Cosmic Anatomy' : 'Iconographic Offering';
              
              return (
                <div key={entry.id} className="mb-10 border-b-2 border-gray-800 pb-8">
                  <strong className={`${colorClass} block mb-4 uppercase text-[12px] tracking-[0.4em] font-black`}>{label}</strong>
                  {entry.text && <span className="text-white italic block mb-6 text-lg pl-6 border-l-4 border-current leading-relaxed font-medium">"{entry.text}"</span>}
                  {entry.imageData && (
                    <div className="my-6">
                      <img 
                        src={entry.imageData} 
                        alt={entry.text || label} 
                        className="max-w-full sm:max-w-xl max-h-[500px] rounded-2xl border-2 border-gray-700 shadow-[0_20px_50px_rgba(0,0,0,0.5)] object-cover hover:scale-[1.01] transition-transform duration-500 cursor-zoom-in"
                      />
                    </div>
                  )}
                </div>
              );
            }
            else if (entry.source === 'model') {
              return entry.text?.split('\n').map((line, lineIndex) => {
                const uniqueId = `${entry.id}-${lineIndex}`;
                return formatModelOutputLine(line, uniqueId, onPlayLine, playingLineId);
              }) || null;
            } else if (entry.source === 'system-message') {
               return (
                <div key={entry.id} className="mb-8 p-6 bg-red-950/30 rounded-2xl border-l-8 border-red-500 shadow-xl">
                  <strong className="text-red-400 block mb-2 uppercase text-[11px] tracking-[0.3em] font-black">Divine Intervention</strong>
                  <span className="text-white italic text-lg leading-relaxed font-semibold">{entry.text}</span>
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
});

ScriptDisplay.displayName = 'ScriptDisplay';
