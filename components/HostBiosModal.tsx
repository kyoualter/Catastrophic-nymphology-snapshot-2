
import React from 'react';
import { ALL_HOSTS } from '../constants';

interface HostBiosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HostBiosModal: React.FC<HostBiosModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const getSpeakerColor = (name: string) => {
    if (name.startsWith('Ryo')) return 'border-blue-500 text-blue-400';
    if (name.startsWith('Kita Ikuyo')) return 'border-rose-500 text-rose-400';
    if (name.startsWith('Anna')) return 'border-indigo-500 text-indigo-400';
    if (name.startsWith('Utaha Kasumigaoka')) return 'border-emerald-500 text-emerald-400';
    if (name.startsWith('Shinka Nibutani')) return 'border-pink-500 text-pink-400';
    if (name.startsWith('Marin Kitagawa')) return 'border-amber-500 text-amber-400';
    if (name.startsWith('Aoba Suzukaze')) return 'border-lime-500 text-lime-400';
    return 'border-gray-500 text-gray-400';
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
      <div className="bg-black border-2 border-gray-800 rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-[0_0_100px_rgba(0,0,0,1)]">
        <div className="p-8 border-b-2 border-gray-900 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Persona Review</h2>
            <p className="text-[11px] text-pink-500 font-black uppercase tracking-[0.4em] mt-2">Erotic Hostess Modulation & Sovereign Directives</p>
          </div>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-gray-900 rounded-full text-white transition-colors border-2 border-gray-800"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-8 bg-[radial-gradient(circle_at_top_right,_rgba(236,72,153,0.05)_0%,_transparent_50%)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Object.entries(ALL_HOSTS).map(([name, data]) => (
              <div key={name} className={`bg-gray-900/40 backdrop-blur-md border-l-8 rounded-2xl p-6 transition-all hover:bg-gray-900/80 hover:shadow-2xl ${getSpeakerColor(name)}`}>
                <div className="flex justify-between items-start mb-5">
                  <h3 className="text-2xl font-black uppercase tracking-tighter italic text-white">{name}</h3>
                  <span className="text-[11px] bg-black px-3 py-1 rounded-lg border-2 border-current font-black">
                    {data.voice}
                  </span>
                </div>
                
                <div className="space-y-5">
                  <div>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] block mb-2">Ritual Performance Directive</span>
                    <p className="text-sm text-white italic leading-relaxed bg-black/60 p-5 rounded-xl border border-white/5 shadow-inner font-medium">
                      "{data.acting}"
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] block mb-2">Theological Profile</span>
                    <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap font-medium">
                      {data.description.split('\n').map((line, i) => (
                        <div key={i} className={line.includes('**') ? 'mt-3 text-pink-400 font-black uppercase text-[11px] tracking-widest' : 'pl-4 border-l-2 border-gray-800 my-2'}>
                          {line.replace(/\*\*/g, '')}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-black border-t-2 border-gray-900 text-center">
            <p className="text-[11px] text-gray-600 font-black uppercase tracking-[0.5em]">
                Catastrophic Nymphology Studio | Metabolic Protocol
            </p>
        </div>
      </div>
    </div>
  );
};
