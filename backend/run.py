import sys
import os
import uvicorn

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

if __name__ == "__main__":
    print("🚀 Starting NoteLoop AI Backend")
    uvicorn.run(
        "src.server:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
