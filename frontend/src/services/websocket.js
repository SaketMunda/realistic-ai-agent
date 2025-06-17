class WebSocketService {
  constructor() {
    this.socket = null;
    this.messageHandler = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectTimeout = null;
  }

  connect() {
    try {
      // Using default WebSocket for now, will update URL when backend is ready
      this.socket = new WebSocket('ws://localhost:8000/ws/chat');

      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
      };

      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (this.messageHandler) {
          this.messageHandler(data);
        }
      };

      this.socket.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnected = false;
        this.attemptReconnect();
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnected = false;
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.attemptReconnect();
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      // Clear any existing timeout
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
      }

      // Exponential backoff: 1s, 2s, 4s, 8s, 16s
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 16000);
      
      this.reconnectTimeout = setTimeout(() => {
        this.connect();
      }, delay);
    }
  }

  setMessageHandler(handler) {
    this.messageHandler = handler;
  }

  sendMessage(message) {
    if (this.socket && this.isConnected) {
      this.socket.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    this.isConnected = false;
    this.reconnectAttempts = 0;
  }
}

// Create a singleton instance
const websocketService = new WebSocketService();
export default websocketService; 