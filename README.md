# NoteLoop AI

An adaptive study app: upload notes, slides or PDFs and get a personalized feed of quizzes, flashcards and summaries.

> **Status: early scaffold.** This repository holds the project skeleton (Next.js frontend, API server, shared types). The ingestion and content-generation pipeline is not in this repo yet.

## Planned architecture

| Part | Stack | Role |
| --- | --- | --- |
| `frontend/` | Next.js, TypeScript, Tailwind | Upload, study feed, quiz UI |
| `backend/` | FastAPI (Python): OCR with Tesseract/OpenCV, LLM generation, Supabase | Parse documents, generate study material, validate model output against a schema |
| `shared/` | TypeScript | Types and constants shared by both sides |

## Run locally

Requires Node.js 20+.

```bash
git clone https://github.com/dmeltonyan/noteloop-ai.git
cd noteloop-ai

cd frontend && npm install && npm run dev   # http://localhost:3000
cd ../backend && npm install && npm run dev # http://localhost:3001
```

## License

MIT · Built by [David Meltonyan](https://meltonyan.dev)
