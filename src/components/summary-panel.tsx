'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Markdown } from '@/components/ui/markdown';
import { RefreshCw, FileDown, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { formatDuration } from '@/lib/utils';

export function SummaryPanel() {
  const t = useTranslations();
  const { 
    conversations, 
    currentConversationId, 
    generateManualSummary, 
    exportSummary, 
    settings, 
    isRecording,
    previousSummaryVersion,
    nextSummaryVersion,
    deleteSummaryVersion
  } = useAppStore();
  const [remainingTime, setRemainingTime] = useState(settings.summaryInterval * 60);

  const currentConversation = conversations.find(
    (conv) => conv.id === currentConversationId
  );

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isRecording) {
      setRemainingTime(settings.summaryInterval * 60);
      timer = setInterval(() => {
        setRemainingTime((prevTime) => {
          if (prevTime <= 1) {
            // 重置计时器
            return settings.summaryInterval * 60;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [isRecording, settings.summaryInterval]);

  // 获取当前版本信息
  const hasSummaries = currentConversation?.summaries?.length > 0;
  const currentVersionIndex = currentConversation?.currentSummaryIndex || -1;
  const totalVersions = currentConversation?.summaries?.length || 0;
  const currentSummaryId = hasSummaries && currentVersionIndex >= 0 
    ? currentConversation?.summaries[currentVersionIndex]?.id 
    : null;

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold">{t('panels.summary')}</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={generateManualSummary}
            className="inline-flex h-8 items-center gap-2 rounded-lg border px-3 text-sm hover:bg-accent"
          >
            <RefreshCw className="h-4 w-4" />
            {t('summary.generate')}
          </button>
          {currentConversationId && (
            <button
              onClick={() => exportSummary(currentConversationId)}
              className="inline-flex h-8 items-center gap-2 rounded-lg border px-3 text-sm hover:bg-accent"
            >
              <FileDown className="h-4 w-4" />
              {t('summary.export')}
            </button>
          )}
        </div>
      </div>
      
      {/* 版本导航控件 */}
      {hasSummaries && (
        <div className="mb-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button
              onClick={() => currentConversationId && previousSummaryVersion(currentConversationId)}
              disabled={totalVersions <= 1}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border hover:bg-accent disabled:opacity-50"
              title={t('summary.previousVersion')}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-muted-foreground">
              {t('summary.versionInfo', { current: currentVersionIndex + 1, total: totalVersions })}
            </span>
            <button
              onClick={() => currentConversationId && nextSummaryVersion(currentConversationId)}
              disabled={totalVersions <= 1}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border hover:bg-accent disabled:opacity-50"
              title={t('summary.nextVersion')}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          
          {currentSummaryId && (
            <button
              onClick={() => currentConversationId && currentSummaryId && 
                deleteSummaryVersion(currentConversationId, currentSummaryId)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border hover:bg-accent hover:text-destructive"
              title={t('summary.deleteVersion')}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
      
      {isRecording && (
        <div className="mb-4">
          <span className="text-sm text-muted-foreground">
            {t('summary.nextSummary')}: {formatDuration(remainingTime)}s
          </span>
        </div>
      )}
      <div className="flex-1 overflow-y-auto rounded-lg bg-background p-4">
        {currentConversation?.summary ? (
          <Markdown>{currentConversation.summary}</Markdown>
        ) : (
          t('summary.noContent')
        )}
      </div>
    </div>
  );
}