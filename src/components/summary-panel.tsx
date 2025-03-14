'use client';

import { useAppStore } from '@/lib/store';
import { Markdown } from '@/components/ui/markdown';
import { RefreshCw, FileDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { formatDuration } from '@/lib/utils';

export function SummaryPanel() {
  const t = useTranslations();
  const { conversations, currentConversationId, generateManualSummary, exportSummary, settings, isRecording } = useAppStore();

  const currentConversation = conversations.find(
    (conv) => conv.id === currentConversationId
  );

  const nextSummaryTime = settings.summaryInterval * 60; // 转换为秒

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
      {isRecording && (
        <div className="mb-4">
          <span className="text-sm text-muted-foreground">
            下次自动总结: {formatDuration(nextSummaryTime)}s
          </span>
        </div>
      )}
      <div className="flex-1 overflow-auto rounded-lg bg-background p-4">
        {currentConversation?.summary ? (
          <Markdown>{currentConversation.summary}</Markdown>
        ) : (
          t('summary.noContent')
        )}
      </div>
    </div>
  );
}