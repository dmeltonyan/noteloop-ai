import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { NavigationHeader } from '../components/NavigationHeader'
import { AIChatAssistant } from '../components/AIChatAssistant'
import { MessageCircle, Send, Sparkles, Lightbulb, BookOpen, X, RotateCcw, Upload, FileText } from 'lucide-react'

export const TutorPage = () => {
  const [session, setSession] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [topic, setTopic] = useState('')
  const [showTopicInput, setShowTopicInput] = useState(true)
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [questionAnswer, setQuestionAnswer] = useState('')
  const [showHint, setShowHint] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const messagesEndRef = useRef(null)
  const userId = 'demo_user_123'
  const navigate = useNavigate()

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setUploadingFile(true)
    try {
      const result = await api.uploadFile(file)
      if (result.success) {
        setUploadedFile({
          filename: file.name,
          concepts: result.concepts_created,
          upload_id: result.upload_id
        })
        // Auto-set topic if not already set
        if (!topic.trim()) {
          setTopic(file.name.split('.')[0])
        }
      } else {
        alert(result.message || 'Failed to upload file')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Failed to upload file')
    } finally {
      setUploadingFile(false)
    }
  }

  const startSession = async () => {
    if (!topic.trim() && !uploadedFile) {
      alert('Please enter a topic or upload a file to study')
      return
    }

    setLoading(true)
    try {
      const sessionTopic = uploadedFile 
        ? `${topic.trim() || uploadedFile.filename} (from uploaded document)`
        : topic.trim()
      
      const result = await api.startTutorSession(userId, sessionTopic)
      if (result.success && result.session) {
        setSession(result.session)
        setMessages(result.session.messages || [])
        setShowTopicInput(false)
        
        // If file was uploaded, mention it in first message
        if (uploadedFile) {
          const fileMessage = `I've uploaded a document (${uploadedFile.filename}) with ${uploadedFile.concepts} concepts. Let's study this material together.`
          setTimeout(() => {
            setInputMessage(fileMessage)
            // Note: sendMessage will be called after session is set
          }, 1000)
        }
      } else {
        alert('Failed to start session. Please try again.')
      }
    } catch (error) {
      console.error('Error starting session:', error)
      alert('Failed to start tutoring session')
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || !session) return

    const userMsg = inputMessage.trim()
    setInputMessage('')
    setLoading(true)

    // Add user message to UI immediately
    const newUserMessage = {
      role: 'user',
      content: userMsg,
      timestamp: new Date().toISOString()
    }
    setMessages(prev => [...prev, newUserMessage])

    try {
      const result = await api.tutorMessage(userId, session.id, userMsg)
      if (result.response) {
        setMessages(prev => [...prev, {
          role: 'tutor',
          content: result.response,
          timestamp: new Date().toISOString()
        }])
        if (result.session) {
          setSession(result.session)
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => [...prev, {
        role: 'tutor',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      }])
    } finally {
      setLoading(false)
    }
  }

  const generateQuestion = async () => {
    if (!session) return

    setLoading(true)
    setCurrentQuestion(null)
    setQuestionAnswer('')
    setShowHint(false)

    try {
      const result = await api.tutorGenerateQuestion(userId, session.id)
      if (result.success && result.question) {
        setCurrentQuestion(result.question)
      } else {
        alert('Failed to generate question')
      }
    } catch (error) {
      console.error('Error generating question:', error)
      alert('Failed to generate question')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (showTopicInput) {
        startSession()
      } else {
        sendMessage()
      }
    }
  }

  const resetSession = () => {
    setSession(null)
    setMessages([])
    setTopic('')
    setShowTopicInput(true)
    setCurrentQuestion(null)
    setQuestionAnswer('')
    setShowHint(false)
  }

  return (
    <>
      <NavigationHeader />
      <div className="tutor-page" style={{ paddingTop: '80px' }}>
        <div className="tutor-container">
          <div className="tutor-header">
            <div className="tutor-title">
              <Sparkles size={28} />
              <h1>AI Tutor</h1>
            </div>
            <p className="tutor-subtitle">One-on-one tutoring with personalized guidance</p>
          </div>

          {showTopicInput ? (
            <div className="tutor-start">
              <div className="start-card">
                <Lightbulb size={48} className="start-icon" />
                <h2>What would you like to learn today?</h2>
                <p>Enter a topic, concept, or subject you'd like help with</p>
                <div className="topic-input-group">
                  <BookOpen size={20} />
                  <input
                    type="text"
                    placeholder="e.g., Photosynthesis, Algebra, World War II..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="topic-input"
                    autoFocus
                  />
                </div>
                
                {/* File Upload Option */}
                <div className="file-upload-section">
                  <label className="file-upload-label">
                    <Upload size={20} />
                    <span>{uploadedFile ? 'File Uploaded' : 'Upload Study Material (PDF, TXT, DOCX)'}</span>
                    <input
                      type="file"
                      accept=".pdf,.txt,.docx"
                      onChange={handleFileUpload}
                      className="file-input"
                      disabled={uploadingFile}
                    />
                  </label>
                  {uploadingFile && (
                    <div className="upload-status">Processing file...</div>
                  )}
                  {uploadedFile && (
                    <div className="upload-success">
                      <FileText size={18} />
                      <span>{uploadedFile.filename} ({uploadedFile.concepts} concepts)</span>
                      <button 
                        onClick={() => {
                          setUploadedFile(null)
                          setTopic('')
                        }}
                        className="remove-file-btn"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={startSession}
                  disabled={loading || (!topic.trim() && !uploadedFile)}
                  className="start-button"
                >
                  {loading ? 'Starting...' : 'Start Tutoring Session'}
                </button>
              </div>
            </div>
          ) : (
            <div className="tutor-session">
              <div className="session-header">
                <div className="session-info">
                  <h3>Topic: {session?.topic}</h3>
                  <span className="session-badge">Active Session</span>
                </div>
                <button onClick={resetSession} className="reset-button">
                  <RotateCcw size={18} />
                  New Session
                </button>
              </div>

              <div className="tutor-main">
                <div className="tutor-chat">
                  <div className="messages-container">
                    {messages.map((msg, idx) => (
                      <div key={idx} className={`message ${msg.role}`}>
                        <div className="message-avatar">
                          {msg.role === 'tutor' ? <Sparkles size={20} /> : <MessageCircle size={20} />}
                        </div>
                        <div className="message-content">
                          <div className="message-text">{msg.content}</div>
                        </div>
                      </div>
                    ))}
                    {loading && (
                      <div className="message tutor">
                        <div className="message-avatar">
                          <Sparkles size={20} />
                        </div>
                        <div className="message-content">
                          <div className="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="chat-input-container">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask a question or say what you need help with..."
                      className="chat-input"
                      disabled={loading}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={loading || !inputMessage.trim()}
                      className="send-button"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </div>

                <div className="tutor-sidebar">
                  <div className="sidebar-section">
                    <h4>Practice Questions</h4>
                    <button
                      onClick={generateQuestion}
                      disabled={loading}
                      className="question-button"
                    >
                      <Lightbulb size={18} />
                      Generate Practice Question
                    </button>

                    {currentQuestion && (
                      <div className="question-card">
                        <div className="question-text">{currentQuestion.question}</div>
                        
                        {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
                          <div className="question-options">
                            {currentQuestion.options.map((option, idx) => (
                              <button
                                key={idx}
                                className={`option-button ${questionAnswer === option ? 'selected' : ''}`}
                                onClick={() => setQuestionAnswer(option)}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        )}

                        {currentQuestion.type === 'explanation' && (
                          <textarea
                            value={questionAnswer}
                            onChange={(e) => setQuestionAnswer(e.target.value)}
                            placeholder="Type your answer here..."
                            className="answer-textarea"
                            rows={4}
                          />
                        )}

                        {currentQuestion.hint && (
                          <button
                            onClick={() => setShowHint(!showHint)}
                            className="hint-button"
                          >
                            {showHint ? 'Hide' : 'Show'} Hint
                          </button>
                        )}

                        {showHint && currentQuestion.hint && (
                          <div className="hint-box">
                            <Lightbulb size={16} />
                            <span>{currentQuestion.hint}</span>
                          </div>
                        )}

                        {questionAnswer && (
                          <div className="answer-feedback">
                            {currentQuestion.type === 'multiple_choice' && questionAnswer === currentQuestion.correct_answer ? (
                              <div className="feedback correct">
                                ✓ Correct! {currentQuestion.explanation || 'Well done!'}
                              </div>
                            ) : currentQuestion.type === 'multiple_choice' ? (
                              <div className="feedback incorrect">
                                Not quite. {currentQuestion.explanation || 'Try again!'}
                              </div>
                            ) : (
                              <div className="feedback info">
                                Great answer! Here's what you should know: {currentQuestion.explanation || 'Your explanation shows good understanding!'}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');

          .tutor-page {
            min-height: 100vh;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            color: white;
            padding: 2rem;
          }

          .tutor-container {
            max-width: 1400px;
            margin: 0 auto;
          }

          .tutor-header {
            text-align: center;
            margin-bottom: 3rem;
          }

          .tutor-title {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1rem;
            margin-bottom: 0.5rem;
          }

          .tutor-title h1 {
            font-size: 2.5rem;
            font-weight: 700;
            background: linear-gradient(135deg, #4A90E2 0%, #50E3C2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-family: 'Space Grotesk', sans-serif;
            letter-spacing: -0.02em;
          }

          .tutor-subtitle {
            color: rgba(255,255,255,0.7);
            font-size: 1rem;
            font-family: 'Inter', sans-serif;
          }

          .tutor-start {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 400px;
          }

          .start-card {
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 20px;
            padding: 3rem;
            max-width: 600px;
            text-align: center;
            backdrop-filter: blur(10px);
          }

          .start-icon {
            color: var(--color-primary);
            margin-bottom: 1rem;
          }

          .start-card h2 {
            margin-bottom: 0.5rem;
            font-size: 1.8rem;
          }

          .start-card p {
            color: rgba(255,255,255,0.7);
            margin-bottom: 2rem;
          }

          .topic-input-group {
            display: flex;
            align-items: center;
            gap: 1rem;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 12px;
            padding: 1rem;
            margin-bottom: 1.5rem;
          }

          .topic-input {
            flex: 1;
            background: transparent;
            border: none;
            color: white;
            font-size: 1rem;
            outline: none;
          }

          .topic-input::placeholder {
            color: rgba(255,255,255,0.5);
          }

          .file-upload-section {
            margin-bottom: 1.5rem;
          }

          .file-upload-label {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            background: rgba(255,255,255,0.05);
            border: 2px dashed rgba(255,255,255,0.2);
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.2s;
            color: rgba(255,255,255,0.8);
          }

          .file-upload-label:hover {
            border-color: var(--color-primary);
            background: rgba(255,255,255,0.08);
          }

          .file-input {
            display: none;
          }

          .upload-status {
            margin-top: 0.5rem;
            padding: 0.5rem;
            text-align: center;
            color: rgba(255,255,255,0.7);
            font-size: 0.9rem;
          }

          .upload-success {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-top: 0.75rem;
            padding: 0.75rem;
            background: rgba(16, 185, 129, 0.2);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 8px;
            color: #10b981;
            font-size: 0.9rem;
          }

          .upload-success span {
            flex: 1;
          }

          .remove-file-btn {
            background: rgba(255,255,255,0.1);
            border: none;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: white;
            transition: all 0.2s;
          }

          .remove-file-btn:hover {
            background: rgba(239, 68, 68, 0.3);
            transform: scale(1.1);
          }

          .start-button {
            width: 100%;
            padding: 1rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            border-radius: 12px;
            color: white;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s;
          }

          .start-button:hover:not(:disabled) {
            transform: translateY(-2px);
          }

          .start-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .tutor-session {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
          }

          .session-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            background: rgba(255,255,255,0.05);
            border-radius: 12px;
          }

          .session-info {
            display: flex;
            align-items: center;
            gap: 1rem;
          }

          .session-info h3 {
            margin: 0;
            font-size: 1.2rem;
          }

          .session-badge {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
          }

          .reset-button {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 8px;
            color: white;
            cursor: pointer;
            transition: all 0.2s;
          }

          .reset-button:hover {
            background: rgba(255,255,255,0.15);
          }

          .tutor-main {
            display: grid;
            grid-template-columns: 1fr 400px;
            gap: 1.5rem;
          }

          .tutor-chat {
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 16px;
            display: flex;
            flex-direction: column;
            height: 600px;
          }

          .messages-container {
            flex: 1;
            overflow-y: auto;
            padding: 1.5rem;
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          .message {
            display: flex;
            gap: 1rem;
            align-items: flex-start;
          }

          .message.user {
            flex-direction: row-reverse;
          }

          .message-avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .message.tutor .message-avatar {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }

          .message.user .message-avatar {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          }

          .message-content {
            flex: 1;
            background: rgba(255,255,255,0.05);
            border-radius: 12px;
            padding: 1rem;
          }

          .message.user .message-content {
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
          }

          .message-text {
            line-height: 1.6;
          }

          .typing-indicator {
            display: flex;
            gap: 0.5rem;
            padding: 0.5rem 0;
          }

          .typing-indicator span {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: rgba(255,255,255,0.5);
            animation: typing 1.4s infinite;
          }

          .typing-indicator span:nth-child(2) {
            animation-delay: 0.2s;
          }

          .typing-indicator span:nth-child(3) {
            animation-delay: 0.4s;
          }

          @keyframes typing {
            0%, 60%, 100% { transform: translateY(0); }
            30% { transform: translateY(-10px); }
          }

          .chat-input-container {
            display: flex;
            gap: 0.5rem;
            padding: 1rem;
            border-top: 1px solid rgba(255,255,255,0.1);
          }

          .chat-input {
            flex: 1;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 12px;
            padding: 0.75rem 1rem;
            color: white;
            font-size: 1rem;
            outline: none;
          }

          .chat-input::placeholder {
            color: rgba(255,255,255,0.5);
          }

          .send-button {
            padding: 0.75rem 1rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            border-radius: 12px;
            color: white;
            cursor: pointer;
            transition: transform 0.2s;
          }

          .send-button:hover:not(:disabled) {
            transform: scale(1.05);
          }

          .send-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .tutor-sidebar {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          .sidebar-section {
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 16px;
            padding: 1.5rem;
          }

          .sidebar-section h4 {
            margin: 0 0 1rem 0;
            font-size: 1.1rem;
          }

          .question-button {
            width: 100%;
            padding: 1rem;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            border: none;
            border-radius: 12px;
            color: white;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            transition: transform 0.2s;
          }

          .question-button:hover:not(:disabled) {
            transform: translateY(-2px);
          }

          .question-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .question-card {
            margin-top: 1rem;
            padding: 1rem;
            background: rgba(255,255,255,0.05);
            border-radius: 12px;
          }

          .question-text {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 1rem;
          }

          .question-options {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            margin-bottom: 1rem;
          }

          .option-button {
            padding: 0.75rem;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 8px;
            color: white;
            text-align: left;
            cursor: pointer;
            transition: all 0.2s;
          }

          .option-button:hover {
            background: rgba(255,255,255,0.1);
          }

          .option-button.selected {
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%);
            border-color: var(--color-primary);
          }

          .answer-textarea {
            width: 100%;
            padding: 0.75rem;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 8px;
            color: white;
            font-size: 0.95rem;
            resize: vertical;
            margin-bottom: 1rem;
            font-family: inherit;
          }

          .answer-textarea::placeholder {
            color: rgba(255,255,255,0.5);
          }

          .hint-button {
            padding: 0.5rem 1rem;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 8px;
            color: white;
            cursor: pointer;
            font-size: 0.9rem;
            margin-bottom: 1rem;
          }

          .hint-button:hover {
            background: rgba(255,255,255,0.1);
          }

          .hint-box {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem;
            background: rgba(251, 191, 36, 0.1);
            border: 1px solid rgba(251, 191, 36, 0.2);
            border-radius: 8px;
            margin-bottom: 1rem;
            font-size: 0.9rem;
          }

          .answer-feedback {
            margin-top: 1rem;
            padding: 1rem;
            border-radius: 8px;
          }

          .feedback.correct {
            background: rgba(16, 185, 129, 0.2);
            border: 1px solid rgba(16, 185, 129, 0.3);
            color: #10b981;
          }

          .feedback.incorrect {
            background: rgba(239, 68, 68, 0.2);
            border: 1px solid rgba(239, 68, 68, 0.3);
            color: #ef4444;
          }

          .feedback.info {
            background: rgba(59, 130, 246, 0.2);
            border: 1px solid rgba(59, 130, 246, 0.3);
            color: #3b82f6;
          }

          @media (max-width: 1024px) {
            .tutor-main {
              grid-template-columns: 1fr;
            }

            .tutor-sidebar {
              order: -1;
            }
          }
        `}</style>
      </div>
      <AIChatAssistant userId={userId} />
    </>
  )
}

