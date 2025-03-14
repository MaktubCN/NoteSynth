'use client';

import { useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { ApiService } from '@/lib/api';

export function useSummary() {
  const summaryIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const {
    settings,
    currentConversationId,
    conversations,
    isRecording,
    updateSummary,
    addSummaryVersion,
  } = useAppStore();

  useEffect(() => {
    // 清理之前的定时器
    if (summaryIntervalRef.current) {
      clearInterval(summaryIntervalRef.current);
      summaryIntervalRef.current = null;
    }

    // 如果没有正在录音，不启动摘要生成
    if (!isRecording || !currentConversationId || !settings.apiKey) {
      return;
    }

    const currentConversation = conversations.find(
      (conv) => conv.id === currentConversationId
    );
    
    if (!currentConversation) {
      return;
    }

    const api = new ApiService(settings.apiBaseUrl, settings.apiKey);

    // 设置定时器，定期生成摘要
    summaryIntervalRef.current = setInterval(async () => {
      const conversation = conversations.find(
        (conv) => conv.id === currentConversationId
      );
      
      if (!conversation || !conversation.content.trim()) {
        return;
      }

      try {
        // 先清空当前摘要，以便显示流式输出
        updateSummary(conversation.id, '');
        
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
            const currentSummary = conversations.find(c => c.id === conversation.id)?.summary || '';
            updateSummary(conversation.id, currentSummary + chunk);
          }
        );
        
        // 生成完成后，添加到版本历史
        addSummaryVersion(conversation.id, summaryContent);
      } catch (error) {
        console.error('Failed to generate summary:', error);
      }
    }, settings.summaryInterval * 60 * 1000); // 转换为毫秒

    return () => {
      if (summaryIntervalRef.current) {
        clearInterval(summaryIntervalRef.current);
        summaryIntervalRef.current = null;
      }
    };
  }, [
    isRecording,
    currentConversationId,
    settings.apiKey,
    settings.apiBaseUrl,
    settings.summaryInterval,
    settings.summaryModel,
    settings.summaryLanguage,
    conversations,
    updateSummary,
    addSummaryVersion,
  ]);
}