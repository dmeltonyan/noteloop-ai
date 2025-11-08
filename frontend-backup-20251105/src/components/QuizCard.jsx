import { useState } from 'react'
import { api } from '../services/api'
import { useUser } from '../contexts/UserContext'
import { colors, typography, spacing, borderRadius, shadows } from '../styles/design-system'

export default function QuizCard({ quiz, conceptName, difficultyZone, onNext }) {
  const { userId, refreshProgress } = useUser()
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [result, setResult] = useState(null)

  const handleSelectAnswer = async (answer) => {
    if (showResult) return

    setSelectedAnswer(answer)
    
    try {
      const response = await api.submitQuizAnswer(userId, quiz.quiz_id, answer)
      setResult(response)
      setShowResult(true)
      
      // Refresh user progress
      setTimeout(() => {
        refreshProgress()
      }, 500)
      
      // Auto-advance after showing result
      setTimeout(() => {
        onNext()
      }, 2500)
    } catch (error) {
      console.error('Error submitting answer:', error)
    }
  }

  const getZoneColor = () => {
    if (difficultyZone === 'comfortable') return colors.zones.comfortable.border
    if (difficultyZone === 'optimal') return colors.zones.optimal.border
    return colors.zones.stretch.border
  }

  const getZoneLabel = () => {
    if (difficultyZone === 'comfortable') return '✓ Comfortable (i+0)'
    if (difficultyZone === 'optimal') return '⚡ Optimal (i+1)'
    return '🚀 Stretch (i+2)'
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={{...styles.zoneBadge, borderColor: getZoneColor(), color: getZoneColor()}}>
          {getZoneLabel()}
        </div>
        <div style={styles.quizBadge}>
          📝 Quick Check
        </div>
      </div>

      {/* Concept Tag */}
      <div style={styles.conceptTag}>{conceptName}</div>

      {/* Question */}
      <h2 style={styles.question}>{quiz.question}</h2>

      {/* Options */}
      <div style={styles.optionsContainer}>
        {quiz.options.map((option, index) => {
          const isSelected = selectedAnswer === option
          const isCorrect = showResult && option === result?.correct_answer
          const isWrong = showResult && isSelected && !result?.is_correct
          
          return (
            <button
              key={index}
              style={{
                ...styles.option,
                ...(isSelected && !showResult ? styles.optionSelected : {}),
                ...(isCorrect ? styles.optionCorrect : {}),
                ...(isWrong ? styles.optionWrong : {}),
              }}
              onClick={() => handleSelectAnswer(option)}
              disabled={showResult}
            >
              <span style={styles.optionLetter}>
                {String.fromCharCode(65 + index)}
              </span>
              <span style={styles.optionText}>{option}</span>
              {isCorrect && <span style={styles.checkmark}>✓</span>}
              {isWrong && <span style={styles.xmark}>✗</span>}
            </button>
          )
        })}
      </div>

      {/* Result Explanation */}
      {showResult && (
        <div style={result.is_correct ? styles.resultCorrect : styles.resultWrong}>
          <div style={styles.resultIcon}>
            {result.is_correct ? '🎉' : '📚'}
          </div>
          <p style={styles.resultTitle}>
            {result.is_correct ? 'Correct!' : 'Not quite!'}
          </p>
          <p style={styles.resultExplanation}>{result.explanation}</p>
          
          {result.concept_mastery !== undefined && (
            <div style={styles.masteryBar}>
              <div style={styles.masteryLabel}>Concept Mastery:</div>
              <div style={styles.masteryProgress}>
                <div 
                  style={{
                    ...styles.masteryFill,
                    width: `${result.concept_mastery * 100}%`
                  }}
                />
              </div>
              <div style={styles.masteryValue}>
                {Math.round(result.concept_mastery * 100)}%
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    width: '100%',
    height: '100%',
    padding: spacing.xl,
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
  
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  
  zoneBadge: {
    padding: `${spacing.sm} ${spacing.md}`,
    border: '2px solid',
    borderRadius: borderRadius.full,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    textTransform: 'uppercase',
  },
  
  quizBadge: {
    padding: `${spacing.sm} ${spacing.md}`,
    background: colors.gradients.purple,
    color: 'white',
    borderRadius: borderRadius.full,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    boxShadow: shadows.glowPurple,
  },
  
  conceptTag: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  
  question: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xl,
    lineHeight: typography.lineHeight.normal,
    color: colors.text.primary,
  },
  
  optionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  
  option: {
    width: '100%',
    padding: spacing.lg,
    background: 'rgba(255, 255, 255, 0.05)',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.lg,
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'left',
  },
  
  optionSelected: {
    background: 'rgba(23, 212, 214, 0.1)',
    borderColor: colors.accent.cyan,
  },
  
  optionCorrect: {
    background: 'rgba(16, 185, 129, 0.15)',
    borderColor: colors.accent.green,
  },
  
  optionWrong: {
    background: 'rgba(239, 68, 68, 0.15)',
    borderColor: colors.accent.red,
  },
  
  optionLetter: {
    width: '32px',
    height: '32px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.full,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    flexShrink: 0,
  },
  
  optionText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
  
  checkmark: {
    fontSize: typography.fontSize.xl,
    color: colors.accent.green,
  },
  
  xmark: {
    fontSize: typography.fontSize.xl,
    color: colors.accent.red,
  },
  
  resultCorrect: {
    padding: spacing.lg,
    background: 'rgba(16, 185, 129, 0.1)',
    border: `2px solid ${colors.accent.green}`,
    borderRadius: borderRadius.lg,
    textAlign: 'center',
  },
  
  resultWrong: {
    padding: spacing.lg,
    background: 'rgba(239, 68, 68, 0.1)',
    border: `2px solid ${colors.accent.red}`,
    borderRadius: borderRadius.lg,
    textAlign: 'center',
  },
  
  resultIcon: {
    fontSize: '3rem',
    marginBottom: spacing.md,
  },
  
  resultTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.sm,
    color: colors.text.primary,
  },
  
  resultExplanation: {
    fontSize: typography.fontSize.base,
    lineHeight: typography.lineHeight.relaxed,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  
  masteryBar: {
    marginTop: spacing.lg,
  },
  
  masteryLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.muted,
    marginBottom: spacing.sm,
  },
  
  masteryProgress: {
    width: '100%',
    height: '8px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  
  masteryFill: {
    height: '100%',
    background: colors.gradients.cyan,
    transition: 'width 0.5s ease',
  },
  
  masteryValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.accent.cyan,
    textAlign: 'right',
  },
}
