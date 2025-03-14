'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { AudioControls } from '@/components/audio-controls';
import { SettingsDialog } from '@/components/settings/settings-dialog';
import { ConversationList } from '@/components/conversation-list';
import { LanguageSwitcher } from '@/components/language-switcher';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { TranscriptionPanel } from '@/components/transcription-panel';
import { SummaryPanel } from '@/components/summary-panel';
import { useAppStore } from '@/lib/store';
import { useSummary } from '@/hooks/use-summary';
import { cn } from '@/lib/utils';

export default function Home() {
  const t = useTranslations();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { createConversation, currentConversationId, conversations } = useAppStore();
  const currentConversation = conversations.find((conv) => conv.id === currentConversationId);

  useSummary();

  return (
    <main className="flex min-h-screen">
      <div
        className={cn(
          'relative border-r transition-all duration-300 ease-in-out',
          isSidebarCollapsed ? 'w-16' : 'w-80'
        )}
      >
        <div className="flex h-14 items-center justify-between border-b px-4">
          <h1 className={cn('text-lg font-semibold transition-opacity', 
            isSidebarCollapsed ? 'opacity-0' : 'opacity-100'
          )}>
            {t('app.title')}
          </h1>
          <div className={cn('flex items-center gap-2',
            isSidebarCollapsed ? 'opacity-0' : 'opacity-100'
          )}>
            <LanguageSwitcher />
            <ThemeSwitcher />
            <SettingsDialog />
          </div>
        </div>
        <div className={cn('transition-opacity', 
          isSidebarCollapsed ? 'opacity-0' : 'opacity-100'
        )}>
          <ConversationList />
        </div>
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border bg-background shadow-sm hover:bg-accent"
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      <div className="flex flex-1 flex-col">
        <div className="container flex flex-1 flex-col gap-4 py-4">
          <div className="flex justify-between">
            <button
              onClick={createConversation}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border ml-4 hover:bg-accent"
            >
              <Plus className="h-5 w-5" />
            </button>
            <AudioControls />
          </div>
          <div className="grid flex-1 grid-cols-2 gap-4">
            <div className="flex flex-col gap-4 rounded-lg border p-4">
              <TranscriptionPanel />
            </div>
            <div className="flex flex-col gap-4 rounded-lg border p-4">
              <SummaryPanel />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}