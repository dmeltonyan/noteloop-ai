import React, { useState, useEffect } from 'react'
import { api } from '../services/api'
import { NavigationHeader } from '../components/NavigationHeader'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { RotateCcw, RotateCw, X, Check, Lightbulb, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'

export const FlashcardPage = () => {
  const [flashcards, setFlashcards] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ correct: 0, incorrect: 0 })
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const userId = 'demo_user_123'

  useEffect(() => {
    const uploadId = searchParams.get('upload_id') || localStorage.getItem('current_upload_id')
    loadFlashcards(uploadId)
  }, [searchParams])

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        handlePrevious()
      }
      if (e.key === 'ArrowRight' && currentIndex < flashcards.length - 1) {
        handleNext()
      }
      if (e.key === ' ') {
        e.preventDefault()
        handleFlip()
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentIndex, flashcards.length, isFlipped])

  const loadFlashcards = async (uploadId) => {
    try {
      setLoading(true)
      const result = await api.getFlashcards(userId, uploadId)
      if (result.flashcards) {
        setFlashcards(result.flashcards)
      }
    } catch (error) {
      console.error('Failed to load flashcards:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
    setShowHint(false)
  }

  const handleAnswer = (isCorrect) => {
    setStats(prev => ({
      ...prev,
      [isCorrect ? 'correct' : 'incorrect']: prev[isCorrect ? 'correct' : 'incorrect'] + 1
    }))
    
    if (currentIndex < flashcards.length - 1) {
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1)
        setIsFlipped(false)
        setShowHint(false)
      }, 300)
    }
  }

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
      setShowHint(false)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsFlipped(false)
      setShowHint(false)
    }
  }

  if (loading) {
    return (
      <>
        <NavigationHeader />
        <div className="loading-container">
          <RefreshCw className="spinner" size={48} />
          <p>Loading flashcards...</p>
        </div>
      </>
    )
  }

  if (flashcards.length === 0) {
    return (
      <>
        <NavigationHeader />
        <div className="empty-flashcards">
          <h2>No Flashcards Available</h2>
          <p>Upload materials to generate flashcards</p>
          <button onClick={() => navigate('/')}>Upload Content</button>
        </div>
      </>
    )
  }

  const currentCard = flashcards[currentIndex]

  return (
    <>
      <NavigationHeader />
      <div className="flashcard-page">
        {/* Progress Bar */}
        <div className="flashcard-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
            />
          </div>
          <span className="progress-text">
            {currentIndex + 1} / {flashcards.length}
          </span>
        </div>

        {/* Stats */}
        <div className="flashcard-stats">
          <div className="stat-item correct">
            <Check size={18} />
            <span>{stats.correct}</span>
          </div>
          <div className="stat-item incorrect">
            <X size={18} />
            <span>{stats.incorrect}</span>
          </div>
        </div>

        {/* Card Container */}
        <div className="flashcard-container">
          <div 
            className={`flashcard ${isFlipped ? 'flipped' : ''}`}
            onClick={handleFlip}
          >
            <div className="card-front">
              <div className="card-header">
                <span className="card-label">Question</span>
                {currentCard.concept_name && (
                  <span className="concept-badge">{currentCard.concept_name}</span>
                )}
              </div>
              <div className="card-content">
                <h2>{currentCard.front}</h2>
                {currentCard.options && (
                  <div className="card-options">
                    {currentCard.options.map((opt, idx) => (
                      <div key={idx} className="option-preview">{opt}</div>
                    ))}
                  </div>
                )}
              </div>
              <div className="card-footer">
                <span className="hint-text">Click to flip</span>
              </div>
            </div>

            <div className="card-back">
              <div className="card-header">
                <span className="card-label">Answer</span>
              </div>
              <div className="card-content">
                <p>{currentCard.back}</p>
                {showHint && currentCard.hint && (
                  <div className="hint-section">
                    <Lightbulb size={18} />
                    <span>Hint: {currentCard.hint}</span>
                  </div>
                )}
              </div>
              <div className="card-footer">
                <div className="answer-buttons">
                  <button 
                    className="answer-btn incorrect"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAnswer(false)
                    }}
                  >
                    <X size={20} />
                    <span>Don't Know</span>
                  </button>
                  <button 
                    className="answer-btn correct"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAnswer(true)
                    }}
                  >
                    <Check size={20} />
                    <span>Know It</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flashcard-controls">
          <button 
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="control-btn"
          >
            <ChevronLeft size={20} />
            <span>Previous</span>
          </button>

          <button 
            onClick={handleFlip}
            className="control-btn flip-btn"
          >
            <RotateCw size={20} />
            <span>{isFlipped ? 'Show Question' : 'Show Answer'}</span>
          </button>

          {currentCard.hint && (
            <button 
              onClick={() => setShowHint(!showHint)}
              className="control-btn hint-btn"
            >
              <Lightbulb size={20} />
              <span>Hint</span>
            </button>
          )}

          <button 
            onClick={handleNext}
            disabled={currentIndex >= flashcards.length - 1}
            className="control-btn"
          >
            <span>Next</span>
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="shortcuts-hint">
          <kbd>Space</kbd> Flip • <kbd>←</kbd> Previous • <kbd>→</kbd> Next
        </div>
      </div>

      <style>{`
        .flashcard-page {
          min-height: 100vh;
          padding: 100px 2rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          background: var(--color-bg-primary);
          position: relative;
        }

        .loading-container, .empty-flashcards {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding-top: 80px;
        }

        .spinner {
          animation: spin 1s linear infinite;
          color: #667eea;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .empty-flashcards button {
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .flashcard-progress {
          width: 100%;
          max-width: 800px;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .progress-bar {
          flex: 1;
          height: 6px;
          background: rgba(255,255,255,0.1);
          border-radius: 8px;
          overflow: hidden;
          position: relative;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #4A90E2 0%, #50E3C2 100%);
          transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(74, 144, 226, 0.5);
        }

        .progress-text {
          color: var(--color-text-secondary);
          font-size: 0.875rem;
          font-weight: 600;
          min-width: 60px;
          text-align: right;
        }

        .flashcard-stats {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 2rem;
          width: 100%;
          max-width: 800px;
          justify-content: flex-end;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.9375rem;
          transition: all 0.3s ease;
        }

        .stat-item.correct {
          background: rgba(80, 227, 194, 0.15);
          color: #50E3C2;
          border: 1px solid rgba(80, 227, 194, 0.3);
        }

        .stat-item.correct:hover {
          background: rgba(80, 227, 194, 0.25);
          transform: translateY(-2px);
        }

        .stat-item.incorrect {
          background: rgba(255, 107, 107, 0.15);
          color: #FF6B6B;
          border: 1px solid rgba(255, 107, 107, 0.3);
        }

        .stat-item.incorrect:hover {
          background: rgba(255, 107, 107, 0.25);
          transform: translateY(-2px);
        }

        .flashcard-container {
          perspective: 1200px;
          width: 100%;
          max-width: 800px;
          height: 500px;
          margin-bottom: 2rem;
        }

        .flashcard {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }

        .flashcard.flipped {
          transform: rotateY(180deg);
        }

        .card-front, .card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          background: linear-gradient(135deg, rgba(26, 29, 43, 0.95) 0%, rgba(37, 40, 56, 0.95) 100%);
          border: 2px solid rgba(74, 144, 226, 0.3);
          border-radius: 20px;
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          box-shadow: 0 12px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05);
          transition: all 0.3s ease;
        }

        .flashcard:hover .card-front,
        .flashcard:hover .card-back {
          border-color: rgba(74, 144, 226, 0.5);
          box-shadow: 0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1);
        }

        .card-back {
          transform: rotateY(180deg);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .card-label {
          font-size: 0.75rem;
          color: var(--color-text-tertiary);
          text-transform: uppercase;
          letter-spacing: 2px;
          font-weight: 700;
        }

        .concept-badge {
          background: linear-gradient(135deg, rgba(74, 144, 226, 0.2) 0%, rgba(80, 227, 194, 0.2) 100%);
          border: 1px solid rgba(74, 144, 226, 0.4);
          border-radius: 10px;
          padding: 0.375rem 1rem;
          font-size: 0.8125rem;
          color: #50E3C2;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .card-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .card-content h2 {
          font-size: 1.75rem;
          font-weight: 800;
          margin: 0 0 1.5rem 0;
          color: var(--color-text-primary);
          line-height: 1.3;
        }

        .card-content p {
          font-size: 1.25rem;
          color: var(--color-text-secondary);
          line-height: 1.7;
          margin: 0;
        }

        .card-options {
          margin-top: 1.5rem;
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.75rem;
        }

        .option-preview {
          padding: 1rem 1.25rem;
          background: rgba(255,255,255,0.05);
          border: 2px solid rgba(74, 144, 226, 0.2);
          border-radius: 12px;
          font-size: 1rem;
          color: var(--color-text-secondary);
          text-align: left;
          transition: all 0.3s ease;
          font-family: 'Courier New', monospace;
          position: relative;
          padding-left: 2.5rem;
        }

        .option-preview::before {
          content: counter(option-counter, upper-alpha) '.';
          counter-increment: option-counter;
          position: absolute;
          left: 1rem;
          color: #4A90E2;
          font-weight: 700;
          font-size: 1rem;
        }

        .card-content {
          counter-reset: option-counter;
        }

        .option-preview:hover {
          background: rgba(74, 144, 226, 0.1);
          border-color: rgba(74, 144, 226, 0.4);
          transform: translateX(4px);
        }

        .hint-section {
          margin-top: 1.5rem;
          padding: 1rem 1.25rem;
          background: rgba(255, 217, 61, 0.1);
          border: 1px solid rgba(255, 217, 61, 0.3);
          border-radius: 12px;
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          color: #FFD93D;
        }

        .hint-section svg {
          flex-shrink: 0;
          margin-top: 0.125rem;
        }

        .card-footer {
          margin-top: auto;
        }

        .hint-text {
          color: rgba(255,255,255,0.5);
          font-size: 0.875rem;
        }

        .answer-buttons {
          display: flex;
          gap: 1rem;
        }

        .answer-btn {
          flex: 1;
          padding: 1rem 1.5rem;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .answer-btn.correct {
          background: linear-gradient(135deg, #50E3C2 0%, #4A90E2 100%);
          color: var(--color-bg-primary);
          box-shadow: 0 4px 16px rgba(80, 227, 194, 0.3);
        }

        .answer-btn.correct:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(80, 227, 194, 0.5);
        }

        .answer-btn.correct:active {
          transform: translateY(-1px);
        }

        .answer-btn.incorrect {
          background: rgba(255, 107, 107, 0.15);
          color: #FF6B6B;
          border: 2px solid rgba(255, 107, 107, 0.4);
        }

        .answer-btn.incorrect:hover {
          background: rgba(255, 107, 107, 0.25);
          border-color: #FF6B6B;
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(255, 107, 107, 0.3);
        }

        .flashcard-controls {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .control-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 1.5rem;
          background: rgba(255,255,255,0.08);
          border: 2px solid rgba(74, 144, 226, 0.2);
          border-radius: 12px;
          color: var(--color-text-secondary);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .control-btn:hover:not(:disabled) {
          background: rgba(74, 144, 226, 0.15);
          border-color: rgba(74, 144, 226, 0.5);
          color: var(--color-text-primary);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(74, 144, 226, 0.2);
        }

        .control-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          border-color: rgba(255,255,255,0.1);
        }

        .flip-btn {
          background: linear-gradient(135deg, #4A90E2 0%, #50E3C2 100%);
          border-color: transparent;
          color: var(--color-bg-primary);
          box-shadow: 0 4px 16px rgba(74, 144, 226, 0.3);
        }

        .flip-btn:hover:not(:disabled) {
          box-shadow: 0 6px 20px rgba(74, 144, 226, 0.4);
        }

        .hint-btn {
          background: rgba(255, 217, 61, 0.15);
          border-color: rgba(255, 217, 61, 0.4);
          color: #FFD93D;
        }

        .hint-btn:hover:not(:disabled) {
          background: rgba(255, 217, 61, 0.25);
          border-color: #FFD93D;
          box-shadow: 0 4px 12px rgba(255, 217, 61, 0.3);
        }

        .shortcuts-hint {
          margin-top: 1.5rem;
          color: rgba(255,255,255,0.5);
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .shortcuts-hint kbd {
          background: rgba(74, 144, 226, 0.2);
          border: 1px solid rgba(74, 144, 226, 0.4);
          border-radius: 6px;
          padding: 0.25rem 0.625rem;
          font-family: 'Courier New', monospace;
          font-size: 0.8125rem;
          font-weight: 700;
          color: #4A90E2;
        }

        @media (max-width: 768px) {
          .flashcard-page {
            padding: 80px 1rem 1rem;
          }

          .flashcard-progress {
            flex-direction: column;
            align-items: stretch;
            gap: 0.5rem;
          }

          .progress-text {
            text-align: left;
            min-width: auto;
          }

          .flashcard-stats {
            justify-content: center;
          }

          .flashcard-container {
            height: 450px;
          }

          .card-front, .card-back {
            padding: 1.5rem;
          }

          .card-content h2 {
            font-size: 1.375rem;
          }

          .card-content p {
            font-size: 1.125rem;
          }

          .option-preview {
            font-size: 0.9375rem;
            padding: 0.875rem 1rem;
            padding-left: 2rem;
          }

          .answer-buttons {
            flex-direction: column;
          }

          .flashcard-controls {
            flex-direction: column;
          }

          .control-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </>
  )
}



