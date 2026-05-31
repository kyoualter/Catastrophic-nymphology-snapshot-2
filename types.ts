// types.ts
export type ConversationEntry = {
  id: string; // Unique ID for React key
  source: 'user-text' | 'user-image' | 'model' | 'system-message' | 'user-chart-request'; // 'user-chart-request' for chart analysis
  text?: string; // For display: user text, model responses, system messages, or image captions
  imageData?: string; // base64 string for user-uploaded images
  imageMimeType?: string; // Mime type of the uploaded image
  rawPrompt?: string; // The exact text sent to the API, for history reconstruction
};
