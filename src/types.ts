export type TranscriptionModel = 'whisper-1' | 'openai/whisper-large-v3-turbo';

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

export interface SummaryVersion {
  id: string;
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  content: string;
  summary: string; // 保留向后兼容
  summaries: SummaryVersion[];
  currentSummaryIndex: number;
  entries: TranscriptionEntry[];
}