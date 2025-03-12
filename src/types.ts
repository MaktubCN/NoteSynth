export interface Settings {
  apiBaseUrl: string;
  apiKey: string;
  inputLanguage: string;
  transcriptionModel: string;
  summaryLanguage: string;
  summaryModel: string;
  recordingInterval: number;
  summaryInterval: number;
  interfaceLanguage: string;
}

export interface Conversation {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  content: string;
  summary: string;
} 