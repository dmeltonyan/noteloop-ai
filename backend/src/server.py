"""
NoteLoop AI Backend Server
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.routes.api_routes import router
import os

app = FastAPI(title="NoteLoop AI API")

# Configure CORS - Allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
    max_age=3600,
)

# Include API routes
app.include_router(router, prefix="/api")

@app.get("/")
async def root():
    return {
        "message": "NoteLoop AI API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health():
    from src.models.database import db
    return {
        "status": "healthy",
        "database": {
            "users": len(db.users),
            "concepts": len(db.concepts),
            "videos": len(db.videos),
            "quizzes": len(db.quizzes)
        }
    }

print("OK http://localhost:8000")
