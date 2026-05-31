
import React, { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import type { ConversationEntry } from '../types';
import { generateSpeech } from '../services/geminiService';
import { ALL_HOSTS } from '../constants';
import { encodeWAV, encodeMP3, decodeBase64ToPCM } from '../utils/audioUtils';

interface PodcastPlayerProps {
  conversation: ConversationEntry[];
  setPlayingLineId: (id: string | null) => void;
  requestedPlayId: { id: string; ts: number } | null;
  onMasteringStateChange?: (isMastering: boolean) => void;
}

interface PlayableSegment {
  id: string;
  speaker: string;
  cleanDialogue: string;
}

export interface PodcastPlayerHandle {
  exportMP3: () => void;
  exportWAV: () => void;
}

export const PodcastPlayer = forwardRef<PodcastPlayerHandle, PodcastPlayerProps>(({ 
  conversation, 
  setPlayingLineId, 
  requestedPlayId,
  onMasteringStateChange
}, ref) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [segments, setSegments] = useState<PlayableSegment[]>([]);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isMastering, setIsMastering] = useState<'wav' | 'mp3' | null>(null);
  const [masterProgress, setMasterProgress] = useState(0);
  
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [pitchShift, setPitchShift] = useState(0); 
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    const newSegments: PlayableSegment[] = [];
    conversation.forEach(entry => {
      if (entry.source === 'model' && entry.text) {
        entry.text.split('\n').forEach((line, idx) => {
          if (line.trim()) {
            const match = line.match(/^\s*(\*\*?|)([\w\s."()✨🎙]+?)\1\s*:\s*(.*)/i);
            if (match) {
              newSegments.push({ id: `${entry.id}-${idx}`, speaker: match[2].trim(), cleanDialogue: match[3].trim() });
            }
          }
        });
      } else if (entry.source === 'user-text' && entry.text) {
        newSegments.push({ id: entry.id, speaker: 'Caller', cleanDialogue: entry.text });
      }
    });
    setSegments(newSegments);
  }, [conversation]);

  const stopAudio = useCallback(() => {
    if (currentSourceRef.current) {
      try { currentSourceRef.current.stop(); } catch (e) {}
      currentSourceRef.current = null;
    }
    setIsPlaying(false);
    setPlayingLineId(null);
  }, [setPlayingLineId]);

  useEffect(() => {
    if (currentSourceRef.current) {
      currentSourceRef.current.playbackRate.value = playbackSpeed;
      currentSourceRef.current.detune.value = pitchShift;
    }
  }, [playbackSpeed, pitchShift]);

  const playSegment = useCallback(async (index: number) => {
    if (index >= segments.length || index < 0) {
      stopAudio();
      return;
    }
    stopAudio();
    setIsBuffering(true);
    setCurrentSegmentIndex(index);
    setPlayingLineId(segments[index].id);

    try {
      if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const segment = segments[index];
      const hostProfile = ALL_HOSTS[segment.speaker] || { voice: 'Zephyr', acting: 'Say naturally' };
      const base64Audio = await generateSpeech(segment.cleanDialogue, hostProfile.voice, hostProfile.acting);
      
      const pcmData = decodeBase64ToPCM(base64Audio);
      const audioBuffer = audioContextRef.current.createBuffer(1, pcmData.length, 24000);
      const channelData = audioBuffer.getChannelData(0);
      for (let i = 0; i < pcmData.length; i++) channelData[i] = pcmData[i] / 32768.0;

      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      
      source.playbackRate.value = playbackSpeed;
      source.detune.value = pitchShift;
      
      source.onended = () => { 
        if (currentSourceRef.current === source) {
            playSegment(index + 1); 
        }
      };
      
      currentSourceRef.current = source;
      setIsBuffering(false);
      setIsPlaying(true);
      source.start();
    } catch (error) {
      setIsBuffering(false);
      setIsPlaying(false);
    }
  }, [segments, stopAudio, setPlayingLineId, playbackSpeed, pitchShift]);

  const handleExportFullPodcast = async (format: 'wav' | 'mp3') => {
    if (segments.length === 0 || isMastering) return;
    setIsMastering(format);
    onMasteringStateChange?.(true);
    setMasterProgress(0);
    const allPCMs: Int16Array[] = [];

    try {
      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        const host = ALL_HOSTS[seg.speaker] || { voice: 'Zephyr', acting: 'Say naturally' };
        const b64 = await generateSpeech(seg.cleanDialogue, host.voice, host.acting);
        allPCMs.push(decodeBase64ToPCM(b64));
        setMasterProgress(Math.round(((i + 1) / segments.length) * 100));
        await new Promise(r => setTimeout(r, 100));
      }

      const totalLen = allPCMs.reduce((acc, cur) => acc + cur.length, 0);
      const masteredPCM = new Int16Array(totalLen);
      let offset = 0;
      for (const pcm of allPCMs) {
        masteredPCM.set(pcm, offset);
        offset += pcm.length;
      }

      let audioBlob: Blob;
      if (format === 'mp3') {
        audioBlob = await encodeMP3(masteredPCM, 24000);
      } else {
        audioBlob = encodeWAV(masteredPCM, 24000);
      }

      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Studio_Session_${Date.now()}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setIsMastering(null);
      onMasteringStateChange?.(false);
    }
  };

  useImperativeHandle(ref, () => ({
    exportMP3: () => handleExportFullPodcast('mp3'),
    exportWAV: () => handleExportFullPodcast('wav')
  }));

  useEffect(() => {
    if (requestedPlayId && segments.length > 0) {
      const index = segments.findIndex(s => s.id === requestedPlayId.id);
      if (index !== -1) playSegment(index);
    }
  }, [requestedPlayId, segments, playSegment]);

  if (conversation.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-950/95 backdrop-blur-xl border-t border-white/10 p-5 shadow-[0_-20px_50px_rgba(0,0,0,0.6)] z-[100]">
      <div className="absolute top-0 left-0 h-1 bg-gray-800 w-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-700 ease-in-out ${isMastering ? 'bg-emerald-500 shadow-[0_0_15px_#10b981]' : 'bg-sky-500 shadow-[0_0_15px_#0ea5e9]'}`} 
          style={{ width: `${isMastering ? masterProgress : segments.length > 0 ? ((currentSegmentIndex + 1) / segments.length) * 100 : 0}%` }}
        />
      </div>

      <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center justify-between gap-8">
        
        <div className="flex items-center gap-6 flex-shrink-0">
          <div className="relative group">
            <button 
              onClick={() => isPlaying ? stopAudio() : playSegment(currentSegmentIndex)}
              disabled={isBuffering || !!isMastering}
              className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all transform active:scale-95 border-2 ${
                isPlaying ? 'bg-pink-600 border-pink-400' : 
                isBuffering ? 'bg-gray-800 border-gray-700' :
                'bg-gray-900 border-gray-700 hover:border-pink-500'
              }`}
            >
              {isBuffering ? (
                <div className="animate-spin border-3 border-pink-500 border-t-transparent rounded-full w-6 h-6" />
              ) : isPlaying ? (
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              ) : (
                <svg className="w-6 h-6 text-white translate-x-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              )}
            </button>
          </div>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Live Monitoring</span>
                {isPlaying && (
                    <div className="flex gap-1 items-end h-3 mb-1">
                        <div className="w-0.5 bg-pink-500 animate-[bounce_0.6s_infinite_ease-in-out]"></div>
                        <div className="w-0.5 bg-pink-400 animate-[bounce_0.8s_infinite_ease-in-out_0.2s]"></div>
                        <div className="w-0.5 bg-pink-600 animate-[bounce_0.5s_infinite_ease-in-out_0.1s]"></div>
                    </div>
                )}
            </div>
            <div className="flex gap-4 mt-1.5">
              <button 
                  onClick={() => handleExportFullPodcast('mp3')}
                  disabled={!!isMastering || segments.length === 0}
                  className="text-[11px] font-black text-pink-500 hover:text-white transition-colors disabled:opacity-30 uppercase tracking-widest"
              >
                  {isMastering === 'mp3' ? `MASTERING ${masterProgress}%` : 'MP3 Master'}
              </button>
              <button 
                  onClick={() => handleExportFullPodcast('wav')}
                  disabled={!!isMastering || segments.length === 0}
                  className="text-[11px] font-black text-gray-500 hover:text-white transition-colors disabled:opacity-30 uppercase tracking-widest"
              >
                  WAV
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 w-full bg-gray-900/60 rounded-2xl p-4 border border-white/5 shadow-inner relative overflow-hidden flex flex-col justify-center min-h-[80px]">
          <div className="flex items-center justify-between mb-2">
             <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${isPlaying ? 'bg-pink-600 text-white' : 'bg-gray-800 text-gray-500'}`}>
                    {isPlaying ? 'ON AIR' : 'CUE'}
                </span>
                <span className="text-xs font-black text-gray-100 uppercase italic tracking-tighter">
                    {segments[currentSegmentIndex]?.speaker || "System"}
                </span>
             </div>
             <span className="text-[10px] font-mono text-gray-600 font-bold uppercase tracking-tighter">
                {currentSegmentIndex + 1} / {segments.length}
             </span>
          </div>
          
          <div className="text-sm md:text-base text-gray-300 font-medium leading-relaxed italic transition-all duration-500">
            {isBuffering ? (
                <span className="text-pink-500/50 animate-pulse">Synchronizing revelation...</span>
            ) : (
                `"${segments[currentSegmentIndex]?.cleanDialogue || "Standby for signal..."}"`
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-8 flex-shrink-0 bg-gray-900/40 p-4 rounded-2xl border border-white/5">
            <div className="flex flex-col gap-3 min-w-[150px]">
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Tempo</span>
                    <span className="text-xs font-mono text-pink-500 font-bold">{playbackSpeed.toFixed(1)}x</span>
                </div>
                <input 
                    type="range" min="0.5" max="2.0" step="0.1" 
                    value={playbackSpeed} 
                    onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                    className="w-full h-1 bg-gray-800 rounded-full appearance-none cursor-pointer accent-pink-500"
                />
            </div>
            
            <div className="flex flex-col gap-3 min-w-[150px]">
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Resonance</span>
                    <span className="text-xs font-mono text-sky-400 font-bold">{pitchShift > 0 ? '+' : ''}{pitchShift}c</span>
                </div>
                <input 
                    type="range" min="-1200" max="1200" step="100" 
                    value={pitchShift} 
                    onChange={(e) => setPitchShift(parseInt(e.target.value))}
                    className="w-full h-1 bg-gray-800 rounded-full appearance-none cursor-pointer accent-sky-400"
                />
            </div>
        </div>
      </div>
    </div>
  );
});

PodcastPlayer.displayName = 'PodcastPlayer';
