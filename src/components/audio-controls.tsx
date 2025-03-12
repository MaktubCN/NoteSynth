'use client';

import * as React from 'react';
import { Mic, Square } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAppStore } from '@/lib/store';
import { formatDuration } from '@/lib/utils';
import { useRecording } from '@/hooks/use-recording';

export function AudioControls() {
  const t = useTranslations();
  const { isRecording, recordingDuration, settings } = useAppStore();
  const { startRecording, stopRecording } = useRecording();

  const handleStartRecording = async () => {
    if (!settings.apiKey) {
      alert('Please configure your API Key in settings first.');
      return;
    }
    await startRecording();
  };

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={isRecording ? stopRecording : handleStartRecording}
        className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm text-primary-foreground hover:bg-primary/90"
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
      {isRecording && (
        <div className="text-sm text-muted-foreground">
          {t('recording.duration', { duration: formatDuration(recordingDuration) })}
        </div>
      )}
    </div>
  );
} 