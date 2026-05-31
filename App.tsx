
import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { Chat, Content, Part } from "@google/genai";
import { Header } from './components/Header';
import { ScriptInput } from './components/ScriptInput';
import { ScriptDisplay } from './components/ScriptDisplay';
import { ErrorMessage } from './components/ErrorMessage';
import { CallInSection } from './components/CallInSection';
import { ImageUpload } from './components/ImageUpload';
import { ChartAnalysisSection } from './components/ChartAnalysisSection';
import { SessionManager } from './components/SessionManager';
import { PodcastPlayer, PodcastPlayerHandle } from './components/PodcastPlayer';
import { DeepDiveSection } from './components/DeepDiveSection';
import { startInitialScriptAndChatSession, sendMessageToChat, restoreChatSession } from './services/geminiService';
import type { ConversationEntry } from './types';
import { DEFAULT_EXEGESIS_TEXT, getInitialScriptGenerationPrompt, getSelfHelpScriptGenerationPrompt, getJustChattingPrompt, getDeepDivePrompt, DEFAULT_SELF_HELP_QUESTION, DEFAULT_JUST_CHATTING_TOPIC, HOST_LIST } from './constants';

type SavedSession = {
  conversation: ConversationEntry[];
  selectedHosts: string[];
  exegesisText: string;
  selfHelpQuestion: string;
  justChattingTopic: string;
  initialSessionType: 'exegesis' | 'selfHelp' | 'justChatting' | 'deepDive';
};

const SESSION_STORAGE_KEY = 'catastrophicNymphologySession';

