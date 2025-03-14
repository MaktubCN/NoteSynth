'use client';

import { useAppStore } from '@/lib/store';
import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';

export function TranscriptionPanel() {
  const t = useTranslations();
  const { conversations, currentConversationId, settings } = useAppStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentConversation = conversations.find(
    (conv) => conv.id === currentConversationId
  );

  // 确保 entries 存在
  const entries = currentConversation?.entries || [];
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  return (
    <div className="flex h-full flex-col p-4 pl-6">
      <h2 className="mb-4 text-lg font-semibold">{t('panels.transcription')}</h2>
      <div
        ref={scrollRef}
        className="flex-1 overflow-auto rounded-lg bg-background p-4"
      >
        <table className="w-full border-collapse">
          <tbody>
            {entries.length > 0 ? (
              entries.map((entry, index) => (
                <tr key={index} className="border-b border-muted-foreground/20 last:border-0">
                  {settings.showTimestamp && (
                    <td className="py-2 pr-4 text-sm text-muted-foreground whitespace-nowrap align-top">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </td>
                  )}
                  <td className="py-2 whitespace-pre-wrap">{entry.content}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="py-2 text-center text-muted-foreground">
                  No content yet. Start recording...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}