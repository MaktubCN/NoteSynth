import { ApiService } from './api';

export class RecordingService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private durationInterval: NodeJS.Timeout | null = null;
  private processingInterval: NodeJS.Timeout | null = null;
  private durationCallback: ((duration: number) => void) | null = null;
  private duration: number = 0;
  private stream: MediaStream | null = null;
  private api: ApiService | null = null;

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
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.stream);
      this.audioChunks = [];
      this.duration = 0;
      this.durationCallback = onDurationUpdate;

      this.api = new ApiService(settings.apiBaseUrl, settings.apiKey);

      this.mediaRecorder.addEventListener('dataavailable', (event) => {
        this.audioChunks.push(event.data);
      });

      // 开始录音
      this.mediaRecorder.start(settings.recordingInterval * 1000);
      
      // 更新录音时长
      this.durationInterval = setInterval(() => {
        this.duration++;
        if (this.durationCallback) {
          this.durationCallback(this.duration);
        }
      }, 1000);

      // 定期处理音频数据
      this.processingInterval = setInterval(async () => {
        if (this.audioChunks.length === 0) return;
        
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.audioChunks = []; // 清空缓存，准备接收新的音频数据
        
        try {
          if (this.api) {
            const text = await this.api.transcribe(audioBlob, {
              model: settings.transcriptionModel,
              language: settings.inputLanguage,
            });
            
            if (text && text.trim()) {
              onTranscription(text);
            }
          }
        } catch (error) {
          console.error('Failed to transcribe audio chunk:', error);
        }
      }, settings.recordingInterval * 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  stop() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
      
      // 处理最后一批音频数据
      if (this.audioChunks.length > 0 && this.api) {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.api.transcribe(audioBlob, {
          model: 'whisper-1',
          language: 'auto',
        }).then(text => {
          if (this.durationCallback) {
            this.durationCallback(0);
          }
        }).catch(error => {
          console.error('Failed to transcribe final audio chunk:', error);
        });
      }
    }
    
    // 清理资源
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    this.mediaRecorder = null;
    this.audioChunks = [];
    
    if (this.durationInterval) {
      clearInterval(this.durationInterval);
      this.durationInterval = null;
    }
    
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
  }
} 