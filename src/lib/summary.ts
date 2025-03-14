export class SummaryService {
  private intervalId: NodeJS.Timeout | null = null;

  start(
    settings: {
      apiBaseUrl: string;
      apiKey: string;
      summaryLanguage: string;
      summaryModel: string;
      summaryInterval: number;
    },
    getTranscription: () => string,
    onSummaryUpdate: (summary: string) => void
  ) {
    this.stop();

    this.intervalId = setInterval(async () => {
      const transcription = getTranscription();
      if (!transcription) return;

      try {
        const response = await fetch(`${settings.apiBaseUrl}/v1/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${settings.apiKey}`,
          },
          body: JSON.stringify({
            model: settings.summaryModel,
            messages: [
              {
                role: 'system',
                content: `你是一个专业的笔记整理助手，请将以下转写内容整理成Markdown格式的笔记，使用多级标题结构，突出重点内容，保持层次分明。请使用${settings.summaryLanguage}语言。`,
              },
              {
                role: 'user',
                content: `请将以下转写内容整理成详尽的笔记格式：

${transcription}`,
              },
            ],
          }),
        });

        if (!response.ok) {
          throw new Error(`Summary failed: ${response.statusText}`);
        }

        const data = await response.json();
        onSummaryUpdate(data.choices[0].message.content);
      } catch (error) {
        console.error('Failed to generate summary:', error);
      }
    }, settings.summaryInterval * 60 * 1000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}