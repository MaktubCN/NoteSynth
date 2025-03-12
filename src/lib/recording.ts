import { ApiService } from './api';

export class RecordingService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private durationInterval: NodeJS.Timeout | null = null;
  private recordingInterval: NodeJS.Timeout | null = null;
  private durationCallback: ((duration: number) => void) | null = null;
  private duration: number = 0;
  private stream: MediaStream | null = null;
  private api: ApiService | null = null;
  private settings: any = null;
  private onTranscription: ((text: string) => void) | null = null;

  async start(
    settings: {
      apiBaseUrl: string;
      apiKey: string;
      inputLanguage: string;
      transcriptionModel: string;
      recordingInterval: number;
    },
    onTranscription: (text: string) => void,
    onDurationUpdate: (duration: number) => void
  ) {
    this.settings = settings;
    this.onTranscription = onTranscription;
    this.durationCallback = onDurationUpdate;
    this.api = new ApiService(settings.apiBaseUrl, settings.apiKey);
    
    await this.startNewRecording();

    // 更新录音时长
    this.durationInterval = setInterval(() => {
      this.duration++;
      if (this.durationCallback) {
        this.durationCallback(this.duration);
      }
    }, 1000);

    // 定期开启新录音
    this.recordingInterval = setInterval(() => {
      this.stopCurrentRecording();
      this.startNewRecording();
    }, settings.recordingInterval * 1000);
  }

  private async startNewRecording() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.stream);
      this.audioChunks = [];

      this.mediaRecorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      });

      this.mediaRecorder.addEventListener('stop', async () => {
        if (this.audioChunks.length > 0 && this.api && this.settings) {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
          try {
            const text = await this.api.transcribe(audioBlob, {
              model: this.settings.transcriptionModel,
              language: this.settings.inputLanguage,
            });
            
            if (text && text.trim() && this.onTranscription) {
              this.onTranscription(text);
            }
          } catch (error) {
            console.error('Failed to transcribe audio:', error);
          }
        }
        
        // 清理当前录音资源
        if (this.stream) {
          this.stream.getTracks().forEach(track => track.stop());
        }
      });

      this.mediaRecorder.start();
    } catch (error) {
      console.error('Error starting new recording:', error);
      throw error;
    }
  }

  private stopCurrentRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
  }

  stop() {
    this.stopCurrentRecording();
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    if (this.durationInterval) {
      clearInterval(this.durationInterval);
      this.durationInterval = null;
    }
    
    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
      this.recordingInterval = null;
    }
    
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.duration = 0;
    if (this.durationCallback) {
      this.durationCallback(0);
    }
  }
}