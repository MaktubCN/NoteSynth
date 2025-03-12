'use client';

import { useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { Mic, Square } from 'lucide-react';

export function AudioControls() {
  const { currentConversationId, addTranscription, setIsRecording } = useAppStore();
  const { isRecording, audioBlob, duration, startRecording, stopRecording } = useAudioRecorder();

  const handleStartRecording = useCallback(async () => {
    if (!currentConversationId) return;
    setIsRecording(true);
    await startRecording();
  }, [currentConversationId, setIsRecording, startRecording]);

  const handleStopRecording = useCallback(async () => {
    if (!currentConversationId || !audioBlob) return;
    setIsRecording(false);
    stopRecording();

    // TODO: 实现音频转写
    // const result = await transcribeAudio(audioBlob);
    // addTranscription(currentConversationId, result.text);
  }, [currentConversationId, audioBlob, setIsRecording, stopRecording]);

  return (
    <div className="flex items-center justify-center gap-4 border-t bg-background p-4">
      {isRecording ? (
        <button
          onClick={handleStopRecording}
          className="flex items-center justify-center gap-2 rounded-lg bg-destructive px-4 py-2 text-destructive-foreground hover:bg-destructive/90"
        >
          <Square className="h-4 w-4" />
          Stop Recording ({duration}s)
        </button>
      ) : (
        <button
          onClick={handleStartRecording}
          className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
        >
          <Mic className="h-4 w-4" />
          Start Recording
        </button>
      )}
    </div>
  );
} 