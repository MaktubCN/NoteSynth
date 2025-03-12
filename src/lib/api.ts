export class ApiService {
  constructor(private baseUrl: string, private apiKey: string) {}

  async transcribe(
    blob: Blob,
    options: {
      model: string;
      language: string;
    }
  ) {
    const formData = new FormData();
    formData.append('file', blob, 'audio.webm');
    formData.append('model', options.model);
    formData.append('language', options.language);

    const response = await fetch(`${this.baseUrl}/v1/audio/transcriptions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Transcription failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.text;
  }

  async summarize(
    text: string,
    options: {
      model: string;
      language: string;
    }
  ) {
    const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: options.model,
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant that summarizes transcribed speech. The summary should be concise and in ${options.language} language. Focus on the key points and main ideas.`,
          },
          {
            role: 'user',
            content: `Please summarize the following transcription:\n\n${text}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Summary failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }
} 