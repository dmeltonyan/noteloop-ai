import React, { useState, useEffect } from 'react'
import { api } from '../services/api'
import { Brain, CheckCircle, ArrowRight } from 'lucide-react'

export const LearningStyleQuestionnaire = ({ userId, onComplete }) => {
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [responses, setResponses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadQuestionnaire()
  }, [])

  const loadQuestionnaire = async () => {
    try {
      const data = await api.getLearningStyleQuestionnaire(userId)
      setQuestions(data.questions || [])
    } catch (error) {
      console.error('Failed to load questionnaire:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = (answerIndex) => {
    const question = questions[currentIndex]
    const newResponses = [...responses, {
      question_id: question.id,
      answer_index: answerIndex
    }]
    setResponses(newResponses)

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      submitAssessment(newResponses)
    }
  }

  const submitAssessment = async (finalResponses) => {
    try {
      const result = await api.assessLearningStyle(userId, finalResponses)
      if (onComplete) {
        onComplete(result.profile)
      }
    } catch (error) {
      console.error('Failed to assess learning style:', error)
    }
  }

  if (loading) {
    return (
      <div className="questionnaire-loading">
        <Brain className="spinner" size={48} />
        <p>Loading questionnaire...</p>
      </div>
    )
  }

  if (questions.length === 0) {
    return null
  }

  const currentQuestion = questions[currentIndex]
  const progress = ((currentIndex + 1) / questions.length) * 100

  return (
    <div className="learning-style-questionnaire">
      <div className="questionnaire-header">
        <Brain size={32} />
        <h2>Learning Style Assessment</h2>
        <p>Help us personalize your learning experience</p>
      </div>

      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${progress}%` }} />
        <span className="progress-text">{currentIndex + 1} of {questions.length}</span>
      </div>

      <div className="question-container">
        <h3>{currentQuestion.question}</h3>
        <div className="options-grid">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              className="option-button"
            >
              <span className="option-letter">{String.fromCharCode(65 + index)}</span>
              <span className="option-text">{option}</span>
              <ArrowRight size={20} className="option-arrow" />
            </button>
          ))}
        </div>
      </div>

      <style>{`
        .learning-style-questionnaire {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
          background: var(--color-card-bg);
          border-radius: 16px;
          border: 2px solid rgba(102, 126, 234, 0.3);
        }

        .questionnaire-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          gap: 1rem;
        }

        .spinner {
          animation: spin 1s linear infinite;
          color: #667eea;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .questionnaire-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .questionnaire-header svg {
          color: #667eea;
          margin-bottom: 1rem;
        }

        .questionnaire-header h2 {
          font-size: 1.75rem;
          font-weight: 800;
          margin: 0 0 0.5rem 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .questionnaire-header p {
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
        }

        .progress-bar-container {
          position: relative;
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          margin-bottom: 2rem;
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .progress-text {
          position: absolute;
          top: -24px;
          right: 0;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .question-container h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 2rem;
          color: var(--color-text-primary);
        }

        .options-grid {
          display: grid;
          gap: 1rem;
        }

        .option-button {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem 1.5rem;
          background: rgba(102, 126, 234, 0.1);
          border: 2px solid rgba(102, 126, 234, 0.3);
          border-radius: 12px;
          color: white;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
        }

        .option-button:hover {
          background: rgba(102, 126, 234, 0.2);
          border-color: #667eea;
          transform: translateX(8px);
        }

        .option-letter {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(102, 126, 234, 0.3);
          border-radius: 8px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .option-text {
          flex: 1;
        }

        .option-arrow {
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .option-button:hover .option-arrow {
          opacity: 1;
        }
      `}</style>
    </div>
  )
}


