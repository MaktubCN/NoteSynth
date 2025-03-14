import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Conversation, Settings, SummaryVersion } from '@/types';
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
  
  // 笔记版本管理
  addSummaryVersion: (id: string, content: string) => void;
  deleteSummaryVersion: (conversationId: string, summaryId: string) => void;
  nextSummaryVersion: (id: string) => void;
  previousSummaryVersion: (id: string) => void;
  
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
            summaries: [],
            currentSummaryIndex: -1,
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
          summaries: [],
          currentSummaryIndex: -1,
          entries: [],
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
      
      // 添加新的笔记版本
      addSummaryVersion: (id, content) => {
        const summaryId = uuidv4();
        const newSummary: SummaryVersion = {
          id: summaryId,
          content,
          createdAt: new Date().toISOString(),
        };
        
        set((state) => {
          const conversation = state.conversations.find(conv => conv.id === id);
          if (!conversation) return state;
          
          // 确保summaries存在，如果不存在则初始化为空数组
          const existingSummaries = conversation.summaries || [];
          const updatedSummaries = [...existingSummaries, newSummary];
          const newIndex = updatedSummaries.length - 1;
          
          return {
            conversations: state.conversations.map(conv =>
              conv.id === id
                ? {
                    ...conv,
                    summaries: updatedSummaries,
                    currentSummaryIndex: newIndex,
                    summary: content, // 更新兼容字段
                    updatedAt: new Date().toISOString(),
                  }
                : conv
            ),
          };
        });
      },
      
      // 删除笔记版本
      deleteSummaryVersion: (conversationId, summaryId) => {
        set((state) => {
          const conversation = state.conversations.find(conv => conv.id === conversationId);
          if (!conversation || conversation.summaries.length <= 1) return state;
          
          const currentIndex = conversation.currentSummaryIndex;
          const summaryIndex = conversation.summaries.findIndex(s => s.id === summaryId);
          if (summaryIndex === -1) return state;
          
          const updatedSummaries = conversation.summaries.filter(s => s.id !== summaryId);
          let newIndex = currentIndex;
          
          // 调整当前索引
          if (summaryIndex === currentIndex) {
            // 如果删除的是当前显示的版本，显示前一个版本（如果有）
            newIndex = Math.min(currentIndex, updatedSummaries.length - 1);
          } else if (summaryIndex < currentIndex) {
            // 如果删除的版本在当前版本之前，当前索引需要减1
            newIndex = currentIndex - 1;
          }
          
          // 获取新的当前摘要内容
          const newSummaryContent = newIndex >= 0 && updatedSummaries.length > 0 
            ? updatedSummaries[newIndex].content 
            : '';
          
          return {
            conversations: state.conversations.map(conv =>
              conv.id === conversationId
                ? {
                    ...conv,
                    summaries: updatedSummaries,
                    currentSummaryIndex: newIndex,
                    summary: newSummaryContent, // 更新兼容字段
                    updatedAt: new Date().toISOString(),
                  }
                : conv
            ),
          };
        });
      },
      
      // 切换到下一个笔记版本
      nextSummaryVersion: (id) => {
        set((state) => {
          const conversation = state.conversations.find(conv => conv.id === id);
          if (!conversation || conversation.summaries.length <= 1) return state;
          
          const currentIndex = conversation.currentSummaryIndex;
          const nextIndex = (currentIndex + 1) % conversation.summaries.length;
          const nextSummary = conversation.summaries[nextIndex].content;
          
          return {
            conversations: state.conversations.map(conv =>
              conv.id === id
                ? {
                    ...conv,
                    currentSummaryIndex: nextIndex,
                    summary: nextSummary, // 更新兼容字段
                  }
                : conv
            ),
          };
        });
      },
      
      // 切换到上一个笔记版本
      previousSummaryVersion: (id) => {
        set((state) => {
          const conversation = state.conversations.find(conv => conv.id === id);
          if (!conversation || conversation.summaries.length <= 1) return state;
          
          const currentIndex = conversation.currentSummaryIndex;
          const prevIndex = (currentIndex - 1 + conversation.summaries.length) % conversation.summaries.length;
          const prevSummary = conversation.summaries[prevIndex].content;
          
          return {
            conversations: state.conversations.map(conv =>
              conv.id === id
                ? {
                    ...conv,
                    currentSummaryIndex: prevIndex,
                    summary: prevSummary, // 更新兼容字段
                  }
                : conv
            ),
          };
        });
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
          let summaryContent = '';
          
          // 使用流式API
          await api.summarizeStream(
            conversation.content, 
            {
              model: settings.summaryModel,
              language: settings.summaryLanguage,
            },
            (chunk) => {
              // 每收到一个数据块，就更新摘要
              summaryContent += chunk;
              const currentSummary = get().conversations.find(c => c.id === conversation.id)?.summary || '';
              get().updateSummary(conversation.id, currentSummary + chunk);
            }
          );
          
          // 生成完成后，添加到版本历史
          get().addSummaryVersion(conversation.id, summaryContent);
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