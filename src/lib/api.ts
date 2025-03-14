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

  async summarizeStream(
    text: string,
    options: {
      model: string;
      language: string;
    },
    onChunk: (chunk: string) => void
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
            content: `你是一个专业的笔记整理助手，请将以下转写内容整理成Markdown格式的笔记，使用多级标题结构，突出重点内容，保持层次分明。请使用${options.language}语言。`,
          },
          {
            role: 'user',
            content: `请将以下转写内容整理成详尽的笔记格式：\n\n${text}`,
          },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Summary failed: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.substring(6));
              if (data.choices && data.choices[0].delta && data.choices[0].delta.content) {
                const content = data.choices[0].delta.content;
                buffer += content;
                onChunk(content);
              }
            } catch (e) {
              console.error('Error parsing stream data:', e);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
    
    return buffer;
  }
}