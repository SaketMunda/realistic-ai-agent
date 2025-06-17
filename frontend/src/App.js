import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import { AudioRecorder, AudioPlayer } from './services/audioUtils';
import websocketService from './services/websocket';

function App() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const chatContainerRef = useRef(null);
  const audioRecorder = useRef(new AudioRecorder());
  const audioPlayer = useRef(new AudioPlayer());

  // Initialize WebSocket connection
  useEffect(() => {
    // Set up message handler
    websocketService.setMessageHandler((data) => {
      if (data.type === 'message') {
        setMessages(prev => [...prev, { 
          text: data.content, 
          sender: 'assistant' 
        }]);
      } else if (data.type === 'audio') {
        // Handle audio response when backend is ready
        console.log('Received audio response');
      }
    });

    // Connect to WebSocket
    websocketService.connect();

    // Cleanup on unmount
    return () => {
      websocketService.disconnect();
    };
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { text: inputText, sender: 'user' }]);
    
    // Send message through WebSocket
    websocketService.sendMessage({
      type: 'message',
      content: inputText
    });

    setInputText('');
  };

  const toggleRecording = async () => {
    if (!isRecording) {
      // Start recording
      const started = await audioRecorder.current.startRecording();
      if (started) {
        setIsRecording(true);
      }
    } else {
      // Stop recording and process audio
      setIsRecording(false);
      setIsProcessing(true);
      
      const audioBlob = await audioRecorder.current.stopRecording();
      if (audioBlob) {
        // Add a message to show recording is done
        setMessages(prev => [...prev, { 
          text: "🎤 Voice message recorded", 
          sender: 'user' 
        }]);

        // Send audio through WebSocket
        // Note: For large audio files, you might want to use chunks
        websocketService.sendMessage({
          type: 'audio',
          content: await audioBlob.arrayBuffer()
        });

        // For development, still play back locally
        setTimeout(async () => {
          try {
            await audioPlayer.current.play(audioBlob);
          } catch (error) {
            console.error('Error playing audio:', error);
          }
          setIsProcessing(false);
        }, 1000);
      } else {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="app-container">
      <div className="avatar-container">
        {/* Placeholder for avatar - will be replaced with actual visualization */}
        <div style={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'linear-gradient(45deg, rgba(88,101,242,0.5), rgba(148,0,255,0.5))',
          boxShadow: '0 0 30px rgba(88,101,242,0.3)',
          animation: isProcessing ? 'pulse 1.5s infinite' : 'none'
        }} />
      </div>

      <div className="chat-container" ref={chatContainerRef}>
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`message-bubble ${message.sender}`}
          >
            {message.text}
          </div>
        ))}
      </div>

      <form className="input-container" onSubmit={handleSendMessage}>
        <input
          type="text"
          className="input-field"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message..."
          disabled={isRecording || isProcessing}
        />
        <button
          type="button"
          className={`voice-button ${isRecording ? 'recording' : ''} ${isProcessing ? 'processing' : ''}`}
          onClick={toggleRecording}
          disabled={isProcessing}
        >
          {isRecording ? '⬤' : isProcessing ? '⋯' : '⚫'}
        </button>
      </form>
    </div>
  );
}

export default App;
