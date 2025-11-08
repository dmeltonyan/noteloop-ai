# 🚀 Quick Start Guide - Backend Server

## The Problem
You're seeing `ERR_CONNECTION_REFUSED` because the backend server isn't running.

## Solution: Start the Backend Server

### Step 1: Open a Terminal/Command Prompt

### Step 2: Navigate to Backend Directory
```bash
cd backend
```

### Step 3: Install Dependencies (if not already done)
```bash
pip install -r requirements.txt
```

### Step 4: Start the Server

**Option A: Using the run script (Recommended)**
```bash
python run.py
```

**Option B: Using uvicorn directly**
```bash
uvicorn src.server:app --reload --port 8000
```

**Option C: Using the new start script**
```bash
python start_server.py
```

### Step 5: Verify Server is Running

You should see output like:
```
🚀 Starting NoteLoop AI Backend
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### Step 6: Test the Server

Open your browser and go to:
- http://localhost:8000 - Should show API status
- http://localhost:8000/docs - API documentation
- http://localhost:8000/api/users/demo_user_123/progress - Test endpoint

## Troubleshooting

### Error: "Module not found: uvicorn"
```bash
pip install uvicorn fastapi
```

### Error: "Module not found: groq"
```bash
pip install groq
```
(This is optional - server will work without it, but LLM features won't)

### Error: "Port 8000 already in use"
- Kill the process using port 8000, or
- Change the port in `run.py` or `start_server.py`

### Error: "No module named 'src'"
- Make sure you're in the `backend` directory
- Run: `cd backend` then `python run.py`

## Keep Server Running

**IMPORTANT**: Keep the terminal window open while developing. The server must stay running for the frontend to work.

To stop the server: Press `Ctrl+C` in the terminal

## Development Workflow

1. **Terminal 1**: Start backend server
   ```bash
   cd backend
   python run.py
   ```

2. **Terminal 2**: Start frontend (if needed)
   ```bash
   cd frontend
   npm run dev
   ```

3. Keep both running while developing!

## Environment Variables (Optional)

Create a `.env` file in the `backend` directory:

```env
GROQ_API_KEY=your-groq-api-key-here
OPENAI_API_KEY=your-openai-api-key-here
PORT=8000
```

The server will work without these, but some features (LLM, AI chat) won't be available.


