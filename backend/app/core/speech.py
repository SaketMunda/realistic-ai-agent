import whisper
from transformers import pipeline
import numpy as np
import torch
from typing import Dict, Any
import io
import base64

class SpeechHandler:
    def __init__(self):
        # Initialize Whisper model for STT
        self.whisper_model = whisper.load_model("base")
        
        # Initialize Nari TTS
        self.tts = pipeline(
            "text-to-speech",
            model="facebook/mms-tts-eng",  # Using a basic English TTS model for POC
            device="cuda" if torch.cuda.is_available() else "cpu"
        )

    async def speech_to_text(self, audio_data: bytes) -> Dict[str, Any]:
        """Convert speech to text using Whisper"""
        try:
            # Convert audio bytes to numpy array
            # Note: This assumes the audio is in the correct format
            # In production, you'd want to handle different formats
            audio_np = np.frombuffer(audio_data, np.float32)
            
            # Transcribe audio
            result = self.whisper_model.transcribe(audio_np)
            
            return {
                "type": "transcription",
                "content": result["text"],
                "status": "success"
            }
        except Exception as e:
            print(f"Error in STT processing: {str(e)}")
            return {
                "type": "transcription",
                "content": "",
                "status": "error"
            }

    async def text_to_speech(self, text: str) -> Dict[str, Any]:
        """Convert text to speech using Nari TTS"""
        try:
            # Generate speech
            speech = self.tts(text)
            
            # Convert numpy array to bytes
            audio_bytes = io.BytesIO()
            np.save(audio_bytes, speech['audio'])
            audio_data = audio_bytes.getvalue()
            
            # Convert to base64 for sending over WebSocket
            audio_b64 = base64.b64encode(audio_data).decode('utf-8')
            
            return {
                "type": "audio",
                "content": audio_b64,
                "status": "success"
            }
        except Exception as e:
            print(f"Error in TTS processing: {str(e)}")
            return {
                "type": "audio",
                "content": "",
                "status": "error"
            }

# Create a singleton instance
speech_handler = SpeechHandler() 