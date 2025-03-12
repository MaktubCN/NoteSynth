# NoteSynth 项目文档

## 1. 项目概述

NoteSynth 是一个课堂自动笔记工具，能够自动记录和总结课堂内容。该应用支持音频录制、语音转文字、自动总结等功能，并提供多语言支持（中文和英文）。

## 2. 需求分析

### 2.1 功能需求

#### 核心功能

1. **音频录制与转写**
   - 实时录制音频
   - 支持音频文件上传
   - 将语音转换为文字
   - 支持多语言输入（自动识别、中文、英文）
   - 支持选择不同的转录模型

2. **笔记管理**
   - 创建新对话/笔记
   - 编辑对话/笔记名称
   - 删除对话/笔记
   - 查看历史对话/笔记列表

3. **内容总结**
   - 自动总结录制内容
   - 支持手动触发总结
   - 支持选择总结语言（中文、英文）
   - 支持选择不同的总结模型
   - 导出总结内容

4. **设置管理**
   - 主题设置（明亮模式、黑暗模式、跟随系统）
   - 界面语言设置（默认英文，可选中文）
   - 录音设置（录音时间间隔、输入语言、转录模型）
   - 总结设置（自动总结间隔、总结语言、总结模型）
   - API设置（API URL、API密钥）

### 2.2 非功能需求

1. **用户体验**
   - 响应式设计，适配不同设备
   - 直观的用户界面
   - 实时反馈（录音状态、处理状态等）
   - 多语言界面支持（英文和中文）

2. **性能要求**
   - 音频处理的低延迟
   - 快速的语音转文字响应
   - 高效的内容总结
   - 不同模型间的性能平衡

3. **安全性**
   - 安全处理API密钥
   - 保护用户数据隐私

4. **可扩展性**
   - 支持添加更多界面语言
   - 支持集成更多AI模型和版本

## 3. UI设计

### 3.1 整体布局

应用采用分栏式布局，主要包括：

1. **左侧边栏**：对话/笔记列表，新建对话按钮，设置按钮
2. **主内容区**：分为上下两部分
   - 上部：转写内容显示区
   - 下部：总结内容显示区
3. **功能按钮区**：录音控制、上传音频、导出总结等功能按钮

### 3.2 主要页面与组件

#### 主页面

- 对话列表显示
- 转写内容实时显示
- 总结内容显示
- 录音控制按钮
- 上传音频按钮
- 设置按钮

#### 设置对话框

- 主题设置选项
- 界面语言设置选项（默认英文，可选中文）
- 录音设置选项（包括转录模型选择）
- 总结设置选项（包括总结模型选择）
- API设置选项

### 3.3 响应式设计

- 在大屏设备上显示完整的分栏布局
- 在小屏设备上可折叠侧边栏，专注显示主要内容
- 使用可调整大小的面板，用户可自定义内容区域比例

### 3.4 主题支持

- 明亮模式：适合日间使用
- 黑暗模式：适合夜间使用
- 系统模式：跟随系统设置自动切换

## 4. 技术栈

### 4.1 前端技术

- **框架**：Next.js 15.2.1（React 19）
- **语言**：TypeScript 5
- **状态管理**：Zustand 5.0.3
- **国际化**：next-intl 3.26.5
- **UI组件**：
  - Radix UI（对话框、图标等）
  - Lucide React（图标）
  - Tailwind CSS（样式）
  - React Markdown（Markdown渲染）
  - React Syntax Highlighter（代码高亮）
  - React Resizable Panels（可调整大小的面板）

### 4.2 核心依赖

