"""
Start the NoteLoop AI Backend Server
Run this file to start the FastAPI server
"""
import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

if __name__ == "__main__":
    # Get port from environment or default to 8000
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    print("🚀 Starting NoteLoop AI Backend Server...")
    print(f"📡 Server will run on http://localhost:{port}")
    print(f"📚 API docs available at http://localhost:{port}/docs")
    print("\n⚠️  Make sure you have:")
    print("   1. Installed dependencies: pip install -r requirements.txt")
    print("   2. Set GROQ_API_KEY (optional, for LLM features)")
    print("   3. Set OPENAI_API_KEY (optional, for AI chat)")
    print("\n" + "="*50 + "\n")
    
    uvicorn.run(
        "src.server:app",
        host=host,
        port=port,
        reload=True,  # Auto-reload on code changes
        log_level="info"
    )


