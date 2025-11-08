import React, { useState, useEffect, useRef } from 'react'
import { api } from '../services/api'
import { Send, Bot, User, X, Minimize2, Maximize2, MessageSquare, Sparkles } from 'lucide-react'

export const AIChatAssistant = ({ userId, onExplainConcept }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    loadChatHistory()
  }, [userId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadChatHistory = async () => {
    try {
      const result = await api.getChatHistory(userId)
      if (result.history && result.history.length > 0) {
        setMessages(result.history)
      }
    } catch (error) {
      console.error('Failed to load chat history:', error)
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setLoading(true)

    // Add user message immediately
    const newUserMsg = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    }
    setMessages(prev => [...prev, newUserMsg])

    try {
      const response = await api.chatWithAI(userId, userMessage)
      
      if (response.response) {
        const aiMsg = {
          role: 'assistant',
          content: response.response,
          timestamp: response.timestamp || new Date().toISOString()
        }
        setMessages(prev => [...prev, aiMsg])
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMsg = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }

  const handleExplainConcept = async (conceptText) => {
    if (!conceptText || loading) return
    
    setLoading(true)
    const userMsg = {
      role: 'user',
      content: `Explain this concept: ${conceptText.substring(0, 200)}`,
      timestamp: new Date().toISOString()
    }
    setMessages(prev => [...prev, userMsg])

    try {
      const response = await api.explainConcept(userId, conceptText)
      if (response.response) {
        const aiMsg = {
          role: 'assistant',
          content: response.response,
          timestamp: response.timestamp || new Date().toISOString()
        }
        setMessages(prev => [...prev, aiMsg])
      }
    } catch (error) {
      console.error('Explain error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="ai-chat-button"
        aria-label="Open AI Assistant"
      >
        <MessageSquare size={24} />
        <span>AI Assistant</span>
        <style>{`
        .ai-chat-button {
          position: fixed;
          bottom: 24px;
          right: 24px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 1.25rem;
          background: linear-gradient(135deg, var(--color-gradient-start) 0%, var(--color-gradient-end) 100%);
          color: white;
          border: none;
          border-radius: 50px;
          font-weight: 700;
          font-size: 0.875rem;
          cursor: pointer;
          box-shadow: var(--shadow-md);
          transition: all 0.3s ease;
          z-index: 999;
        }
        .ai-chat-button:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }
        `}</style>
      </button>
    )
  }

  return (
    <div className={`ai-chat-container ${isMinimized ? 'minimized' : ''}`}>
      <div className="ai-chat-header">
        <div className="header-left">
          <Sparkles size={20} />
          <div>
            <h3>AI Learning Assistant</h3>
            <p>Ask me anything about your studies</p>
          </div>
        </div>
        <div className="header-actions">
          <button onClick={() => setIsMinimized(!isMinimized)} className="icon-button">
            {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
          </button>
          <button onClick={() => setIsOpen(false)} className="icon-button">
            <X size={18} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="ai-chat-messages">
            {messages.length === 0 ? (
              <div className="empty-chat">
                <Bot size={48} />
                <p>Ask me anything about your learning materials!</p>
                <div className="suggested-questions">
                  <button onClick={() => handleExplainConcept('Explain machine learning concepts')}>
                    Explain machine learning
                  </button>
                  <button onClick={() => setInput('How can I improve my learning?')}>
                    How to improve?
                  </button>
                  <button onClick={() => setInput('What should I focus on next?')}>
                    What to focus on?
                  </button>
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`message ${msg.role}`}>
                  <div className="message-avatar">
                    {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                  </div>
                  <div className="message-content">
                    <p>{msg.content}</p>
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="message assistant">
                <div className="message-avatar">
                  <Bot size={20} />
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

          <form onSubmit={handleSend} className="ai-chat-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()}>
              <Send size={20} />
            </button>
          </form>
        </>
      )}

      <style>{`
        .ai-chat-container {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 380px;
          max-height: 580px;
          background: var(--color-bg-secondary);
          border: 2px solid var(--color-border);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          display: flex;
          flex-direction: column;
          z-index: 999;
          animation: slideUp 0.3s ease;
        }

        .ai-chat-container.minimized {
          max-height: 60px;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .ai-chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.875rem 1rem;
          border-bottom: 1px solid var(--color-border);
          background: linear-gradient(135deg, rgba(74, 144, 226, 0.2), rgba(80, 227, 194, 0.2));
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex: 1;
        }

        .header-left svg {
          color: var(--color-primary);
        }

        .header-left h3 {
          font-size: 0.9375rem;
          font-weight: 700;
          margin: 0;
          color: var(--color-text-primary);
        }

        .header-left p {
          font-size: 0.75rem;
          color: var(--color-text-secondary);
          margin: 0;
        }

        .header-actions {
          display: flex;
          gap: 0.5rem;
        }

        .icon-button {
          background: transparent;
          border: none;
          color: rgba(255,255,255,0.7);
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .icon-button:hover {
          background: rgba(255,255,255,0.1);
          color: white;
        }

        .ai-chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          max-height: 400px;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .empty-chat {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          text-align: center;
          color: rgba(255,255,255,0.7);
        }

        .empty-chat svg {
          color: #667eea;
          margin-bottom: 1rem;
        }

        .suggested-questions {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-top: 1rem;
          width: 100%;
        }

        .suggested-questions button {
          padding: 0.75rem;
          background: rgba(102, 126, 234, 0.1);
          border: 1px solid rgba(102, 126, 234, 0.3);
          border-radius: 8px;
          color: rgba(255,255,255,0.9);
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s ease;
        }

        .suggested-questions button:hover {
          background: rgba(102, 126, 234, 0.2);
          border-color: #667eea;
        }

        .message {
          display: flex;
          gap: 0.75rem;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .message.user {
          flex-direction: row-reverse;
        }

        .message-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .message.user .message-avatar {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
        }

        .message.assistant .message-avatar {
          background: rgba(102, 126, 234, 0.2);
          color: #667eea;
        }

        .message-content {
          flex: 1;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          max-width: 75%;
        }

        .message.user .message-content {
          background: linear-gradient(135deg, var(--color-gradient-start) 0%, var(--color-gradient-end) 100%);
          color: white;
        }

        .message.assistant .message-content {
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          color: var(--color-text-primary);
        }

        .message-content p {
          margin: 0;
          line-height: 1.5;
          font-size: 0.9375rem;
        }

        .typing-indicator {
          display: flex;
          gap: 0.25rem;
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
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-10px);
          }
        }

        .ai-chat-input {
          display: flex;
          gap: 0.5rem;
          padding: 1rem;
          border-top: 1px solid rgba(255,255,255,0.1);
        }

        .ai-chat-input input {
          flex: 1;
          padding: 0.75rem 1rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: white;
          font-size: 0.9375rem;
        }

        .ai-chat-input input:focus {
          outline: none;
          border-color: #667eea;
        }

        .ai-chat-input input::placeholder {
          color: rgba(255,255,255,0.5);
        }

        .ai-chat-input button {
          padding: 0.75rem;
          background: linear-gradient(135deg, var(--color-gradient-start) 0%, var(--color-gradient-end) 100%);
          border: none;
          border-radius: var(--radius-md);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .ai-chat-input button:hover:not(:disabled) {
          transform: scale(1.05);
        }

        .ai-chat-input button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .ai-chat-container {
            width: calc(100vw - 48px);
            max-width: 400px;
            bottom: 80px;
          }
        }
      `}</style>
    </div>
  )
}

