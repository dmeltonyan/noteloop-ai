import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, BookOpen, MessageSquare, ChevronRight, Lightbulb, TrendingUp, Clock, Award, AlertCircle, Sparkles, ThumbsUp, ThumbsDown, Bookmark, HelpCircle, ChevronDown, Eye, EyeOff } from 'lucide-react'
import { api } from '../services/api'

export const AdvancedQuizInterface = ({ 
  quiz, 
  sourceContent, 
  onAnswer, 
  conceptName,
  totalQuestions,
  currentQuestion,
  userStats,
  userId = 'demo_user_123',
  compactMode = false,
  minimalistMode = false,
  hideNavUntilReady = false,
  showHint = false,
  confidenceLevel = 50,
  difficultyLevel = 'medium',
  quickActions = {}
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [isCorrect, setIsCorrect] = useState(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [showSource, setShowSource] = useState(false)
  const [answerStartTime, setAnswerStartTime] = useState(Date.now())
  const [timeSpent, setTimeSpent] = useState(0)
  const [aiExplanation, setAiExplanation] = useState('')
  const [loadingExplanation, setLoadingExplanation] = useState(false)
  const [expandedExplanation, setExpandedExplanation] = useState(false)
  const [showConfidenceSlider, setShowConfidenceSlider] = useState(false)

  useEffect(() => {
    setSelectedAnswer(null)
    setIsCorrect(null)
    setShowExplanation(false)
    setShowSource(false)
    setAnswerStartTime(Date.now())
    setTimeSpent(0)
    setAiExplanation('')
    setExpandedExplanation(false)
    setShowConfidenceSlider(false)
  }, [quiz?.id])

  useEffect(() => {
    if (!selectedAnswer) {
      const timer = setInterval(() => {
        setTimeSpent(Math.floor((Date.now() - answerStartTime) / 1000))
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [selectedAnswer, answerStartTime])

  if (!quiz || !quiz.question || !quiz.options || !quiz.correct_answer) {
    return (
      <div className="quiz-error">
        <AlertCircle size={48} />
        <p>Unable to load quiz. Please try the next question.</p>
      </div>
    )
  }

  const handleAnswerSelect = (answer) => {
    if (selectedAnswer) return
    
    const correct = answer === quiz.correct_answer
    setSelectedAnswer(answer)
    setIsCorrect(correct)
    setShowExplanation(true)
    
    onAnswer?.(answer)
  }

  const getDifficultyBadge = () => {
    const difficulty = quiz.difficulty || difficultyLevel
    const level = typeof difficulty === 'number' 
      ? difficulty < 0.4 ? 'easy' : difficulty < 0.7 ? 'medium' : 'hard'
      : difficulty
    
    return (
      <span className={`difficulty-badge ${level}`}>
        {level === 'easy' ? 'Easy' : level === 'medium' ? 'Medium' : 'Hard'}
      </span>
    )
  }

  const getBiteSizedExplanation = () => {
    if (!quiz.explanation) return null
    const sentences = quiz.explanation.split('.').filter(s => s.trim())
    return sentences.slice(0, 2).join('.') + '.'
  }

  const fullExplanation = quiz.explanation || ''
  const biteSizedExplanation = getBiteSizedExplanation()

  return (
    <div className={`advanced-quiz-container ${compactMode ? 'compact' : ''} ${minimalistMode ? 'minimalist' : ''}`}>
      {/* Quick Action Buttons */}
      {!selectedAnswer && (
        <div className="quick-actions-bar">
          <button
            className="quick-action-btn"
            onClick={quickActions.onMarkAsKnown}
            title="Mark as Known"
          >
            <ThumbsUp size={18} />
            <span>Known</span>
          </button>
          <button
            className="quick-action-btn"
            onClick={quickActions.onTooEasy}
            title="Too Easy"
          >
            <ThumbsDown size={18} />
            <span>Too Easy</span>
          </button>
          <button
            className="quick-action-btn"
            onClick={quickActions.onReviewLater}
            title="Review Later"
          >
            <Bookmark size={18} />
            <span>Review Later</span>
          </button>
          <button
            className={`quick-action-btn ${showHint ? 'active' : ''}`}
            onClick={quickActions.onShowHint}
            title="Show Hint"
          >
            <HelpCircle size={18} />
            <span>Hint</span>
          </button>
        </div>
      )}

      {/* Main Quiz Area */}
      <div className="quiz-main">
        {/* Concept Tag with Difficulty */}
        {conceptName && (
          <div className="concept-tag-row">
            <div className="concept-tag">
              <BookOpen size={16} />
              <span>{conceptName}</span>
            </div>
            {getDifficultyBadge()}
          </div>
        )}

        {/* Question */}
        <div className="question-section">
          <h2 className="question-text">{quiz.question}</h2>
          
          {/* Hint Display */}
          {showHint && quiz.explanation && (
            <div className="hint-box">
              <HelpCircle size={18} />
              <span>{biteSizedExplanation || 'Think about the key concepts mentioned in the question.'}</span>
            </div>
          )}
        </div>

        {/* Answer Options */}
        <div className={`options-grid ${compactMode ? 'compact' : ''}`}>
          {quiz.options.map((option, index) => (
            <button
              key={index}
              className={`quiz-option-advanced ${getOptionStyle(option)}`}
              onClick={() => handleAnswerSelect(option)}
              disabled={!!selectedAnswer}
            >
              <div className="option-header">
                <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                {selectedAnswer === option && (
                  isCorrect ? <CheckCircle size={20} className="option-icon-correct" /> : <XCircle size={20} className="option-icon-incorrect" />
                )}
                {selectedAnswer && option === quiz.correct_answer && selectedAnswer !== option && (
                  <CheckCircle size={20} className="option-icon-correct" />
                )}
              </div>
              <div className="option-content">{option}</div>
            </button>
          ))}
        </div>

        {/* Source Material (Collapsible, Hidden by Default) */}
        {sourceContent && (
          <button 
            className="source-toggle" 
            onClick={() => setShowSource(!showSource)}
          >
            <BookOpen size={18} />
            <span>{showSource ? 'Hide' : 'Show'} Source Material</span>
            <ChevronDown size={18} className={showSource ? 'rotated' : ''} />
          </button>
        )}

        {showSource && sourceContent && (
          <div className="source-viewer">
            <div className="source-content">{sourceContent}</div>
          </div>
        )}
      </div>

      {/* Explanation Sidebar */}
      {showExplanation && (
        <div className="explanation-sidebar">
          <div className="explanation-header">
            {isCorrect ? (
              <div className="header-correct">
                <CheckCircle size={32} />
                <div>
                  <h3>Excellent!</h3>
                  <p>You got it right</p>
                </div>
              </div>
            ) : (
              <div className="header-incorrect">
                <XCircle size={32} />
                <div>
                  <h3>Not Quite</h3>
                  <p>Let's learn from this</p>
                </div>
              </div>
            )}
          </div>

          {/* Bite-sized Explanation */}
          {quiz.explanation && (
            <div className="explanation-section">
              <div className="section-header">
                <Lightbulb size={20} />
                <h4>Explanation</h4>
              </div>
              
              {!expandedExplanation && biteSizedExplanation ? (
                <div className="explanation-content">
                  <p>{biteSizedExplanation}</p>
                  <button 
                    className="expand-btn"
                    onClick={() => setExpandedExplanation(true)}
                  >
                    <ChevronDown size={16} />
                    <span>Show Full Explanation</span>
                  </button>
                </div>
              ) : (
                <div className="explanation-content">
                  {fullExplanation}
                </div>
              )}
            </div>
          )}

          {/* Key Takeaway */}
          <div className="takeaway-section">
            <div className="section-header">
              <TrendingUp size={20} />
              <h4>Key Takeaway</h4>
            </div>
            <div className="takeaway-content">
              {isCorrect 
                ? `You've demonstrated understanding of ${conceptName || 'this concept'}. Keep up the excellent work!`
                : `Focus on understanding ${conceptName || 'this concept'} more deeply. Review the source material to strengthen your knowledge.`
              }
            </div>
          </div>
        </div>
      )}

      <style>{`
        .advanced-quiz-container {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 2rem;
          animation: fadeIn 0.5s ease;
        }

        .advanced-quiz-container.compact {
          grid-template-columns: 1fr 350px;
          gap: 1.5rem;
        }

        .advanced-quiz-container.minimalist {
          grid-template-columns: 1fr;
        }

        .advanced-quiz-container.minimalist .explanation-sidebar {
          margin-top: 2rem;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .quick-actions-bar {
          grid-column: 1 / -1;
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1rem;
          padding: 0.75rem;
          background: var(--color-bg-card);
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border);
        }

        .quick-action-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          color: var(--color-text-secondary);
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .quick-action-btn:hover {
          background: var(--color-button-hover);
          border-color: var(--color-border-hover);
          color: var(--color-text-primary);
        }

        .quick-action-btn.active {
          background: linear-gradient(135deg, var(--color-gradient-start) 0%, var(--color-gradient-end) 100%);
          border-color: transparent;
          color: white;
        }

        .quiz-main {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .concept-tag-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .concept-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(74, 144, 226, 0.15);
          border: 1px solid rgba(74, 144, 226, 0.3);
          border-radius: var(--radius-full);
          color: var(--color-primary);
          font-size: 0.875rem;
          font-weight: 600;
          width: fit-content;
        }

        .difficulty-badge {
          padding: 0.375rem 0.75rem;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .difficulty-badge.easy {
          background: rgba(80, 227, 194, 0.2);
          color: var(--color-success);
          border: 1px solid rgba(80, 227, 194, 0.3);
        }

        .difficulty-badge.medium {
          background: rgba(255, 217, 61, 0.2);
          color: #FFD93D;
          border: 1px solid rgba(255, 217, 61, 0.3);
        }

        .difficulty-badge.hard {
          background: rgba(255, 107, 107, 0.2);
          color: var(--color-error);
          border: 1px solid rgba(255, 107, 107, 0.3);
        }

        .question-section {
          background: var(--color-bg-card);
          border-radius: var(--radius-lg);
          padding: ${compactMode ? '1.5rem' : '2rem'};
          border: 2px solid var(--color-border);
          margin-bottom: 1rem;
        }

        .question-text {
          font-size: ${compactMode ? '1rem' : '1.125rem'};
          font-weight: 500;
          line-height: 1.6;
          color: var(--color-text-primary);
          margin: 0 0 1.5rem 0;
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Courier New', monospace;
          letter-spacing: -0.01em;
        }

        .hint-box {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          margin-top: 1rem;
          padding: 1rem;
          background: rgba(255, 217, 61, 0.1);
          border: 1px solid rgba(255, 217, 61, 0.3);
          border-radius: var(--radius-md);
          color: var(--color-text-primary);
          font-size: 0.9375rem;
        }

        .hint-box svg {
          color: #FFD93D;
          flex-shrink: 0;
          margin-top: 0.125rem;
        }

        .options-grid {
          display: grid;
          gap: 1rem;
        }

        .options-grid.compact {
          gap: 0.75rem;
        }

        .quiz-option-advanced {
          padding: ${compactMode ? '1rem' : '1.5rem'};
          background: var(--color-bg-card);
          border: 2px solid var(--color-border);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
        }

        .quiz-option-advanced:hover:not(:disabled) {
          background: var(--color-button-hover);
          border-color: var(--color-border-hover);
          transform: translateX(4px);
        }

        .option-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }

        .option-letter {
          width: ${compactMode ? '32px' : '40px'};
          height: ${compactMode ? '32px' : '40px'};
          background: var(--color-bg-secondary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: ${compactMode ? '1rem' : '1.125rem'};
          color: var(--color-text-primary);
        }

        .option-content {
          font-size: ${compactMode ? '1rem' : '1.125rem'};
          font-weight: 500;
          color: var(--color-text-primary);
          line-height: 1.6;
        }

        .quiz-option-advanced.option-correct {
          background: linear-gradient(135deg, rgba(80, 227, 194, 0.2) 0%, rgba(80, 227, 194, 0.1) 100%) !important;
          border-color: var(--color-success) !important;
          animation: correctPulse 0.6s ease;
        }

        .quiz-option-advanced.option-incorrect {
          background: linear-gradient(135deg, rgba(255, 107, 107, 0.2) 0%, rgba(255, 107, 107, 0.1) 100%) !important;
          border-color: var(--color-error) !important;
          animation: shake 0.5s ease;
        }

        .quiz-option-advanced.option-disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .option-icon-correct {
          color: var(--color-success);
          margin-left: auto;
        }

        .option-icon-incorrect {
          color: var(--color-error);
          margin-left: auto;
        }

        @keyframes correctPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }

        .source-toggle {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem 1.25rem;
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          color: var(--color-text-secondary);
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .source-toggle:hover {
          background: var(--color-button-hover);
          border-color: var(--color-border-hover);
          color: var(--color-text-primary);
        }

        .source-toggle svg.rotated {
          transform: rotate(180deg);
        }

        .source-viewer {
          background: var(--color-bg-card);
          border-radius: var(--radius-md);
          padding: 1.5rem;
          border: 1px solid var(--color-border);
          animation: slideDown 0.3s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 400px;
          }
        }

        .source-content {
          font-size: 0.9375rem;
          line-height: 1.8;
          color: var(--color-text-secondary);
          max-height: 300px;
          overflow-y: auto;
          padding: 1rem;
          background: var(--color-bg-secondary);
          border-radius: var(--radius-sm);
        }

        .explanation-sidebar {
          background: var(--color-bg-card);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          border: 2px solid var(--color-border);
          overflow-y: auto;
          max-height: calc(100vh - 200px);
          animation: slideInRight 0.4s ease;
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .explanation-header {
          margin-bottom: 1.5rem;
        }

        .header-correct,
        .header-incorrect {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          border-radius: var(--radius-md);
        }

        .header-correct {
          background: linear-gradient(135deg, rgba(80, 227, 194, 0.2) 0%, rgba(80, 227, 194, 0.1) 100%);
          border: 2px solid var(--color-success);
        }

        .header-correct svg {
          color: var(--color-success);
        }

        .header-incorrect {
          background: linear-gradient(135deg, rgba(255, 107, 107, 0.2) 0%, rgba(255, 107, 107, 0.1) 100%);
          border: 2px solid var(--color-error);
        }

        .header-incorrect svg {
          color: var(--color-error);
        }

        .header-correct h3,
        .header-incorrect h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
          color: var(--color-text-primary);
        }

        .header-correct p,
        .header-incorrect p {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
        }

        .explanation-section,
        .takeaway-section {
          margin-bottom: 1.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--color-border);
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .section-header svg {
          color: var(--color-primary);
        }

        .section-header h4 {
          font-size: 1rem;
          font-weight: 700;
          color: var(--color-text-primary);
        }

        .explanation-content {
          font-size: 0.9375rem;
          line-height: 1.8;
          color: var(--color-text-secondary);
        }

        .expand-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 1rem;
          padding: 0.5rem 1rem;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          color: var(--color-text-secondary);
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .expand-btn:hover {
          background: var(--color-button-hover);
          border-color: var(--color-border-hover);
          color: var(--color-text-primary);
        }

        .takeaway-content {
          font-size: 0.9375rem;
          line-height: 1.8;
          color: var(--color-text-secondary);
        }

        .quiz-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          gap: 1rem;
          color: var(--color-error);
        }

        @media (max-width: 1200px) {
          .advanced-quiz-container {
            grid-template-columns: 1fr;
          }

          .explanation-sidebar {
            max-height: none;
          }
        }

        @media (max-width: 768px) {
          .question-text {
            font-size: 1.375rem;
          }

          .quick-actions-bar {
            flex-wrap: wrap;
          }

          .quick-action-btn span {
            display: none;
          }
        }
      `}</style>
    </div>
  )

  function getOptionStyle(option) {
    if (!selectedAnswer) return 'option-default'
    if (option === quiz.correct_answer) return 'option-correct'
    if (option === selectedAnswer && !isCorrect) return 'option-incorrect'
    return 'option-disabled'
  }
}
