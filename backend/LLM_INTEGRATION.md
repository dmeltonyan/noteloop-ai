# Free LLM Integration Guide

## Overview

This integration uses **Groq API with Llama 3.1 70B** for high-quality, fast content generation. All outputs are structured JSON for easy frontend integration.

## Why Groq + Llama 3.1 70B?

| Feature | Rating | Notes |
|---------|--------|-------|
| **Speed** | ⭐⭐⭐⭐⭐ | Fastest inference (tokens/second) |
| **Quality** | ⭐⭐⭐⭐⭐ | Comparable to GPT-4 |
| **Cost** | ⭐⭐⭐⭐⭐ | Free tier: 30 req/min, 14,400 req/day |
| **Ease** | ⭐⭐⭐⭐⭐ | Simple API, easy integration |
| **JSON Support** | ⭐⭐⭐⭐⭐ | Excellent structured output |

**Recommendation**: Groq + Llama 3.1 70B is the best choice for free, high-quality LLM integration.

## Setup

### 1. Get Free API Key

1. Go to https://console.groq.com/
2. Sign up (free)
3. Create an API key
4. Copy the key

### 2. Set Environment Variable

```bash
# Linux/Mac
export GROQ_API_KEY="your-api-key-here"

# Windows PowerShell
$env:GROQ_API_KEY="your-api-key-here"

# Or add to .env file
echo "GROQ_API_KEY=your-api-key-here" >> .env
```

### 3. Install Dependencies

```bash
pip install groq
```

## API Endpoints

### POST `/api/process-text`

Complete text processing pipeline (concepts + summary + outline)

**Request:**
```json
{
  "text": "Your text content here..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "concepts": {...},
    "summary": {...},
    "outline": {...},
    "processing_complete": true
  }
}
```

### POST `/api/extract-concepts`

Extract concepts from text

**Request:**
```json
{
  "text": "Your text content..."
}
```

**Response:**
```json
{
  "success": true,
  "concepts": {
    "topics": ["topic1", "topic2"],
    "key_terms": ["term1", "term2"],
    "main_concepts": [
      {
        "name": "Concept Name",
        "description": "...",
        "importance": "high|medium|low",
        "related_topics": [...]
      }
    ],
    "summary": "..."
  }
}
```

### POST `/api/generate-summary`

Generate summary

**Request:**
```json
{
  "text": "Your text...",
  "length": "short|medium|long"
}
```

### POST `/api/flashcards`

Generate flashcards from concepts

**Request:**
```json
{
  "concepts": [
    {
      "id": "concept_1",
      "name": "Concept Name",
      "description": "Description..."
    }
  ],
  "count": 10
}
```

**Response:**
```json
{
  "success": true,
  "flashcards": [
    {
      "front": "Question",
      "back": "Answer",
      "concept": "Concept Name",
      "difficulty": "easy|medium|hard",
      "confidence_tag": "low|medium|high"
    }
  ]
}
```

### POST `/api/quiz`

Generate quiz questions (Bloom's taxonomy)

**Request:**
```json
{
  "concepts": [...],
  "difficulty": "easy|medium|hard|mixed",
  "question_count": 10
}
```

**Response:**
```json
{
  "success": true,
  "questions": [
    {
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "correct_answer": "A",
      "explanation": "Why this is correct",
      "difficulty": "easy|medium|hard",
      "bloom_level": "remember|understand|apply|analyze|evaluate|create",
      "concept": "Related concept"
    }
  ]
}
```

### POST `/api/study-plan`

Generate adaptive study plan

**Request:**
```json
{
  "concepts": [...],
  "user_level": "beginner|intermediate|advanced",
  "duration_days": 7
}
```

### POST `/api/topic-outline`

Generate hierarchical topic outline

**Request:**
```json
{
  "text": "Your text content..."
}
```

## Frontend Usage Example

```javascript
// React example
import { api } from '../services/api'

// Process uploaded text
const processText = async (text) => {
  const response = await fetch('http://localhost:8000/api/process-text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  })
  const data = await response.json()
  return data
}

// Generate flashcards
const generateFlashcards = async (concepts) => {
  const response = await fetch('http://localhost:8000/api/flashcards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      concepts,
      count: 10 
    })
  })
  const data = await response.json()
  return data.flashcards
}

// Generate quiz
const generateQuiz = async (concepts, difficulty = 'mixed') => {
  const response = await fetch('http://localhost:8000/api/quiz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      concepts,
      difficulty,
      question_count: 10 
    })
  })
  const data = await response.json()
  return data.questions
}
```

## Python Usage Examples

```python
from src.services.llm.generator import llm_generator

# Extract concepts
concepts = await llm_generator.extract_concepts(text)
print(concepts["main_concepts"])

# Generate summary
summary = await llm_generator.generate_summary(text, length="medium")
print(summary["summary"])

# Create flashcards
flashcards = await llm_generator.create_flashcards(concepts["main_concepts"], count=10)
for card in flashcards["flashcards"]:
    print(f"Q: {card['front']}")
    print(f"A: {card['back']}")

# Generate quiz
quiz = await llm_generator.generate_quiz(concepts["main_concepts"], difficulty="mixed")
for q in quiz["questions"]:
    print(f"Q: {q['question']}")
    print(f"Options: {q['options']}")
    print(f"Answer: {q['correct_answer']}")
```

## Testing

Run tests:

```bash
pytest backend/tests/test_llm.py -v
```

Tests verify:
- ✅ Structured JSON output
- ✅ Field existence
- ✅ Quiz difficulty scaling
- ✅ Flashcard generation
- ✅ Valid JSON format

## Rate Limits

Groq Free Tier:
- **30 requests per minute**
- **14,400 requests per day**

For production, consider:
- Caching results
- Batch processing
- Upgrading to paid tier if needed

## Fallback Mode

If `GROQ_API_KEY` is not set, the system will:
- Still function (no crashes)
- Return fallback responses
- Log warnings

## File Structure

```
backend/src/services/llm/
├── __init__.py          # Module exports
├── client.py            # Groq API client
├── prompts.py           # Prompt templates
└── generator.py         # High-level content generation

backend/tests/
└── test_llm.py          # Test suite
```

## Troubleshooting

**Error: "No API key found"**
- Set `GROQ_API_KEY` environment variable
- Restart the server

**Error: "Rate limit exceeded"**
- You've hit the free tier limit
- Wait 1 minute or upgrade

**Error: "Invalid JSON"**
- LLM sometimes wraps JSON in markdown
- Client automatically extracts JSON
- Check logs for details

## Next Steps

1. Set up API key
2. Test endpoints
3. Integrate with frontend
4. Add caching for better performance
5. Monitor usage and rate limits


