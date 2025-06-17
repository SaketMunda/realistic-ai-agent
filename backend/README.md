# Backend Service

This is the backend service for the AI-powered photorealistic avatar agent.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file in the backend directory with the following variables:
```
OPENAI_API_KEY=your_openai_api_key
HUGGINGFACE_API_KEY=your_huggingface_api_key
HOST=0.0.0.0  # Optional, defaults to 0.0.0.0
PORT=8000     # Optional, defaults to 8000
```

## Running the Service

1. Make sure your virtual environment is activated:
```bash
source venv/bin/activate  # On Windows use: venv\Scripts\activate
```

2. Start the server:
```bash
python run.py
```

The server will start on http://localhost:8000 by default.

## API Documentation

Once the server is running, you can access:
- API documentation at http://localhost:8000/docs
- Alternative documentation at http://localhost:8000/redoc

## WebSocket Endpoints

- `/ws/chat` - Main WebSocket endpoint for real-time chat communication
- `/health` - Health check endpoint (GET) 