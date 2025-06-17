from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import json
import base64
from typing import Dict, Any

from app.core.chat import chat_handler
from app.core.speech import speech_handler

app = FastAPI(title="AI Agent Backend")

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store active WebSocket connections
active_connections: Dict[str, WebSocket] = {}

@app.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    client_id = id(websocket)
    active_connections[client_id] = websocket
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message["type"] == "message":
                # Process text message with LangChain
                response = await chat_handler.process_message(message["content"])
                await websocket.send_json(response)
                
                # Generate and send audio response
                audio_response = await speech_handler.text_to_speech(response["content"])
                await websocket.send_json(audio_response)
                
            elif message["type"] == "audio":
                # Decode base64 audio data
                audio_bytes = base64.b64decode(message["content"])
                
                # Convert speech to text
                stt_response = await speech_handler.speech_to_text(audio_bytes)
                
                if stt_response["status"] == "success":
                    # Process transcribed text with chat
                    chat_response = await chat_handler.process_message(stt_response["content"])
                    await websocket.send_json(chat_response)
                    
                    # Generate audio response
                    audio_response = await speech_handler.text_to_speech(chat_response["content"])
                    await websocket.send_json(audio_response)
                else:
                    await websocket.send_json({
                        "type": "error",
                        "content": "Failed to process audio input"
                    })
    
    except Exception as e:
        print(f"Error: {e}")
    finally:
        # Clean up connection
        if client_id in active_connections:
            del active_connections[client_id]

@app.get("/health")
async def health_check():
    """Simple health check endpoint"""
    return {"status": "ok"} 