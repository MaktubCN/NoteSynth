export type TranscriptionModel = 'whisper-1' | 'whisper-large-v3-turbo';

export interface Settings {
  apiBaseUrl: string;
  apiKey: string;
  inputLanguage: string;
  transcriptionModel: TranscriptionModel;
  summaryLanguage: string;
  summaryModel: string;
  recordingInterval: number;
  summaryInterval: number;
  interfaceLanguage: string;
  showTimestamp: boolean;
}

export interface TranscriptionEntry {
  timestamp: string;
  content: string;
}

export interface Conversation {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  content: string;
  summary: string;
  entries: TranscriptionEntry[];
}