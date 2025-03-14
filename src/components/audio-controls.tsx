'use client';

import { useEffect, useState } from 'react';
import { Mic, Square } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useTranslations } from 'next-intl';
import { useRecording } from '@/hooks/use-recording'; // 添加这一行

export function AudioControls() {
  const t = useTranslations();
  const { isRecording } = useAppStore();
  const { startRecording, stopRecording } = useRecording(); // 使用 useRecording hook
  
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="flex items-center gap-2 mr-4">
      <button
        onClick={toggleRecording}
        className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
      >
        {isRecording ? (
          <>
            <Square className="h-4 w-4" />
            {t('recording.stop')}
          </>
        ) : (
          <>
            <Mic className="h-4 w-4" />
            {t('recording.start')}
          </>
        )}
      </button>
    </div>
  );
}