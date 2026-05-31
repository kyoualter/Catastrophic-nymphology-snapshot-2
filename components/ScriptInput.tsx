
import React, { useState } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { HostBiosModal } from './HostBiosModal';
import { RANDOM_CHAT_TOPICS } from '../constants';

interface ScriptInputProps {
  exegesisText: string;
  setExegesisText: (text: string) => void;
  selfHelpQuestion: string;
  setSelfHelpQuestion: (text: string) => void;
  justChattingTopic: string;
  setJustChattingTopic: (text: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  selectedHosts: string[];
  allHostNames: string[];
  onHostChange: (hostName: string, isSelected: boolean) => void;
  activeTab: 'exegesis' | 'selfHelp' | 'justChatting';
  setActiveTab: (tab: 'exegesis' | 'selfHelp' | 'justChatting') => void;
}

type TabType = 'exegesis' | 'selfHelp' | 'justChatting';

export const ScriptInput: React.FC<ScriptInputProps> = ({
  exegesisText,
  setExegesisText,
  selfHelpQuestion,
  setSelfHelpQuestion,
  justChattingTopic,
  setJustChattingTopic,
  onGenerate,
  isLoading,
  selectedHosts,
  allHostNames,
  onHostChange,
  activeTab,
  setActiveTab,
}) => {
  const [isBiosOpen, setIsBiosOpen] = useState(false);

  const handleGenerate = () => {
    if (isLoading) return;
    const text = activeTab === 'exegesis' 
        ? exegesisText 
        : activeTab === 'selfHelp' 
            ? selfHelpQuestion 
            : 'chat';
    
    if (text.trim() && selectedHosts.length > 0) {
      onGenerate();
    }
  };

  const isButtonDisabled = isLoading || 
    (activeTab === 'exegesis' && !exegesisText.trim()) || 
    (activeTab === 'selfHelp' && !selfHelpQuestion.trim()) || 
    selectedHosts.length === 0;

  const getTabClass = (tabName: TabType) => {
    const baseClass = "px-8 py-4 text-sm font-black transition-all duration-200 focus:outline-none rounded-t-2xl border-t border-l border-r uppercase tracking-widest";
    if (activeTab === tabName) {
      return `${baseClass} bg-black border-pink-500/50 text-pink-400 shadow-[0_-5px_20px_rgba(0,0,0,0.4)]`;
    }
    return `${baseClass} bg-gray-900 border-transparent text-gray-500 hover:text-gray-100 hover:bg-gray-800`;
  };
  
  const TabContent = () => {
    if (activeTab === 'justChatting') {
        return (
          <div className="space-y-5">
            <div className="flex justify-between items-end">
              <label htmlFor="topic-input" className="text-[12px] font-black text-emerald-400 uppercase tracking-[0.3em]">
                Liturgy Subject
              </label>
              <button
                  onClick={() => {
                      const random = RANDOM_CHAT_TOPICS[Math.floor(Math.random() * RANDOM_CHAT_TOPICS.length)];
                      setJustChattingTopic(random);
                  }}
                  disabled={isLoading}
                  className="text-[10px] font-black text-white hover:bg-emerald-600 transition-all uppercase tracking-widest border-2 border-emerald-500/30 px-4 py-2 rounded-xl bg-emerald-950/30"
              >
                  🎲 Summon Vibe
              </button>
            </div>
            <textarea
              id="topic-input"
              value={justChattingTopic}
              onChange={(e) => setJustChattingTopic(e.target.value)}
              placeholder="Expose a theme for narration... e.g., 'The ontological dread of an empty chatroom'."
              className="w-full h-44 p-6 bg-black text-white border-2 border-gray-800 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-none shadow-2xl text-lg font-medium placeholder:text-gray-600 transition-all"
              disabled={isLoading}
            />
          </div>
        );
      }

    if (activeTab === 'exegesis') {
      return (
        <div className="space-y-5">
          <label htmlFor="text-input" className="text-[12px] font-black text-pink-400 uppercase tracking-[0.3em]">
            Scripture for Deconstruction
          </label>
          <textarea
            id="text-input"
            value={exegesisText}
            onChange={(e) => setExegesisText(e.target.value)}
            placeholder="Paste raw text, manifestos, or fragments here..."
            className="w-full h-44 p-6 bg-black text-white border-2 border-gray-800 rounded-2xl focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 outline-none resize-none shadow-2xl text-lg font-medium placeholder:text-gray-600 transition-all"
            disabled={isLoading}
          />
        </div>
      );
    }
    
    if (activeTab === 'selfHelp') {
      return (
        <div className="space-y-5">
          <label htmlFor="self-help-input" className="text-[12px] font-black text-sky-400 uppercase tracking-[0.3em]">
            Aesthetic Inquiry
          </label>
          <textarea
            id="self-help-input"
            value={selfHelpQuestion}
            onChange={(e) => setSelfHelpQuestion(e.target.value)}
            placeholder="Confess a structural wound or seek advice..."
            className="w-full h-44 p-6 bg-black text-white border-2 border-gray-800 rounded-2xl focus:ring-4 focus:ring-sky-500/20 focus:border-sky-500 outline-none resize-none shadow-2xl text-lg font-medium placeholder:text-gray-600 transition-all"
            disabled={isLoading}
          />
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full max-w-3xl mb-16">
      <HostBiosModal isOpen={isBiosOpen} onClose={() => setIsBiosOpen(false)} />
      
      <div className="flex -mb-px overflow-x-auto scrollbar-hide gap-2">
        <button className={getTabClass('justChatting')} onClick={() => setActiveTab('justChatting')}>
          Spontaneous
        </button>
        <button className={getTabClass('exegesis')} onClick={() => setActiveTab('exegesis')}>
          Exegesis
        </button>
        <button className={getTabClass('selfHelp')} onClick={() => setActiveTab('selfHelp')}>
          Confessional
        </button>
      </div>

      <div className="w-full bg-black p-10 rounded-b-3xl rounded-tr-3xl shadow-[0_30px_60px_rgba(0,0,0,0.7)] ring-1 ring-gray-800 border-t border-gray-800">
        <TabContent />
        
        <div className="mt-12 pt-10 border-t-2 border-gray-900">
            <div className="flex items-center justify-between mb-8">
                <div className="flex flex-col">
                  <label className="text-[12px] font-black text-pink-500 uppercase tracking-[0.3em]">
                    Hostess Selection ({selectedHosts.length})
                  </label>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1.5">
                    Order defines narrative sovereignty
                  </span>
                </div>
                <button 
                    onClick={() => setIsBiosOpen(true)}
                    className="text-[11px] font-black text-white hover:bg-sky-600 uppercase tracking-widest border-2 border-sky-500/30 px-5 py-2.5 rounded-xl bg-sky-950/20 transition-all"
                >
                    Review Roles
                </button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-6 gap-x-8">
                {allHostNames.map(hostName => {
                  const isSovereign = selectedHosts.indexOf(hostName) === 0;
                  const isSelected = selectedHosts.includes(hostName);
                  return (
                    <label key={hostName} className={`flex items-center gap-4 cursor-pointer group p-3 rounded-xl transition-all ${isSelected ? 'bg-pink-900/10 ring-1 ring-pink-500/20' : 'hover:bg-gray-800'}`}>
                        <div className="relative flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => onHostChange(hostName, e.target.checked)}
                            className="h-6 w-6 rounded-lg border-2 border-gray-700 bg-black text-pink-500 focus:ring-pink-500 disabled:opacity-30 cursor-pointer"
                            disabled={isLoading}
                          />
                        </div>
                        <span className={`text-base tracking-tight transition-colors ${isSovereign ? 'text-pink-400 font-black italic' : isSelected ? 'text-white font-bold' : 'text-gray-400 group-hover:text-white'}`}>
                            {hostName} {isSovereign && '👑'}
                        </span>
                    </label>
                  );
                })}
            </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isButtonDisabled}
          className="mt-12 w-full bg-pink-600 hover:bg-pink-500 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white font-black py-6 px-10 rounded-2xl shadow-2xl transition-all duration-300 transform active:scale-[0.98] uppercase tracking-[0.4em] text-sm flex items-center justify-center border-b-8 border-pink-950"
        >
          {isLoading ? (
            <div className="flex items-center gap-5">
              <LoadingSpinner />
              <span className="animate-pulse">Metabolizing Revelation...</span>
            </div>
          ) : (
            'Initiate Reading'
          )}
        </button>
      </div>
    </div>
  );
};
