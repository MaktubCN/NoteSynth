'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Settings as SettingsIcon, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAppStore } from '@/lib/store';

export function SettingsDialog() {
  const t = useTranslations();
  const { settings, updateSettings } = useAppStore();
  const [open, setOpen] = React.useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateSettings({
      apiBaseUrl: formData.get('apiBaseUrl') as string,
      apiKey: formData.get('apiKey') as string,
      inputLanguage: formData.get('inputLanguage') as string,
      transcriptionModel: formData.get('transcriptionModel') as string,
      summaryLanguage: formData.get('summaryLanguage') as string,
      summaryModel: formData.get('summaryModel') as string,
      recordingInterval: Number(formData.get('recordingInterval')),
      summaryInterval: Number(formData.get('summaryInterval')),
      interfaceLanguage: formData.get('interfaceLanguage') as string,
      showTimestamp: formData.get('showTimestamp') === 'on',
    });
    setOpen(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-accent">
          <SettingsIcon className="h-5 w-5" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-background p-6 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
          <Dialog.Title className="mb-4 text-xl font-semibold">
            {t('settings.title')}
          </Dialog.Title>
          <form onSubmit={handleSubmit} className="space-y-4">
            <fieldset>
              <label htmlFor="apiBaseUrl" className="mb-2 block text-sm font-medium">
                {t('settings.apiBaseUrl')}
              </label>
              <input
                type="url"
                id="apiBaseUrl"
                name="apiBaseUrl"
                defaultValue={settings.apiBaseUrl}
                required
                className="w-full rounded-md border bg-transparent px-3 py-2 text-sm"
                placeholder="https://api.openai.com/v1"
              />
            </fieldset>
            <fieldset>
              <label htmlFor="apiKey" className="mb-2 block text-sm font-medium">
                {t('settings.apiKey')}
              </label>
              <input
                type="password"
                id="apiKey"
                name="apiKey"
                defaultValue={settings.apiKey}
                required
                className="w-full rounded-md border bg-transparent px-3 py-2 text-sm"
                placeholder="sk-..."
              />
            </fieldset>
            <div className="grid grid-cols-2 gap-4">
              <fieldset>
                <label htmlFor="inputLanguage" className="mb-2 block text-sm font-medium">
                  {t('settings.inputLanguage')}
                </label>
                <select
                  id="inputLanguage"
                  name="inputLanguage"
                  defaultValue={settings.inputLanguage}
                  className="w-full rounded-md border bg-transparent px-3 py-2 text-sm"
                >
                  <option value="auto">{t('languages.auto')}</option>
                  <option value="en">{t('languages.en')}</option>
                  <option value="zh">{t('languages.zh')}</option>
                </select>
              </fieldset>
              <fieldset>
                <label htmlFor="transcriptionModel" className="mb-2 block text-sm font-medium">
                  {t('settings.transcriptionModel')}
                </label>
                <select
                  id="transcriptionModel"
                  name="transcriptionModel"
                  defaultValue={settings.transcriptionModel}
                  className="w-full rounded-md border bg-transparent px-3 py-2 text-sm"
                >
                  <option value="whisper-1">whisper-1</option>
                </select>
              </fieldset>
              <fieldset>
                <label htmlFor="summaryLanguage" className="mb-2 block text-sm font-medium">
                  {t('settings.summaryLanguage')}
                </label>
                <select
                  id="summaryLanguage"
                  name="summaryLanguage"
                  defaultValue={settings.summaryLanguage}
                  className="w-full rounded-md border bg-transparent px-3 py-2 text-sm"
                >
                  <option value="en">{t('languages.en')}</option>
                  <option value="zh">{t('languages.zh')}</option>
                </select>
              </fieldset>
              <fieldset>
                <label htmlFor="summaryModel" className="mb-2 block text-sm font-medium">
                  {t('settings.summaryModel')}
                </label>
                <select
                  id="summaryModel"
                  name="summaryModel"
                  defaultValue={settings.summaryModel}
                  className="w-full rounded-md border bg-transparent px-3 py-2 text-sm"
                >
                  <option value="gpt-4">gpt-4o</option>
                  <option value="gpt-3.5-turbo">gpt-4o-mini</option>
                </select>
              </fieldset>
              <fieldset>
                <label htmlFor="recordingInterval" className="mb-2 block text-sm font-medium">
                  {t('settings.recordingInterval')}
                </label>
                <input
                  type="number"
                  id="recordingInterval"
                  name="recordingInterval"
                  defaultValue={settings.recordingInterval}
                  min={5}
                  max={300}
                  required
                  className="w-full rounded-md border bg-transparent px-3 py-2 text-sm"
                />
              </fieldset>
              <fieldset>
                <label htmlFor="summaryInterval" className="mb-2 block text-sm font-medium">
                  {t('settings.summaryInterval')}
                </label>
                <input
                  type="number"
                  id="summaryInterval"
                  name="summaryInterval"
                  defaultValue={settings.summaryInterval}
                  min={1}
                  max={60}
                  required
                  className="w-full rounded-md border bg-transparent px-3 py-2 text-sm"
                />
              </fieldset>
            </div>
            <fieldset>
              <label htmlFor="interfaceLanguage" className="mb-2 block text-sm font-medium">
                {t('settings.interfaceLanguage')}
              </label>
              <select
                id="interfaceLanguage"
                name="interfaceLanguage"
                defaultValue={settings.interfaceLanguage}
                className="w-full rounded-md border bg-transparent px-3 py-2 text-sm"
              >
                <option value="en">{t('languages.en')}</option>
                <option value="zh">{t('languages.zh')}</option>
              </select>
            </fieldset>
            <fieldset className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showTimestamp"
                name="showTimestamp"
                defaultChecked={settings.showTimestamp}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="showTimestamp" className="text-sm font-medium">
                {t('settings.showTimestamp')}
              </label>
            </fieldset>
            <div className="mt-6 flex justify-end gap-4">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="rounded-lg border px-4 py-2 text-sm hover:bg-accent"
                >
                  {t('settings.cancel')}
                </button>
              </Dialog.Close>
              <button
                type="submit"
                className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
              >
                {t('settings.save')}
              </button>
            </div>
          </form>
          <Dialog.Close asChild>
            <button
              className="absolute right-4 top-4 inline-flex h-6 w-6 items-center justify-center rounded-lg hover:bg-accent"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}