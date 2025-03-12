import { ApiService } from './api';

export class RecordingService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private intervalId: NodeJS.Timeout | null = null;
  private durationCallback: ((duration: number) => void) | null = null;
  private duration: number = 0;

  async start(
    settings: {
      apiBaseUrl: string;
      apiKey: string;
      inputLanguage: string;
      transcriptionModel: string;
    },
    onTranscription: (text: string) => void,
    onDurationUpdate: (duration: number) => void
  ) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];
      this.duration = 0;
      this.durationCallback = onDurationUpdate;

      const api = new ApiService(settings.apiBaseUrl, settings.apiKey);

      this.mediaRecorder.addEventListener('dataavailable', (event) => {
        this.audioChunks.push(event.data);
      });

      this.mediaRecorder.addEventListener('stop', async () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        try {
          const text = await api.transcribe(audioBlob, {
            model: settings.transcriptionModel,
            language: settings.inputLanguage,
          });
          onTranscription(text);
        } catch (error) {
          console.error('Failed to transcribe audio:', error);
        }
        this.audioChunks = [];
        if (this.intervalId) {
          clearInterval(this.intervalId);
          this.intervalId = null;
        }
      });

      this.mediaRecorder.start();
      this.intervalId = setInterval(() => {
        this.duration++;
        if (this.durationCallback) {
          this.durationCallback(this.duration);
        }
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  stop() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
      this.mediaRecorder = null;
    }
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
} 