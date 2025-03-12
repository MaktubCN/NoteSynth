export interface Conversation {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  content: string;
  summary: string;
}

export interface Settings {
  recordingInterval: number;
  inputLanguage: string;
  transcriptionModel: string;
  summaryInterval: number;
  summaryLanguage: string;
  summaryModel: string;
  apiBaseUrl: string;
  apiKey: string;
  interfaceLanguage: string;
}

export interface AudioRecorderState {
  isRecording: boolean;
  audioBlob: Blob | null;
  duration: number;
  error: string | null;
}

export interface TranscriptionResult {
  text: string;
  language?: string;
  confidence?: number;
}

export interface SummaryResult {
  text: string;
  language: string;
} 