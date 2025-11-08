import sys
import os
import uvicorn

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

if __name__ == "__main__":
    print("=" * 60)
    print("🚀 Starting NoteLoop AI Backend Server")
    print("=" * 60)
    print(f"📡 Server will run on: http://localhost:8000")
    print(f"📚 API docs available at: http://localhost:8000/docs")
    print(f"💚 Health check: http://localhost:8000/health")
    print("")
    print("⚠️  Keep this window open while developing!")
    print("   Press Ctrl+C to stop the server")
    print("=" * 60)
    print("")
    
    try:
        uvicorn.run(
            "src.server:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n\n🛑 Server stopped by user")
    except Exception as e:
        print(f"\n❌ Server error: {e}")
        print("\nTroubleshooting:")
        print("1. Make sure you're in the 'backend' directory")
        print("2. Install dependencies: pip install -r requirements.txt")
        print("3. Check if port 8000 is already in use")
        sys.exit(1)
