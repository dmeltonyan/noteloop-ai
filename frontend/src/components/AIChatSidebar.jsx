import React, { useState, useEffect, useRef } from 'react'
import { api } from '../services/api'
import { Send, Bot, User, X, Minimize2, Maximize2, Sparkles } from 'lucide-react'

export const AIChatSidebar = ({ userId, uploadId = null, currentConcept = null, onExplainConcept }) => {
  const [isOpen, setIsOpen] = useState(true)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    loadChatHistory()
  }, [userId, uploadId])

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
        // Filter by upload_id if provided
        const filtered = uploadId 
          ? result.history.filter(msg => msg.upload_id === uploadId)
          : result.history
        setMessages(filtered)
      }
    } catch (error) {
      console.error('Failed to load chat history:', error)
    }
  }

  const formatAsSummary = (text) => {
    // Format text with bullet points and line breaks for readability
    const lines = text.split('\n').filter(line => line.trim())
    return lines.map(line => {
      const trimmed = line.trim()
      if (trimmed.startsWith(('•', '-', '*'))) {
        return trimmed
      }
      return `• ${trimmed}`
    }).join('\n')
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
      timestamp: new Date().toISOString(),
      upload_id: uploadId
    }
    setMessages(prev => [...prev, newUserMsg])

    try {
      // Add context about current concept if available
      const contextMessage = currentConcept 
        ? `${userMessage}\n\nContext: Currently studying "${currentConcept}"`
        : userMessage

      const response = await api.chatWithAI(userId, contextMessage, uploadId)
      
      if (response.response) {
        const formattedResponse = formatAsSummary(response.response)
        const aiMsg = {
          role: 'assistant',
          content: formattedResponse,
          timestamp: response.timestamp || new Date().toISOString(),
          upload_id: uploadId
        }
        setMessages(prev => [...prev, aiMsg])
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMsg = {
        role: 'assistant',
        content: '• Sorry, I encountered an error\n• Please try again',
        timestamp: new Date().toISOString(),
        upload_id: uploadId
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }

  const handleQuickQuestion = async (question) => {
    setInput(question)
    // Auto-send
    const fakeEvent = { preventDefault: () => {} }
    await handleSend(fakeEvent)
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="ai-sidebar-toggle"
        aria-label="Open AI Assistant"
      >
        <Sparkles size={20} />
      </button>
    )
  }

  return (
    <div className={`ai-chat-sidebar ${isMinimized ? 'minimized' : ''}`}>
      <div className="ai-sidebar-header">
        <div className="header-left">
          <Sparkles size={18} />
          <div>
            <h3>AI Assistant</h3>
            {currentConcept && (
              <p className="context-badge">Studying: {currentConcept}</p>
            )}
          </div>
        </div>
        <div className="header-actions">
          <button onClick={() => setIsMinimized(!isMinimized)} className="icon-btn">
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button onClick={() => setIsOpen(false)} className="icon-btn">
            <X size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="ai-sidebar-messages">
            {messages.length === 0 ? (
              <div className="empty-chat">
                <Bot size={32} />
                <p>Ask me anything about your studies!</p>
                <div className="quick-questions">
                  <button onClick={() => handleQuickQuestion('Explain this concept')}>
                    Explain this concept
                  </button>
                  <button onClick={() => handleQuickQuestion('Give me a summary')}>
                    Give me a summary
                  </button>
                  <button onClick={() => handleQuickQuestion('What should I focus on?')}>
                    What to focus on?
                  </button>
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`message ${msg.role}`}>
                  <div className="message-avatar">
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className="message-content">
                    <div className="message-text" style={{ whiteSpace: 'pre-line' }}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="message assistant">
                <div className="message-avatar">
                  <Bot size={16} />
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

          <form onSubmit={handleSend} className="ai-sidebar-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()}>
              <Send size={18} />
            </button>
          </form>
        </>
      )}

      <style>{`
        .ai-chat-sidebar {
          position: fixed;
          right: 0;
          top: 60px;
          width: 360px;
          height: calc(100vh - 60px);
          background: var(--color-bg-secondary);
          border-left: 2px solid var(--color-border);
          display: flex;
          flex-direction: column;
          z-index: 998;
          transition: transform 0.3s ease;
        }

        .ai-chat-sidebar.minimized {
          height: auto;
        }

        .ai-sidebar-toggle {
          position: fixed;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 48px;
          height: 80px;
          background: linear-gradient(135deg, var(--color-gradient-start) 0%, var(--color-gradient-end) 100%);
          border: none;
          border-radius: 12px 0 0 12px;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: -4px 0 12px rgba(0, 0, 0, 0.2);
          z-index: 997;
          transition: all 0.3s ease;
        }

        .ai-sidebar-toggle:hover {
          width: 56px;
          box-shadow: -6px 0 16px rgba(0, 0, 0, 0.3);
        }

        .ai-sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          border-bottom: 1px solid var(--color-border);
          background: linear-gradient(135deg, rgba(74, 144, 226, 0.15), rgba(80, 227, 194, 0.15));
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex: 1;
          min-width: 0;
        }

        .header-left svg {
          color: var(--color-primary);
          flex-shrink: 0;
        }

        .header-left h3 {
          font-size: 0.9375rem;
          font-weight: 700;
          margin: 0;
          color: var(--color-text-primary);
        }

        .context-badge {
          font-size: 0.75rem;
          color: var(--color-text-secondary);
          margin: 0.25rem 0 0 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .header-actions {
          display: flex;
          gap: 0.5rem;
        }

        .icon-btn {
          background: transparent;
          border: none;
          color: var(--color-text-secondary);
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: var(--color-text-primary);
        }

        .ai-sidebar-messages {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .empty-chat {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          text-align: center;
          color: var(--color-text-secondary);
        }

        .empty-chat svg {
          color: var(--color-primary);
          margin-bottom: 1rem;
        }

        .quick-questions {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-top: 1rem;
          width: 100%;
        }

        .quick-questions button {
          padding: 0.625rem 1rem;
          background: rgba(74, 144, 226, 0.1);
          border: 1px solid rgba(74, 144, 226, 0.3);
          border-radius: 8px;
          color: var(--color-text-primary);
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s ease;
          text-align: left;
        }

        .quick-questions button:hover {
          background: rgba(74, 144, 226, 0.2);
          border-color: var(--color-primary);
        }

        .message {
          display: flex;
          gap: 0.75rem;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .message.user {
          flex-direction: row-reverse;
        }

        .message-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .message.user .message-avatar {
          background: linear-gradient(135deg, var(--color-gradient-start), var(--color-gradient-end));
          color: white;
        }

        .message.assistant .message-avatar {
          background: rgba(74, 144, 226, 0.2);
          color: var(--color-primary);
        }

        .message-content {
          flex: 1;
          min-width: 0;
        }

        .message-text {
          padding: 0.75rem 1rem;
          border-radius: 12px;
          font-size: 0.875rem;
          line-height: 1.6;
          max-width: 85%;
        }

        .message.user .message-text {
          background: linear-gradient(135deg, var(--color-gradient-start) 0%, var(--color-gradient-end) 100%);
          color: white;
          margin-left: auto;
        }

        .message.assistant .message-text {
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          color: var(--color-text-primary);
        }

        .typing-indicator {
          display: flex;
          gap: 0.25rem;
          padding: 0.5rem 0;
        }

        .typing-indicator span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--color-primary);
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
            opacity: 0.5;
          }
          30% {
            transform: translateY(-8px);
            opacity: 1;
          }
        }

        .ai-sidebar-input {
          display: flex;
          gap: 0.5rem;
          padding: 1rem;
          border-top: 1px solid var(--color-border);
          background: var(--color-bg-secondary);
        }

        .ai-sidebar-input input {
          flex: 1;
          padding: 0.75rem 1rem;
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          color: var(--color-text-primary);
          font-size: 0.875rem;
        }

        .ai-sidebar-input input:focus {
          outline: none;
          border-color: var(--color-primary);
        }

        .ai-sidebar-input input::placeholder {
          color: var(--color-text-tertiary);
        }

        .ai-sidebar-input button {
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

        .ai-sidebar-input button:hover:not(:disabled) {
          transform: scale(1.05);
        }

        .ai-sidebar-input button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 1200px) {
          .ai-chat-sidebar {
            width: 320px;
          }
        }

        @media (max-width: 768px) {
          .ai-chat-sidebar {
            width: 100%;
            right: 0;
            left: 0;
            border-left: none;
            border-top: 2px solid var(--color-border);
            top: auto;
            bottom: 0;
            height: 50vh;
          }

          .ai-sidebar-toggle {
            right: 1rem;
            bottom: 1rem;
            top: auto;
            transform: none;
            width: 56px;
            height: 56px;
            border-radius: 50%;
          }
        }
      `}</style>
    </div>
  )
}

