'use client';

import { useState, useRef, useEffect } from 'react';
import { Pencil } from 'lucide-react';
import { useAppStore } from '@/lib/store';

interface ConversationTitleProps {
  id: string;
  name: string;
}

export function ConversationTitle({ id, name }: ConversationTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);
  const { updateConversation } = useAppStore();

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      updateConversation(id, { name: title.trim() });
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <form onSubmit={handleSubmit} className="flex-1">
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleSubmit}
          className="w-full rounded-md border bg-transparent px-2 py-1 text-sm"
        />
      </form>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => setIsEditing(true)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          setIsEditing(true);
        }
      }}
      className="group flex w-full cursor-pointer items-center gap-2 text-sm outline-none"
    >
      <span className="flex-1 truncate text-left">{name}</span>
      {/* <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-100" /> */}
    </div>
  );
} 