'use client';

import { useAppStore } from '@/lib/store';
import { Markdown } from '@/components/ui/markdown';

export function SummaryPanel() {
  const { conversations, currentConversationId } = useAppStore();

  const currentConversation = conversations.find(
    (conv) => conv.id === currentConversationId
  );

  return (
    <div className="flex h-full flex-col p-4">
      <h2 className="mb-4 text-lg font-semibold">Summary</h2>
      <div className="flex-1 overflow-auto rounded-lg bg-muted/30 p-4">
        {currentConversation?.summary ? (
          <Markdown>{currentConversation.summary}</Markdown>
        ) : (
          'No summary yet. Start recording to generate a summary...'
        )}
      </div>
    </div>
  );
} 