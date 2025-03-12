'use client';

import { useAppStore } from '@/lib/store';
import { useEffect, useRef } from 'react';

export function TranscriptionPanel() {
  const { conversations, currentConversationId } = useAppStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentConversation = conversations.find(
    (conv) => conv.id === currentConversationId
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentConversation?.content]);

  return (
    <div className="flex h-full flex-col p-4">
      <h2 className="mb-4 text-lg font-semibold">Transcription</h2>
      <div
        ref={scrollRef}
        className="flex-1 overflow-auto whitespace-pre-wrap rounded-lg bg-muted/30 p-4"
      >
        {currentConversation?.content || 'No content yet. Start recording...'}
      </div>
    </div>
  );
} 