```json
{
  "dependencies": {
    "@radix-ui/react-dialog": "^1.1.6",
    "@radix-ui/react-icons": "^1.3.2",
    "@radix-ui/react-slot": "^1.1.2",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.479.0",
    "next": "15.2.1",
    "next-intl": "^3.26.5",
    "next-themes": "^0.4.5",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-markdown": "^10.1.0",
    "react-resizable-panels": "^2.1.7",
    "react-syntax-highlighter": "^15.6.1",
    "remark-gfm": "^4.0.1",
    "tailwind-merge": "^3.0.2",
    "tailwindcss-animate": "^1.0.7",
    "zustand": "^5.0.3"
  }
}
```

### 4.3 项目结构

```
notesynth/
├── public/              # 静态资源
├── src/
│   ├── app/            # 应用页面
│   │   ├── [locale]/   # 本地化页面
│   │   ├── api/        # API路由
│   │   └── layout.tsx  # 根布局
│   ├── components/     # 组件
│   │   ├── audio/      # 音频相关组件
│   │   ├── providers/  # 提供者组件
│   │   ├── settings/   # 设置相关组件
│   │   └── ui/         # UI组件
│   ├── hooks/          # 自定义钩子
│   ├── lib/            # 工具库
│   ├── messages/       # 国际化消息
│   └── types/          # 类型定义
├── next-intl.config.js # 国际化配置
├── next.config.js      # Next.js配置
└── package.json        # 项目依赖
```

## 5. 核心功能实现

### 5.1 状态管理

项目使用Zustand进行状态管理，主要状态包括：

```typescript
interface AppState {
  conversations: Conversation[];
  currentConversationId: string | null;
  settings: Settings;
  isRecording: boolean;
  // 状态更新方法...
}

interface Settings {
  recordingInterval: number;
  inputLanguage: string;
  transcriptionModel: string; // 转录模型
  summaryInterval: number;
  summaryLanguage: string;
  summaryModel: string; // 总结模型
  apiBaseUrl: string;
  apiKey: string;
  interfaceLanguage: string; // 界面语言，默认'en'
}
```

完整的状态管理实现：

```typescript
// src/store/index.ts
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
  
  // 对话管理
  createConversation: () => void;
  setCurrentConversation: (id: string) => void;
  updateConversation: (id: string, data: Partial<Conversation>) => void;
  deleteConversation: (id: string) => void;
  
  // 录音状态管理
  setIsRecording: (value: boolean) => void;
  setIsProcessing: (value: boolean) => void;
  
  // 设置管理
  updateSettings: (settings: Partial<Settings>) => void;
  
  // 内容管理
  addTranscription: (id: string, text: string) => void;
  updateSummary: (id: string, summary: string) => void;
}

// 默认设置
const defaultSettings: Settings = {
  recordingInterval: 10, // 10秒
  inputLanguage: 'auto', // 自动检测
  transcriptionModel: 'whisper-1',
  summaryInterval: 5, // 5分钟
  summaryLanguage: 'zh', // 默认中文总结
  summaryModel: 'gpt-4o',
  apiBaseUrl: 'https://api.openai.com/v1',
  apiKey: '',
  interfaceLanguage: 'en', // 默认英文界面
};

export const useAppStore = create<AppState>(
  persist(
    (set, get) => ({
      conversations: [],
      currentConversationId: null,
      settings: defaultSettings,
      isRecording: false,
      isProcessing: false,
      
      // 对话管理
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
      
      // 录音状态管理
      setIsRecording: (value) => {
        set({ isRecording: value });
      },
      
      setIsProcessing: (value) => {
        set({ isProcessing: value });
      },
      
      // 设置管理
      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },
      
      // 内容管理
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
    }),
    {
      name: 'notesynth-storage',
      partialize: (state) => ({
        conversations: state.conversations,
        settings: state.settings,
      }),
    }
  )
);
```

### 5.2 音频录制与转写

#### 音频录制

使用Web Audio API和MediaRecorder API实现音频录制功能：

```typescript
// src/hooks/useAudioRecorder.ts
import { useState, useRef, useCallback, useEffect } from 'react';
import { useAppStore } from '@/store';
import { transcribeAudio } from '@/lib/api';

export function useA