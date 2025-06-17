// Simple audio recorder using Web Audio API
export class AudioRecorder {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
  }

  async startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };

      this.mediaRecorder.start();
      return true;
    } catch (error) {
      console.error('Error starting recording:', error);
      return false;
    }
  }

  async stopRecording() {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        this.audioChunks = [];
        
        // Stop all tracks
        this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
        this.mediaRecorder = null;
        
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }
}

// Simple audio player
export class AudioPlayer {
  constructor() {
    this.audio = new Audio();
  }

  play(audioBlob) {
    const url = URL.createObjectURL(audioBlob);
    this.audio.src = url;
    
    this.audio.onended = () => {
      URL.revokeObjectURL(url);
    };

    return this.audio.play();
  }

  stop() {
    this.audio.pause();
    this.audio.currentTime = 0;
  }
} 