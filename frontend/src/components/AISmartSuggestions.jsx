import React, { useState, useEffect } from 'react'
import { Sparkles, Lightbulb, TrendingUp, Target, BookOpen, Zap, Loader } from 'lucide-react'

export const AISmartSuggestions = ({ userId, userStats, onSuggestionClick }) => {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    generateSuggestions()
  }, [userStats])

  const generateSuggestions = async () => {
    setLoading(true)
    
    // Simulate AI-powered suggestions based on user stats
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const newSuggestions = []
    
    if (userStats) {
      const accuracy = userStats.accuracy || 0
      const conceptsMastered = userStats.concepts_learned || 0
      const totalQuestions = userStats.total_questions || 0

      if (accuracy < 70 && totalQuestions > 0) {
        newSuggestions.push({
          id: 'review-weak',
          icon: Target,
          title: 'Focus on Weak Areas',
          description: `Your accuracy is ${accuracy}%. Review concepts you're struggling with.`,
          action: 'Go to Practice Mode',
          color: 'warning'
        })
      }

      if (conceptsMastered >= 5 && conceptsMastered < 20) {
        newSuggestions.push({
          id: 'master-more',
          icon: TrendingUp,
          title: 'Keep the Momentum!',
          description: `You've mastered ${conceptsMastered} concepts. Aim for 20!`,
          action: 'Continue Learning',
          color: 'success'
        })
      }

      if (totalQuestions === 0) {
        newSuggestions.push({
          id: 'get-started',
          icon: BookOpen,
          title: 'Start Your Learning Journey',
          description: 'Upload your first document to begin personalized learning.',
          action: 'Upload Document',
          color: 'primary'
        })
      }

      if (totalQuestions > 10 && accuracy > 80) {
        newSuggestions.push({
          id: 'challenge-mode',
          icon: Zap,
          title: 'Ready for a Challenge?',
          description: 'You\'re doing great! Try harder questions to push yourself.',
          action: 'Try Challenge Mode',
          color: 'accent'
        })
      }
    }

    // Default suggestions if no stats
    if (newSuggestions.length === 0) {
      newSuggestions.push({
        id: 'explore',
        icon: Sparkles,
        title: 'Explore AI Features',
        description: 'Discover all the AI-powered learning tools available.',
        action: 'Explore Features',
        color: 'primary'
      })
    }

    setSuggestions(newSuggestions)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="ai-suggestions-loading">
        <Loader className="suggestions-spinner" size={24} />
        <span>AI is analyzing your progress...</span>
      </div>
    )
  }

  return (
    <div className="ai-smart-suggestions">
      <div className="suggestions-list">
        {suggestions.map((suggestion) => {
          const Icon = suggestion.icon
          return (
            <div
              key={suggestion.id}
              className={`suggestion-card suggestion-${suggestion.color}`}
              onClick={() => onSuggestionClick?.(suggestion)}
            >
              <div className="suggestion-icon">
                <Icon size={24} />
              </div>
              <div className="suggestion-content">
                <h4>{suggestion.title}</h4>
                <p>{suggestion.description}</p>
                <button className="suggestion-action">
                  {suggestion.action} →
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <style>{`
        .ai-smart-suggestions {
          animation: fadeInUp 0.5s ease;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }


        .suggestions-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .suggestion-card {
          display: flex;
          gap: 1rem;
          padding: 1.25rem;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }

        .suggestion-card:hover {
          transform: translateX(4px);
          box-shadow: var(--shadow-md);
        }

        .suggestion-primary {
          background: rgba(74, 144, 226, 0.1);
          border-color: rgba(74, 144, 226, 0.3);
        }

        .suggestion-success {
          background: rgba(80, 227, 194, 0.1);
          border-color: rgba(80, 227, 194, 0.3);
        }

        .suggestion-warning {
          background: rgba(255, 217, 61, 0.1);
          border-color: rgba(255, 217, 61, 0.3);
        }

        .suggestion-accent {
          background: rgba(80, 227, 194, 0.1);
          border-color: rgba(80, 227, 194, 0.3);
        }

        .suggestion-icon {
          flex-shrink: 0;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-md);
          background: rgba(255, 255, 255, 0.05);
        }

        .suggestion-primary .suggestion-icon {
          color: #4A90E2;
        }

        .suggestion-success .suggestion-icon {
          color: #50E3C2;
        }

        .suggestion-warning .suggestion-icon {
          color: #FFD93D;
        }

        .suggestion-accent .suggestion-icon {
          color: #50E3C2;
        }

        .suggestion-content {
          flex: 1;
        }

        .suggestion-content h4 {
          font-size: 1rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0 0 0.5rem 0;
        }

        .suggestion-content p {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
          margin: 0 0 0.75rem 0;
          line-height: 1.5;
        }

        .suggestion-action {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: var(--radius-sm);
          color: var(--color-text-primary);
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .suggestion-action:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateX(2px);
        }

        .ai-suggestions-loading {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 2rem;
          justify-content: center;
          color: var(--color-text-secondary);
        }

        .suggestions-spinner {
          animation: spin 1s linear infinite;
          color: #4A90E2;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .ai-smart-suggestions {
            padding: 1rem;
          }

          .suggestion-card {
            flex-direction: column;
            text-align: center;
          }

          .suggestion-icon {
            margin: 0 auto;
          }
        }
      `}</style>
    </div>
  )
}

