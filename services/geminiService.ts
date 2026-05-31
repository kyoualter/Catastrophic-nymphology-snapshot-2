
import { GoogleGenAI, GenerateContentResponse, Chat, Part, Content, Modality } from "@google/genai";
import { getChatSystemInstruction } from '../constants';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY environment variable is not set.");
  return new GoogleGenAI({ apiKey });
};

/**
 * Refined safety settings using full canonical string names.
 * Using BLOCK_ONLY_HIGH is generally safer for API compliance than BLOCK_NONE.
 */
const safetySettings = [
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' }
];

export const startInitialScriptAndChatSession = async (
    initialPrompt: string, 
    selectedHosts: string[],
    documentPart?: { data: string, mimeType: string }
): Promise<{ chat: Chat, initialScript: string }> => {
  const ai = getClient();

  try {
    const chat = ai.chats.create({
      model: "gemini-3-pro-preview",
      config: { 
        systemInstruction: getChatSystemInstruction(selectedHosts),
        temperature: 0.8,
        safetySettings: safetySettings
      }
    });

    const parts: Part[] = [{ text: initialPrompt }];
    if (documentPart) {
        parts.push({ inlineData: { data: documentPart.data, mimeType: documentPart.mimeType } });
    }

    const response: GenerateContentResponse = await chat.sendMessage({ message: parts });
    
    let initialScript = "";
    try {
      initialScript = response.text?.trim() || "";
    } catch (e) {
      console.warn("Direct .text access failed, falling back to part inspection.");
    }
    
    if (!initialScript && response.candidates && response.candidates.length > 0) {
      const firstCandidate = response.candidates[0];
      if (firstCandidate.content && firstCandidate.content.parts) {
        initialScript = firstCandidate.content.parts
          .map(p => p.text || '')
          .join('')
          .trim();
      }
    }

    if (!initialScript) {
      const candidate = response.candidates?.[0];
      const finishReason = candidate?.finishReason;
      
      if (finishReason === 'SAFETY') {
        throw new Error("The divine metabolism was halted by safety filters. The query may be too explicit for the current theological constraints. Try abstracting your request into more philosophical terms.");
      }
      
      throw new Error(`The oracle returned an empty revelation. (Reason: ${finishReason || 'unspecified_refusal'})`);
    }

    return { chat, initialScript };
  } catch (error) {
    console.error("Gemini API Error details:", error);
    throw error;
  }
};

export const sendMessageToChat = async (chat: Chat, message: string | Part[]): Promise<string> => {
  try {
    const response: GenerateContentResponse = await chat.sendMessage({ message });
    let text = "";
    try {
      text = response.text?.trim() || "";
    } catch (e) {}
    
    if (!text && response.candidates?.[0]?.finishReason === 'SAFETY') {
        throw new Error("Liturgy blocked by safety filters. Reframe the inquiry.");
    }
    
    if (!text && response.candidates?.length) {
        const firstCandidate = response.candidates[0];
        if (firstCandidate.content && firstCandidate.content.parts) {
          return firstCandidate.content.parts.map(p => p.text || '').join('') || "";
        }
    }
    
    return text || "";
  } catch (error) {
    throw error;
  }
};

export const restoreChatSession = async (selectedHosts: string[], history: Content[]): Promise<Chat> => {
  const ai = getClient();
  return ai.chats.create({
    model: "gemini-3-pro-preview",
    config: { 
      systemInstruction: getChatSystemInstruction(selectedHosts),
      temperature: 0.8,
      safetySettings: safetySettings
    },
    history: history,
  });
};

export const generateSpeech = async (text: string, voiceName: string, actingInstruction: string): Promise<string> => {
  const ai = getClient();
  const prompt = `[Acting Instruction: ${actingInstruction}] Text to speak: ${text}`;
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
    },
  });
  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("No audio data returned for speech generation.");
  return base64Audio;
};
