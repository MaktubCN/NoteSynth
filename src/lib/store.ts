import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Conversation, Settings } from '@/types';

interface AppState {
  conversations: Conversation[];
  currentConversationId: string | null;
  settings: Settings;
  isRecording: boolean;
  isProcessing: boolean;
  recordingDuration: number;
  
  // 对话管理
  createConversation: () => string;
  setCurrentConversation: (id: string) => void;
  updateConversation: (id: string, data: Partial<Conversation>) => void;
  deleteConversation: (id: string) => void;
  
  // 录音状态管理
  setIsRecording: (value: boolean) => void;
  setIsProcessing: (value: boolean) => void;
  
  // 设置管理
  updateSettings: (settings: Settings) => void;
  
  // 内容管理
  addTranscription: (id: string, text: string) => void;
  updateSummary: (id: string, summary: string) => void;
  
  // 录音相关方法
  startRecording: () => void;
  stopRecording: () => void;
  updateRecordingDuration: (duration: number) => void;
}

const defaultSettings: Settings = {
  apiBaseUrl: 'https://api.openai.com',
  apiKey: '',
  inputLanguage: 'auto',
  transcriptionModel: 'whisper-1',
  summaryLanguage: 'en',
  summaryModel: 'gpt-4',
  recordingInterval: 30,
  summaryInterval: 5,
  interfaceLanguage: 'en',
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      conversations: [],
      currentConversationId: null,
      settings: defaultSettings,
      isRecording: false,
      isProcessing: false,
      recordingDuration: 0,
      
      createConversation: () => {
        const id = uuidv4();
        const newConversation: Conversation = {
          id,
          name: 'New Conversation',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          content: '',
          summary: '',
        };
        
        set((state) => ({
          conversations: [newConversation, ...state.conversations],
          currentConversationId: id,
        }));
        
        return id;
      },
      
      setCurrentConversation: (id) => {
        set({ currentConversationId: id });
      },
      
      updateConversation: (id, data) => {
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === id
              ? { ...conv, ...data, updatedAt: new Date().toISOString() }
              : conv
          ),
        }));
      },
      
      deleteConversation: (id) => {
        const { conversations, currentConversationId } = get();
        const newConversations = conversations.filter((conv) => conv.id !== id);
        
        set({
          conversations: newConversations,
          currentConversationId:
            currentConversationId === id
              ? newConversations.length > 0
                ? newConversations[0].id
                : null
              : currentConversationId,
        });
      },
      
      setIsRecording: (value) => {
        set({ isRecording: value });
      },
      
      setIsProcessing: (value) => {
        set({ isProcessing: value });
      },
      
      updateSettings: (settings) => set({ settings }),
      
      addTranscription: (id, text) => {
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === id
              ? {
                  ...conv,
                  content: conv.content ? `${conv.content}\n${text}` : text,
                  updatedAt: new Date().toISOString(),
                }
              : conv
          ),
        }));
      },
      
      updateSummary: (id, summary) => {
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === id
              ? { ...conv, summary, updatedAt: new Date().toISOString() }
              : conv
          ),
        }));
      },
      
      startRecording: () => set({ isRecording: true, recordingDuration: 0 }),
      stopRecording: () => set({ isRecording: false }),
      updateRecordingDuration: (duration) => set({ recordingDuration: duration }),
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({ settings: state.settings }),
    }
  )
); 