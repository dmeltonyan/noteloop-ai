# How to Start the Backend Server

## Quick Start

1. **Install Dependencies**
```bash
cd backend
pip install -r requirements.txt
```

2. **Set Environment Variables (Optional)**
```bash
# For LLM features (free)
export GROQ_API_KEY="your-groq-api-key"

# For AI chat features
export OPENAI_API_KEY="your-openai-api-key"
```

3. **Start the Server**
```bash
# Option 1: Using the start script
python start_server.py

# Option 2: Using uvicorn directly
uvicorn src.server:app --reload --port 8000

# Option 3: Using Python module
python -m uvicorn src.server:app --reload --port 8000
```

4. **Verify Server is Running**
- Open http://localhost:8000 in your browser
- You should see: `{"message": "NoteLoop AI API", "version": "1.0.0", "status": "running"}`
- API docs: http://localhost:8000/docs

## Troubleshooting

**Error: "Module not found"**
- Make sure you're in the `backend` directory
- Install dependencies: `pip install -r requirements.txt`

**Error: "Port already in use"**
- Change the port: `python start_server.py` (edit PORT in start_server.py)
- Or kill the process using port 8000

**Error: "Connection refused"**
- Make sure the backend server is running
- Check that port 8000 is not blocked by firewall
- Verify the server started successfully (check terminal output)

## Development Mode

The server runs in reload mode by default, so code changes will automatically restart the server.

## Production Mode

For production, remove `reload=True` and use a production ASGI server like Gunicorn with Uvicorn workers.


