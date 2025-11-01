import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { colors, typography, spacing, borderRadius, shadows } from '../styles/design-system'

export default function AdaptiveLearningPage() {
  const [userId] = useState('user_' + Date.now())
  const [feedItems, setFeedItems] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [swipeDirection, setSwipeDirection] = useState(null)
  const [showQuizAnswer, setShowQuizAnswer] = useState(false)
  const [progress, setProgress] = useState(null)

  useEffect(() => {
    loadFeed()
    loadProgress()
  }, [])

  const loadFeed = async () => {
    try {
      setLoading(true)
      setError(null)
      const feed = await api.getFeed(userId, 20)
      
      if (!feed || feed.length === 0) {
        setError('no_content')
      } else {
        setFeedItems(feed)
      }
    } catch (err) {
      console.error('Error loading feed:', err)
      setError(err.message || 'Failed to load content')
    } finally {
      setLoading(false)
    }
  }

  const loadProgress = async () => {
    try {
      const userProgress = await api.getProgress(userId)
      setProgress(userProgress)
    } catch (err) {
      console.error('Error loading progress:', err)
    }
  }

  const handleSwipe = async () => {
    const currentItem = feedItems[currentIndex]
    
    if (currentItem?.type === 'quiz' && !showQuizAnswer) {
      alert('Please answer the question first!')
      return
    }

    setSwipeDirection('up')
    await new Promise(resolve => setTimeout(resolve, 300))
    
    setSwipeDirection(null)
    setShowQuizAnswer(false)
    
    if (currentIndex < feedItems.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      await loadFeed()
      setCurrentIndex(0)
    }
    
    if (currentItem?.type === 'quiz') {
      loadProgress()
    }
  }

  const handleQuizAnswer = async (isCorrect) => {
    const currentItem = feedItems[currentIndex]
    
    try {
      await api.submitAnswer(
        userId,
        currentItem.content.question_id,
        isCorrect
      )
      
      setShowQuizAnswer(true)
      setTimeout(() => handleSwipe(), 2000)
    } catch (err) {
      console.error('Error submitting answer:', err)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.centerContent}>
          <div style={styles.loadingSpinner}></div>
          <p style={styles.loadingText}>Preparing your personalized learning...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error === 'no_content') {
    return (
      <div style={styles.container}>
        <div style={styles.centerContent}>
          <div style={styles.emptyIcon}>📚</div>
          <h2 style={styles.emptyTitle}>No Content Yet</h2>
          <p style={styles.emptyText}>
            Upload your notes to create personalized lessons and quizzes!
          </p>
          <button 
            style={styles.primaryButton}
            onClick={() => window.location.reload()}
          >
            Upload Notes
          </button>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.centerContent}>
          <div style={styles.errorIcon}>⚠️</div>
          <h2 style={styles.errorTitle}>Connection Error</h2>
          <p style={styles.errorText}>
            Couldn't connect to the server. Make sure the backend is running.
          </p>
          <button 
            style={styles.primaryButton}
            onClick={() => {
              setError(null)
              loadFeed()
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!feedItems || feedItems.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.centerContent}>
          <div style={styles.loadingSpinner}></div>
          <p style={styles.loadingText}>Loading content...</p>
        </div>
      </div>
    )
  }

  const currentItem = feedItems[currentIndex]
  if (!currentItem) {
    return (
      <div style={styles.container}>
        <div style={styles.centerContent}>
          <p style={styles.loadingText}>Loading...</p>
        </div>
      </div>
    )
  }

  const isLesson = currentItem.type === 'lesson'
  const isQuiz = currentItem.type === 'quiz'

  return (
    <div style={styles.container}>
      {/* Progress Header */}
      <div style={styles.header}>
        <div style={styles.progressInfo}>
          <span style={styles.progressLabel}>Level</span>
          <span style={styles.progressValue}>
            {progress ? Math.round((progress.overall_ability + 3) / 6 * 100) : 50}
          </span>
        </div>
        <div style={styles.progressBar}>
          <div 
            style={{
              ...styles.progressFill,
              width: `${(currentIndex / feedItems.length) * 100}%`
            }}
          />
        </div>
        <div style={styles.progressInfo}>
          <span style={styles.progressLabel}>Cards</span>
          <span style={styles.progressValue}>
            {currentIndex + 1}/{feedItems.length}
          </span>
        </div>
      </div>

      {/* Main Content Card */}
      <div style={styles.cardContainer}>
        <div 
          style={{
            ...styles.card,
            ...(swipeDirection === 'up' ? styles.cardSwipeUp : {}),
          }}
        >
          {/* Lesson Card */}
          {isLesson && (
            <>
              <div style={styles.difficultyBadge}>
                {currentItem.content.difficulty_zone === 'comfortable' && '✓ Comfortable (i+0)'}
                {currentItem.content.difficulty_zone === 'optimal' && '⚡ Optimal (i+1)'}
                {currentItem.content.difficulty_zone === 'stretch' && '🚀 Stretch (i+2)'}
              </div>

              <div style={styles.conceptTag}>
                {currentItem.content.concept_name}
              </div>

              <h2 style={styles.lessonTitle}>
                {currentItem.content.title}
              </h2>

              <div style={styles.lessonContent}>
                {currentItem.content.content}
              </div>

              <div style={styles.swipeHint}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.text.muted} strokeWidth="2">
                  <path d="M12 5v14M5 12l7 7 7-7"/>
                </svg>
                <span>Swipe up or click Next</span>
              </div>
            </>
          )}

          {/* Quiz Card */}
          {isQuiz && (
            <>
              <div style={styles.quizBadge}>
                📝 Quick Check
              </div>

              <div style={styles.conceptTag}>
                {currentItem.content.concept_name}
              </div>

              <h2 style={styles.questionText}>
                {currentItem.content.question}
              </h2>

              {!showQuizAnswer ? (
                <div style={styles.answerButtons}>
                  <button
                    style={{...styles.answerButton, ...styles.answerButtonKnow}}
                    onClick={() => handleQuizAnswer(true)}
                  >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span>I know this!</span>
                  </button>

                  <button
                    style={{...styles.answerButton, ...styles.answerButtonDont}}
                    onClick={() => handleQuizAnswer(false)}
                  >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M8 15h8M9 9h.01M15 9h.01"/>
                    </svg>
                    <span>Not sure</span>
                  </button>
                </div>
              ) : (
                <div style={styles.feedback}>
                  <div style={styles.feedbackIcon}>✓</div>
                  <p style={styles.feedbackText}>
                    Great! Moving to next concept...
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Stats Footer */}
      <div style={styles.footer}>
        <div style={styles.stat}>
          <div style={styles.statValue}>
            {progress?.questions_answered || 0}
          </div>
          <div style={styles.statLabel}>Questions</div>
        </div>
        <div style={styles.stat}>
          <div style={styles.statValue}>
            {progress?.lessons_viewed || 0}
          </div>
          <div style={styles.statLabel}>Lessons</div>
        </div>
        <div style={styles.stat}>
          <div style={styles.statValue}>
            {Object.keys(progress?.concept_mastery || {}).length}
          </div>
          <div style={styles.statLabel}>Concepts</div>
        </div>
      </div>

      {/* Next Button */}
      <button 
        style={styles.navButton}
        onClick={handleSwipe}
      >
        Next →
      </button>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: colors.gradients.main,
    color: colors.text.primary,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
  },
  
  centerContent: {
    margin: 'auto',
    textAlign: 'center',
    padding: spacing.xl,
    maxWidth: '500px',
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    background: 'rgba(27, 40, 56, 0.8)',
    backdropFilter: 'blur(10px)',
  },

  progressInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: '60px',
  },

  progressLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.muted,
    textTransform: 'uppercase',
  },

  progressValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.accent.cyan,
  },

  progressBar: {
    flex: 1,
    height: '8px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    background: colors.accent.cyanGradient,
    transition: 'width 0.3s ease',
  },

  cardContainer: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },

  card: {
    width: '100%',
    maxWidth: '500px',
    minHeight: '450px',
    background: colors.background.cardGradient,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    boxShadow: shadows.lg,
    border: `1px solid rgba(255, 255, 255, 0.1)`,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    transition: 'transform 0.3s ease, opacity 0.3s ease',
  },

  cardSwipeUp: {
    transform: 'translateY(-150vh)',
    opacity: 0,
  },

  difficultyBadge: {
    alignSelf: 'flex-start',
    background: colors.accent.cyanGradient,
    color: 'white',
    padding: `${spacing.sm} ${spacing.md}`,
    borderRadius: borderRadius.full,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.md,
  },

  quizBadge: {
    alignSelf: 'flex-start',
    background: colors.accent.purpleGradient,
    color: 'white',
    padding: `${spacing.sm} ${spacing.md}`,
    borderRadius: borderRadius.full,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.md,
  },

  conceptTag: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },

  lessonTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.lg,
    lineHeight: 1.3,
  },

  lessonContent: {
    fontSize: typography.fontSize.base,
    lineHeight: 1.6,
    color: colors.text.secondary,
    flex: 1,
  },

  questionText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.xl,
    lineHeight: 1.4,
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    textAlign: 'center',
    justifyContent: 'center',
  },

  answerButtons: {
    display: 'flex',
    gap: spacing.md,
  },

  answerButton: {
    flex: 1,
    padding: spacing.lg,
    border: 'none',
    borderRadius: borderRadius.md,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacing.sm,
    cursor: 'pointer',
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    transition: 'transform 0.2s',
  },

  answerButtonKnow: {
    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    color: 'white',
  },

  answerButtonDont: {
    background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
    color: 'white',
  },

  feedback: {
    background: 'rgba(16, 185, 129, 0.1)',
    border: `2px solid ${colors.accent.cyan}`,
    borderRadius: borderRadius.md,
    padding: spacing.xl,
    textAlign: 'center',
  },

  feedbackIcon: {
    fontSize: '3rem',
    marginBottom: spacing.md,
  },

  feedbackText: {
    fontSize: typography.fontSize.lg,
    color: colors.text.primary,
  },

  swipeHint: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    color: colors.text.muted,
    fontSize: typography.fontSize.sm,
  },

  footer: {
    display: 'flex',
    justifyContent: 'space-around',
    padding: spacing.lg,
    background: 'rgba(27, 40, 56, 0.8)',
    backdropFilter: 'blur(10px)',
  },

  stat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },

  statValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.accent.cyan,
  },

  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.muted,
    textTransform: 'uppercase',
  },

  navButton: {
    position: 'fixed',
    bottom: '100px',
    right: spacing.xl,
    padding: `${spacing.md} ${spacing.xl}`,
    background: colors.accent.cyanGradient,
    color: 'white',
    border: 'none',
    borderRadius: borderRadius.full,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    cursor: 'pointer',
    boxShadow: shadows.glow,
  },

  loadingSpinner: {
    width: '4rem',
    height: '4rem',
    border: '4px solid transparent',
    borderTopColor: colors.accent.cyan,
    borderBottomColor: colors.accent.cyan,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 1rem',
  },

  loadingText: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.lg,
  },

  emptyIcon: {
    fontSize: '4rem',
    marginBottom: spacing.lg,
  },

  emptyTitle: {
    fontSize: typography.fontSize['3xl'],
    marginBottom: spacing.md,
    fontWeight: typography.fontWeight.bold,
  },

  emptyText: {
    fontSize: typography.fontSize.lg,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
    lineHeight: 1.6,
  },

  errorIcon: {
    fontSize: '4rem',
    marginBottom: spacing.lg,
  },

  errorTitle: {
    fontSize: typography.fontSize['3xl'],
    marginBottom: spacing.md,
    fontWeight: typography.fontWeight.bold,
    color: '#EF4444',
  },

  errorText: {
    fontSize: typography.fontSize.lg,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
    lineHeight: 1.6,
  },

  primaryButton: {
    padding: `${spacing.md} ${spacing.xl}`,
    background: colors.accent.cyanGradient,
    color: 'white',
    border: 'none',
    borderRadius: borderRadius.full,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    cursor: 'pointer',
    boxShadow: shadows.glow,
  },
}
