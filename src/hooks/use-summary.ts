import { useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { SummaryService } from '@/lib/summary';

export function useSummary() {
  const summaryService = useRef<SummaryService | null>(null);
  const {
    settings,
    currentConversationId,
    conversations,
    isRecording,
    updateSummary,
  } = useAppStore();

  useEffect(() => {
    summaryService.current = new SummaryService();
  }, []);

  useEffect(() => {
    if (isRecording && currentConversationId) {
      summaryService.current?.start(
        {
          apiBaseUrl: settings.apiBaseUrl,
          apiKey: settings.apiKey,
          summaryLanguage: settings.summaryLanguage,
          summaryModel: settings.summaryModel,
          summaryInterval: settings.summaryInterval,
        },
        () => {
          const conversation = conversations.find((conv) => conv.id === currentConversationId);
          return conversation?.content ?? '';
        },
        (summary) => updateSummary(currentConversationId, summary)
      );
    } else {
      summaryService.current?.stop();
    }

    return () => {
      summaryService.current?.stop();
    };
  }, [
    isRecording,
    currentConversationId,
    settings.apiBaseUrl,
    settings.apiKey,
    settings.summaryLanguage,
    settings.summaryModel,
    settings.summaryInterval,
    conversations,
    updateSummary,
  ]);
} 