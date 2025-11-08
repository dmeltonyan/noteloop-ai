# NoteLoop AI - Complete Setup & Run Instructions

## 🚀 Quick Start Commands (Git Bash)

### **Step 1: Start Backend Server**

```bash
cd /c/Users/DavidM/Documents/GitHub/noteloop-ai/backend
python run.py
```

**Expected Output:**
```
🚀 Starting NoteLoop AI Backend
✅ Demo loaded
✅ Document Processor with GPT-4 Deep Analysis
✅ GPT Content Generator (Enhanced)
✅ http://localhost:8000
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

**Keep this terminal open!** ⚠️

---

### **Step 2: Start Frontend Server** 

Open a **NEW Git Bash terminal** and run:

```bash
cd /c/Users/DavidM/Documents/GitHub/noteloop-ai/frontend
npm run dev
```

**Expected Output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

**Keep this terminal open!** ⚠️

---

### **Step 3: Access the App**

Open your browser and go to:
👉 **http://localhost:5173**

---

## 📋 Complete User Flow

### 1. **Upload Your Document**
   - Drag & drop a PDF, TXT, MD, or DOCX file
   - Or click "Choose File" to browse
   - Max file size: 10MB

### 2. **Processing** (Takes 30-60 seconds)
   - You'll see "Processing Your Content" message
   - AI analyzes your document and extracts concepts
   - Generates personalized quiz questions

### 3. **Success Screen**
   - Shows how many concepts were created
   - Auto-redirects to feed after 2 seconds

### 4. **Learning Feed**
   - Questions appear immediately
   - Read the question carefully
   - Click an answer (A, B, C, or D)

### 5. **Detailed Explanations**
   - Right sidebar shows explanation
   - If wrong: mistake analysis + follow-up questions
   - View source material anytime
   - Click "Next Question" to continue

---

## 🔧 Troubleshooting

### Backend Won't Start?

**Check if port 8000 is in use:**
```bash
netstat -ano | findstr :8000
```

**Install missing dependencies:**
```bash
cd /c/Users/DavidM/Documents/GitHub/noteloop-ai/backend
pip install -r requirements.txt --break-system-packages
```

**Check API key:**
- Verify `backend/.env` exists
- Ensure `OPENAI_API_KEY=sk-proj-...` is set

---

### Frontend Won't Start?

**Install dependencies:**
```bash
cd /c/Users/DavidM/Documents/GitHub/noteloop-ai/frontend
npm install
npm run dev
```

**Port already in use?**
- Vite will automatically try next port (5174, 5175, etc.)
- Or kill process: `netstat -ano | findstr :5173`

---

### No Questions After Upload?

**Check backend terminal:**
- Should see: `✅ GPT-4 extracted X concepts`
- Should see: `✅ Generated 3 enhanced quizzes` (repeated)

**Check browser console (F12):**
- Look for API errors
- Verify feed endpoint returns data

**Test API directly:**
```bash
curl http://localhost:8000/api/health
```

Should return: `{"status":"healthy","database":{...}}`

---

## ✅ What Was Fixed

1. **Feed Generation Fixed**
   - Added `get_concept()` and `get_quiz()` methods to database
   - Fixed feed generation to always return quizzes
   - Improved error handling for missing concepts

2. **Source Text Processing**
   - Full document text now properly extracted and stored
   - Source material available in quiz explanations
   - Better fallback handling

3. **Upload Flow**
   - Documents properly processed
   - Source text preserved throughout the pipeline
   - Better error messages

---

## 📊 File Processing

### Supported Formats:
- ✅ **TXT** - Plain text files
- ✅ **MD** - Markdown files  
- ✅ **PDF** - PDF documents (requires pdfplumber)
- ✅ **DOCX** - Word documents

### Processing Flow:
1. **File Upload** → Content extracted
2. **GPT-4 Analysis** → Concepts identified (5-8 per document)
3. **Quiz Generation** → 3 questions per concept
4. **Source Text** → Full document preserved for reference
5. **Feed Ready** → Questions available immediately

---

## 🎯 Key Features

- ✅ **Adaptive Learning** - Questions adjust to your ability
- ✅ **Detailed Explanations** - Learn why answers are correct/incorrect
- ✅ **Source Material** - View original text anytime
- ✅ **Progress Tracking** - Track accuracy and mastery
- ✅ **Mistake Analysis** - Understand what went wrong
- ✅ **Follow-up Questions** - Reinforce learning

---

## 🛑 Stopping the Servers

**Backend:** Press `Ctrl+C` in the backend terminal  
**Frontend:** Press `Ctrl+C` in the frontend terminal

---

## 📝 Notes

- **Backend runs on:** `http://localhost:8000`
- **Frontend runs on:** `http://localhost:5173`
- **Default User ID:** `demo_user_123`
- **Processing Time:** 30-60 seconds per file (depends on GPT API speed)

---

**Ready to learn! 🚀**

Upload a file and start your personalized learning journey!




