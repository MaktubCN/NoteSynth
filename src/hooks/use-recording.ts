import { useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { RecordingService } from '@/lib/recording';

export function useRecording() {
  const recordingService = useRef<RecordingService | null>(null);
  const {
    settings,
    currentConversationId,
    isRecording,
    startRecording: startRecordingStore,
    stopRecording: stopRecordingStore,
    updateRecordingDuration,
    addTranscription,
  } = useAppStore();

  useEffect(() => {
    recordingService.current = new RecordingService();
    
    return () => {
      recordingService.current?.stop();
    };
  }, []);

  const startRecording = async () => {
    if (!currentConversationId) return;
    if (!settings.apiKey) {
      console.error('API Key is not configured');
      return;
    }

    try {
      await recordingService.current?.start(
        {
          apiBaseUrl: settings.apiBaseUrl,
          apiKey: settings.apiKey,
          inputLanguage: settings.inputLanguage,
          transcriptionModel: settings.transcriptionModel,
          recordingInterval: settings.recordingInterval,
        },
        (text) => {
          if (text && text.trim()) {
            addTranscription(currentConversationId, text);
          }
        },
        (duration) => updateRecordingDuration(duration)
      );
      startRecordingStore();
    } catch (error) {
      console.error('Failed to start recording:', error);
      stopRecordingStore();
    }
  };

  const stopRecording = () => {
    recordingService.current?.stop();
    stopRecordingStore();
  };

  return { startRecording, stopRecording };
} 