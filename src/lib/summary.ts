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
                content: `You are a helpful assistant that summarizes transcribed speech. The summary should be concise and in ${settings.summaryLanguage} language. Focus on the key points and main ideas.`,
              },
              {
                role: 'user',
                content: `Please summarize the following transcription:\n\n${transcription}`,
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