'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Search, Trash2 } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { ConversationTitle } from './conversation-title';

export function ConversationList() {
  const t = useTranslations();
  const [search, setSearch] = useState('');
  const { conversations, currentConversationId, setCurrentConversation, deleteConversation } =
    useAppStore();

  const filteredConversations = conversations
    .filter(
      (conv) =>
        conv.name.toLowerCase().includes(search.toLowerCase()) ||
        conv.content.toLowerCase().includes(search.toLowerCase()) ||
        conv.summary.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  if (conversations.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-muted-foreground">{t('app.noContent')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border bg-transparent pl-9 pr-4 py-2 text-sm"
            placeholder={t('search.placeholder')}
          />
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <div className="space-y-2 p-4">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`group relative rounded-lg border p-4 hover:bg-accent ${
                conversation.id === currentConversationId ? 'bg-accent' : ''
              }`}
            >
              <div
                role="button"
                tabIndex={0}
                onClick={() => setCurrentConversation(conversation.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setCurrentConversation(conversation.id);
                  }
                }}
                className="w-full cursor-pointer text-left outline-none"
              >
                <div className="mb-2">
                  <ConversationTitle id={conversation.id} name={conversation.name} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="truncate text-sm text-muted-foreground">
                    {conversation.content || t('app.noContent')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(conversation.updatedAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => deleteConversation(conversation.id)}
                className="absolute right-2 top-2 hidden rounded-lg p-2 hover:bg-background group-hover:block"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 