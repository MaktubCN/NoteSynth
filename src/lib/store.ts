import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Conversation, Settings } from '@/types';
import { ApiService } from './api';

interface AppState {
  conversations: Conversation[];
  currentConversationId: string | null;
  settings: Settings;
  isRecording: boolean;
  isProcessing: boolean;
  recordingDuration: number;
  transcriptionBuffer: string;
  
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
  clearTranscriptionBuffer: () => void;
  generateManualSummary: () => Promise<void>;
  exportSummary: (id: string) => void;
  
  // 录音相关方法
  startRecording: () => void;
  stopRecording: () => void;
  updateRecordingDuration: (duration: number) => void;
}

const defaultSettings: Settings = {
  apiBaseUrl: 'https://api.openai.com',
  apiKey: '',
  inputLanguage: 'auto',
  transcriptionModel: 'whisper-1', // 保持默认使用 whisper-1
  summaryLanguage: 'en',
  summaryModel: 'gpt-4',
  recordingInterval: 30,
  summaryInterval: 5,
  interfaceLanguage: 'en',
  showTimestamp: true,
};

export const useAppStore = create<AppState>()(persist(
    (set, get) => ({
      conversations: [],
      currentConversationId: null,
      settings: defaultSettings,
      isRecording: false,
      isProcessing: false,
      recordingDuration: 0,
      transcriptionBuffer: '',

      // 初始化时创建默认会话
      _createDefaultConversation: () => {
        const { conversations } = get();
        if (conversations.length === 0) {
          const id = uuidv4();
          const newConversation: Conversation = {
            id,
            name: 'New Conversation',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            content: '',
            summary: '',
            entries: [],
          };
          set({
            conversations: [newConversation],
            currentConversationId: id,
          });
        }
      },
      createConversation: () => {
        const id = uuidv4();
        const newConversation: Conversation = {
          id,
          name: 'New Conversation',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          content: '',
          summary: '',
          entries: [], // 添加这一行初始化 entries 数组
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
        const timestamp = new Date().toISOString();
        const entry: TranscriptionEntry = {
          timestamp,
          content: text
        };
        
        set((state) => ({
          transcriptionBuffer: state.transcriptionBuffer + (state.transcriptionBuffer ? '\n' : '') + text,
          conversations: state.conversations.map((conv) =>
            conv.id === id
              ? {
                  ...conv,
                  content: conv.content ? `${conv.content}\n${text}` : text,
                  entries: [...conv.entries, entry],
                  updatedAt: timestamp,
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
      
      clearTranscriptionBuffer: () => set({ transcriptionBuffer: '' }),
      
      generateManualSummary: async () => {
        const { currentConversationId, conversations, settings, transcriptionBuffer } = get();
        if (!currentConversationId || !settings.apiKey) return;

        const conversation = conversations.find((conv) => conv.id === currentConversationId);
        if (!conversation) return;

        try {
          set({ isProcessing: true });
          // 先清空当前摘要，以便显示流式输出
          get().updateSummary(conversation.id, '');
          
          const api = new ApiService(settings.apiBaseUrl, settings.apiKey);
          
          // 使用流式API
          await api.summarizeStream(
            conversation.content, 
            {
              model: settings.summaryModel,
              language: settings.summaryLanguage,
            },
            (chunk) => {
              // 每收到一个数据块，就更新摘要
              const currentSummary = get().conversations.find(c => c.id === conversation.id)?.summary || '';
              get().updateSummary(conversation.id, currentSummary + chunk);
            }
          );
          
          get().clearTranscriptionBuffer();
        } catch (error) {
          console.error('Failed to generate manual summary:', error);
        } finally {
          set({ isProcessing: false });
        }
      },
      
      exportSummary: (id) => {
        const conversation = get().conversations.find((conv) => conv.id === id);
        if (!conversation?.summary) return;
        
        const blob = new Blob([conversation.summary], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${conversation.name}-summary.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      },
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({ settings: state.settings, conversations: state.conversations }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._createDefaultConversation();
        }
      },
    }
  )
);