const App: React.FC = () => {
  const [textToAnalyze, setTextToAnalyze] = useState<string>(DEFAULT_EXEGESIS_TEXT);
  const [selfHelpQuestion, setSelfHelpQuestion] = useState<string>(DEFAULT_SELF_HELP_QUESTION);
  const [justChattingTopic, setJustChattingTopic] = useState<string>(DEFAULT_JUST_CHATTING_TOPIC);
  
  const [selectedHosts, setSelectedHosts] = useState<string[]>(['Anna', 'Utaha Kasumigaoka', 'Ryo']);
  const [conversation, setConversation] = useState<ConversationEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMastering, setIsMastering] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [callInText, setCallInText] = useState<string>('');
  const [isCallingIn, setIsCallingIn] = useState<boolean>(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState<boolean>(false);
  const [isAnalyzingChart, setIsAnalyzingChart] = useState<boolean>(false);
  
  const [activeTab, setActiveTab] = useState<'exegesis' | 'selfHelp' | 'justChatting'>('justChatting');
  const [initialSessionType, setInitialSessionType] = useState<'exegesis' | 'selfHelp' | 'justChatting' | 'deepDive' | null>(null);
  const [hasSavedSession, setHasSavedSession] = useState<boolean>(false);

  // Audio Playback State
  const [playingLineId, setPlayingLineId] = useState<string | null>(null);
  const [requestedPlayId, setRequestedPlayId] = useState<{ id: string; ts: number } | null>(null);

  const chatInstanceRef = useRef<Chat | null>(null);
  const playerRef = useRef<PodcastPlayerHandle>(null);
  const scriptDisplayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(SESSION_STORAGE_KEY);
    if (saved) setHasSavedSession(true);
  }, []);

  const handleHostSelectionChange = (hostName: string, isSelected: boolean) => {
    setSelectedHosts(prev => {
        const newSelection = new Set(prev);
        if (isSelected) newSelection.add(hostName);
        else newSelection.delete(hostName);
        const orderedSelection = [...prev];
        if (isSelected && !orderedSelection.includes(hostName)) {
            orderedSelection.push(hostName);
        } else if (!isSelected) {
            const index = orderedSelection.indexOf(hostName);
            if (index > -1) orderedSelection.splice(index, 1);
        }
        return orderedSelection;
    });
  };

  const handleGenerateScript = useCallback(async () => {
    const type = activeTab;
    if (selectedHosts.length === 0) {
        setError("Please designate at least one theologian.");
        return;
    }
    let initialPrompt = '';
    if (type === 'exegesis') initialPrompt = getInitialScriptGenerationPrompt(textToAnalyze, selectedHosts);
    else if (type === 'selfHelp') initialPrompt = getSelfHelpScriptGenerationPrompt(selfHelpQuestion, selectedHosts);
    else initialPrompt = getJustChattingPrompt(justChattingTopic, selectedHosts);

    setIsLoading(true);
    setError(null);
    setConversation([]);
    chatInstanceRef.current = null;
    setInitialSessionType(type);

    try {
      const { chat, initialScript } = await startInitialScriptAndChatSession(initialPrompt, selectedHosts);
      chatInstanceRef.current = chat;
      setConversation([{ id: Date.now().toString(), source: 'model', text: initialScript }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Metabolism failed');
      setInitialSessionType(null);
    } finally {
      setIsLoading(false);
    }
  }, [selectedHosts, activeTab, textToAnalyze, selfHelpQuestion, justChattingTopic]);

  const handleDeepDive = useCallback(async (file: File) => {
    if (selectedHosts.length === 0) {
        setError("Please designate hostesses first.");
        return;
    }
    setIsLoading(true);
    setError(null);
    setConversation([]);
    setInitialSessionType('deepDive');

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = (reader.result as string).split(',')[1];
      const prompt = getDeepDivePrompt(selectedHosts);

      try {
        const { chat, initialScript } = await startInitialScriptAndChatSession(prompt, selectedHosts, {
            data: base64Data,
            mimeType: 'application/pdf'
        });
        chatInstanceRef.current = chat;
        setConversation([{ id: Date.now().toString(), source: 'model', text: initialScript }]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Deep dive metabolism failed');
        setInitialSessionType(null);
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsDataURL(file);
  }, [selectedHosts]);

  const handleCallIn = useCallback(async () => {
    if (!callInText.trim() || !chatInstanceRef.current) return;
    setIsCallingIn(true);
    const userMessageEntry: ConversationEntry = { id: `${Date.now()}-user-text`, source: 'user-text', text: callInText, rawPrompt: callInText };
    setConversation(prev => [...prev, userMessageEntry]);
    const continuityPrompt = `[LIVE CONFESSION INTERRUPTION]: "${callInText}"`;
    setCallInText(''); 
    try {
      const hostResponse = await sendMessageToChat(chatInstanceRef.current, continuityPrompt);
      setConversation(prev => [...prev, { id: `${Date.now()}-model`, source: 'model', text: hostResponse }]);
    } catch (err) {
      setError('Liturgy interrupted unexpectedly');
    } finally {
      setIsCallingIn(false);
    }
  }, [callInText]);

  const handleImageAnalysis = useCallback(async (file: File, caption?: string) => {
    if (!chatInstanceRef.current) return;
    setIsAnalyzingImage(true);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = (reader.result as string).split(',')[1];
      const prompt = `[ICONOGRAPHIC OFFERING]: ${caption || "Analyze the aesthetics of this emanation."}`;
      
      const userEntry: ConversationEntry = {
        id: `${Date.now()}-user-image`,
        source: 'user-image',
        text: caption,
        imageData: reader.result as string,
        imageMimeType: file.type,
        rawPrompt: prompt
      };
      setConversation(prev => [...prev, userEntry]);

      try {
        const parts: Part[] = [
          { text: prompt },
          { inlineData: { data: base64Data, mimeType: file.type } }
        ];
        const hostResponse = await sendMessageToChat(chatInstanceRef.current!, parts);
        setConversation(prev => [...prev, { id: `${Date.now()}-model`, source: 'model', text: hostResponse }]);
      } catch (err) {
        setError('Aesthetic metabolism failed');
      } finally {
        setIsAnalyzingImage(false);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const handleChartAnalysis = useCallback(async (file: File, question?: string) => {
    if (!chatInstanceRef.current) return;
    setIsAnalyzingChart(true);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = (reader.result as string).split(',')[1];
      const prompt = `[BIRTH CHART EXEGESIS]: ${question || "Dismantle the cosmic anatomy of this seeker."}`;
      
      const userEntry: ConversationEntry = {
        id: `${Date.now()}-user-chart`,
        source: 'user-chart-request',
        text: question,
        imageData: reader.result as string,
        imageMimeType: file.type,
        rawPrompt: prompt
      };
      setConversation(prev => [...prev, userEntry]);

      try {
        const parts: Part[] = [
          { text: prompt },
          { inlineData: { data: base64Data, mimeType: file.type } }
        ];
        const hostResponse = await sendMessageToChat(chatInstanceRef.current!, parts);
        setConversation(prev => [...prev, { id: `${Date.now()}-model`, source: 'model', text: hostResponse }]);
      } catch (err) {
        setError('Cosmic exegesis failed');
      } finally {
        setIsAnalyzingChart(false);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const handleSaveSession = useCallback(() => {
    if (conversation.length === 0) return;
    const session: SavedSession = {
      conversation,
      selectedHosts,
      exegesisText: textToAnalyze,
      selfHelpQuestion,
      justChattingTopic,
      initialSessionType: initialSessionType || 'justChatting'
    };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    setHasSavedSession(true);
  }, [conversation, selectedHosts, textToAnalyze, selfHelpQuestion, justChattingTopic, initialSessionType]);

  const handleLoadSession = useCallback(async () => {
    const saved = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!saved) return;
    const session: SavedSession = JSON.parse(saved);
    
    setConversation(session.conversation);
    setSelectedHosts(session.selectedHosts);
    setTextToAnalyze(session.exegesisText);
    setSelfHelpQuestion(session.selfHelpQuestion);
    setJustChattingTopic(session.justChattingTopic);
    setInitialSessionType(session.initialSessionType);

    const history: Content[] = [];
    session.conversation.forEach(entry => {
      if (entry.source === 'model' && entry.text) {
        history.push({ role: 'model', parts: [{ text: entry.text }] });
      } else if (entry.source === 'user-text' && entry.rawPrompt) {
        history.push({ role: 'user', parts: [{ text: entry.rawPrompt }] });
      }
    });

    try {
      chatInstanceRef.current = await restoreChatSession(session.selectedHosts, history);
    } catch (err) {
      setError("Fidelity to session failed, but scripture remains.");
    }
  }, []);

  const handleDeleteSaved = useCallback(() => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setHasSavedSession(false);
  }, []);

  const handleDownloadTranscript = useCallback(() => {
    if (conversation.length === 0) return;
    let transcript = `Catastrophic Nymphology Studio Transcript\n`;
    transcript += `Theology of Desire Session: ${new Date().toLocaleString()}\n`;
    transcript += `Theologians: ${selectedHosts.join(', ')}\n\n`;

    conversation.forEach(entry => {
      if (entry.source === 'model') transcript += `${entry.text}\n\n`;
      else if (entry.source === 'user-text') transcript += `SEEKER: ${entry.text}\n\n`;
      else if (entry.source === 'user-image') transcript += `[ICONOGRAPHIC OFFERING]: ${entry.text || 'No caption'}\n\n`;
      else if (entry.source === 'user-chart-request') transcript += `[COSMIC ANATOMY]: ${entry.text || 'No question'}\n\n`;
    });

    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Catastrophic_Nymphology_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [conversation, selectedHosts]);

  const handleExportMP3 = useCallback(() => {
    if (playerRef.current) playerRef.current.exportMP3();
  }, []);

  const hasActiveSession = !!chatInstanceRef.current && conversation.length > 0;
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100 font-sans items-center p-4 sm:p-8 selection:bg-pink-500 selection:text-white pb-48">
      <Header />
      
      {!hasActiveSession && (
        <>
            <ScriptInput
                exegesisText={textToAnalyze}
                setExegesisText={setTextToAnalyze}
                selfHelpQuestion={selfHelpQuestion}
                setSelfHelpQuestion={setSelfHelpQuestion}
                justChattingTopic={justChattingTopic}
                setJustChattingTopic={setJustChattingTopic}
                onGenerate={handleGenerateScript}
                isLoading={isLoading}
                selectedHosts={selectedHosts}
                allHostNames={HOST_LIST}
                onHostChange={handleHostSelectionChange}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />
            <DeepDiveSection onDeepDiveSubmit={handleDeepDive} isLoading={isLoading} />
        </>
      )}

      {error && <ErrorMessage message={error} />}

      {hasActiveSession && (
          <SessionManager 
            onSave={handleSaveSession}
            onLoad={handleLoadSession}
            onReset={() => { setConversation([]); chatInstanceRef.current = null; setInitialSessionType(null); }}
            onDeleteSaved={handleDeleteSaved}
            onDownload={handleDownloadTranscript}
            onExportMP3={handleExportMP3}
            isSessionActive={hasActiveSession}
            hasSavedSession={hasSavedSession}
            isMastering={isMastering}
          />
      )}
      
      {conversation.length > 0 && (
        <ScriptDisplay 
          conversation={conversation} 
          ref={scriptDisplayRef} 
          onPlayLine={(id) => setRequestedPlayId({ id, ts: Date.now() })}
          onDownload={handleDownloadTranscript}
          onDownloadMP3={handleExportMP3}
          playingLineId={playingLineId}
        />
      )}

      {hasActiveSession && !isLoading && (
        <div className="flex flex-col items-center w-full space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-4xl">
              <ImageUpload 
                onImageSubmit={handleImageAnalysis} 
                isLoading={isAnalyzingImage} 
                chatActive={hasActiveSession} 
              />
              <ChartAnalysisSection 
                onChartSubmit={handleChartAnalysis} 
                isLoading={isAnalyzingChart} 
                chatActive={hasActiveSession} 
              />
            </div>
            
            <CallInSection
              callInText={callInText}
              setCallInText={setCallInText}
              onSendCallIn={handleCallIn}
              isLoading={isCallingIn}
            />
        </div>
      )}

      <PodcastPlayer 
        ref={playerRef}
        conversation={conversation} 
        setPlayingLineId={setPlayingLineId} 
        requestedPlayId={requestedPlayId} 
        onMasteringStateChange={setIsMastering}
      />

      <footer className="mt-12 text-center text-gray-600 text-[10px] font-black uppercase tracking-[0.2em] opacity-50">
        <p>&copy; {new Date().getFullYear()} Catastrophic Nymphology Studio.</p>
        <p>Mastered via <strong>Gemini 2.5 Flash Native Audio</strong>.</p>
      </footer>
    </div>
  );
};

export default App;
