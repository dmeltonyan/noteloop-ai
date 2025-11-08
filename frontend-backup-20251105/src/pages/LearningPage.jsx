import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { colors, typography, spacing, borderRadius, shadows } from '../styles/design-system'

export default function LearningPage() {
  const [userId] = useState('user_' + Date.now())
  const [feedItems, setFeedItems] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showQuizAnswer, setShowQuizAnswer] = useState(false)
  const [progress, setProgress] = useState(null)
  const [swipeAnimation, setSwipeAnimation] = useState(false)

  useEffect(() => {
    loadFeed()
    loadProgress()
  }, [])

  const loadFeed = async () => {
    try {
      const feed = await api.getFeed(userId, 20)
      setFeedItems(feed)
      setLoading(false)
    } catch (error) {
      console.error('Error loading feed:', error)
      setLoading(false)
    }
  }

  const loadProgress = async () => {
    try {
      const prog = await api.getProgress(userId)
      setProgress(prog)
    } catch (error) {
      console.error('Error loading progress:', error)
    }
  }

  const handleNext = async () => {
    const currentItem = feedItems[currentIndex]
    
    if (currentItem?.type === 'quiz' && !showQuizAnswer) {
      return
    }

    setSwipeAnimation(true)
    
    setTimeout(() => {
      if (currentIndex < feedItems.length - 1) {
        setCurrentIndex(currentIndex + 1)
      } else {
        loadFeed()
        setCurrentIndex(0)
      }
      setShowQuizAnswer(false)
      setSwipeAnimation(false)
    }, 300)
    
    if (currentItem?.type === 'quiz') {
      loadProgress()
    }
  }

  const handleQuizAnswer = async (isCorrect) => {
    const currentItem = feedItems[currentIndex]
    
    try {
      await api.submitAnswer(userId, currentItem.content.question_id, isCorrect)
      setShowQuizAnswer(true)
      setTimeout(() => handleNext(), 1500)
    } catch (error) {
      console.error('Error submitting answer:', error)
    }
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.centerContent}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Generating your personalized learning path...</p>
        </div>
      </div>
    )
  }

  if (!feedItems || feedItems.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.centerContent}>
          <div style={styles.emptyIcon}>📚</div>
          <h2 style={styles.emptyTitle}>No Content Available</h2>
          <p style={styles.emptyText}>Please check if the backend is running</p>
        </div>
      </div>
    )
  }

  const currentItem = feedItems[currentIndex]
  if (!currentItem) return null

  const isLesson = currentItem.type === 'lesson'
  const zone = currentItem.content?.difficulty_zone || 'optimal'

  return (
    <div style={styles.container}>
      {/* Header with Progress */}
      <div style={styles.header}>
        <div style={styles.levelBadge}>
          <span style={styles.levelText}>Level i+{Math.floor((progress?.overall_ability || 0) + 3)}</span>
        </div>
        
        <div style={styles.progressContainer}>
          <div style={styles.progressBar}>
            <div 
              style={{
                ...styles.progressFill,
                width: `${((currentIndex + 1) / feedItems.length) * 100}%`
              }}
            />
          </div>
          <span style={styles.progressText}>
            {currentIndex + 1} / {feedItems.length}
          </span>
        </div>
        
        <div style={styles.swipeHint}>Swipe to explore</div>
      </div>

      {/* Main Card Area */}
      <div style={styles.cardContainer}>
        <div 
          style={{
            ...styles.card,
            ...(swipeAnimation ? styles.cardSwipeOut : {}),
          }}
        >
          {/* Lesson Card */}
          {isLesson && (
            <>
              {/* Zone Badge */}
              <div style={{
                ...styles.zoneBadge,
                background: colors.zones[zone].background,
                border: `2px solid ${colors.zones[zone].border}`,
                color: colors.zones[zone].text,
              }}>
                {zone === 'comfortable' && '✓ Comfortable (i+0)'}
                {zone === 'optimal' && '⚡ Optimal (i+1)'}
                {zone === 'stretch' && '🚀 Stretch (i+2)'}
              </div>

              {/* Concept Tag */}
              <div style={styles.conceptTag}>
                {currentItem.content.concept_name}
              </div>

              {/* Visual Icon */}
              <div style={styles.visualContainer}>
                <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                  <circle cx="60" cy="60" r="50" stroke={colors.accent.cyan} strokeWidth="2" opacity="0.3" />
                  <circle cx="40" cy="60" r="30" stroke={colors.accent.cyan} strokeWidth="2" opacity="0.3" />
                  <circle cx="80" cy="60" r="30" stroke={colors.accent.cyan} strokeWidth="2" opacity="0.3" />
                </svg>
              </div>

              {/* Title & Content */}
              <h2 style={styles.lessonTitle}>
                {currentItem.content.title}
              </h2>

              <p style={styles.lessonContent}>
                {currentItem.content.content}
              </p>

              <div style={styles.tapHint}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.text.muted} strokeWidth="2">
                  <path d="M12 5v14M5 12l7 7 7-7"/>
                </svg>
                <span>Swipe up to continue</span>
              </div>
            </>
          )}

          {/* Quiz Card */}
          {!isLesson && (
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
                    style={styles.answerButtonKnow}
                    onClick={() => handleQuizAnswer(true)}
                  >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span>I got it!</span>
                  </button>

                  <button
                    style={styles.answerButtonDont}
                    onClick={() => handleQuizAnswer(false)}
                  >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                    <span>Not sure</span>
                  </button>
                </div>
              ) : (
                <div style={styles.feedback}>
                  <div style={styles.feedbackIcon}>✓</div>
                  <p style={styles.feedbackText}>Great! Moving to next concept...</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Bottom Stats */}
      <div style={styles.statsBar}>
        <div style={styles.stat}>
          <div style={styles.statValue}>{progress?.questions_answered || 0}</div>
          <div style={styles.statLabel}>Questions</div>
        </div>
        <div style={styles.stat}>
          <div style={styles.statValue}>{progress?.lessons_viewed || 0}</div>
          <div style={styles.statLabel}>Lessons</div>
        </div>
        <div style={styles.stat}>
          <div style={styles.statValue}>{Object.keys(progress?.concept_mastery || {}).length}</div>
          <div style={styles.statLabel}>Concepts</div>
        </div>
      </div>

      {/* Next Button */}
      <button style={styles.nextButton} onClick={handleNext}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
        <span>Next</span>
      </button>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: colors.background.gradient,
    color: colors.text.primary,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  
  centerContent: {
    margin: 'auto',
    textAlign: 'center',
    padding: spacing.xl,
  },
  
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    background: 'rgba(27, 40, 56, 0.95)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  
  levelBadge: {
    background: colors.gradients.cyan,
    padding: `${spacing.sm} ${spacing.lg}`,
    borderRadius: borderRadius.full,
    boxShadow: shadows.glow,
  },
  
  levelText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: 'white',
  },
  
  progressContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
    margin: `0 ${spacing.lg}`,
  },
  
  progressBar: {
    flex: 1,
    height: '6px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  
  progressFill: {
    height: '100%',
    background: colors.gradients.cyan,
    transition: 'width 0.3s ease',
  },
  
  progressText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    minWidth: '60px',
  },
  
  swipeHint: {
    fontSize: typography.fontSize.sm,
    color: colors.text.muted,
  },
  
  cardContainer: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  
  card: {
    width: '100%',
    maxWidth: '500px',
    minHeight: '500px',
    background: colors.background.card,
    borderRadius: borderRadius['2xl'],
    padding: spacing.xl,
    boxShadow: shadows.xl,
    border: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.3s ease, opacity 0.3s ease',
  },
  
  cardSwipeOut: {
    transform: 'translateY(-120vh) scale(0.8)',
    opacity: 0,
  },
  
  zoneBadge: {
    alignSelf: 'flex-start',
    padding: `${spacing.sm} ${spacing.md}`,
    borderRadius: borderRadius.full,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  
  quizBadge: {
    alignSelf: 'flex-start',
    background: colors.gradients.purple,
    color: 'white',
    padding: `${spacing.sm} ${spacing.md}`,
    borderRadius: borderRadius.full,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.md,
    boxShadow: shadows.glowPurple,
  },
  
  conceptTag: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    fontWeight: typography.fontWeight.semibold,
  },
  
  visualContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  
  lessonTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.lg,
    lineHeight: typography.lineHeight.tight,
  },
  
  lessonContent: {
    fontSize: typography.fontSize.base,
    lineHeight: typography.lineHeight.relaxed,
    color: colors.text.secondary,
    flex: 1,
    marginBottom: spacing.lg,
  },
  
  tapHint: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    fontSize: typography.fontSize.sm,
    color: colors.text.muted,
  },
  
  questionText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.xl,
    lineHeight: typography.lineHeight.normal,
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    textAlign: 'center',
  },
  
  answerButtons: {
    display: 'flex',
    gap: spacing.md,
  },
  
  answerButtonKnow: {
    flex: 1,
    padding: spacing.lg,
    background: colors.gradients.green,
    color: 'white',
    border: 'none',
    borderRadius: borderRadius.lg,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacing.sm,
    cursor: 'pointer',
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    transition: 'transform 0.2s ease',
    boxShadow: shadows.md,
  },
  
  answerButtonDont: {
    flex: 1,
    padding: spacing.lg,
    background: colors.gradients.red,
    color: 'white',
    border: 'none',
    borderRadius: borderRadius.lg,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacing.sm,
    cursor: 'pointer',
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    transition: 'transform 0.2s ease',
    boxShadow: shadows.md,
  },
  
  feedback: {
    background: 'rgba(16, 185, 129, 0.15)',
    border: `2px solid ${colors.accent.green}`,
    borderRadius: borderRadius.lg,
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
  
  statsBar: {
    display: 'flex',
    justifyContent: 'space-around',
    padding: spacing.lg,
    background: 'rgba(27, 40, 56, 0.95)',
    backdropFilter: 'blur(10px)',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
  },
  
  stat: {
    textAlign: 'center',
  },
  
  statValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.accent.cyan,
    lineHeight: 1,
    marginBottom: spacing.xs,
  },
  
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  
  nextButton: {
    position: 'fixed',
    bottom: '120px',
    right: spacing.xl,
    padding: `${spacing.md} ${spacing.xl}`,
    background: colors.gradients.cyan,
    color: 'white',
    border: 'none',
    borderRadius: borderRadius.full,
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    cursor: 'pointer',
    boxShadow: shadows.glow,
    transition: 'transform 0.2s ease',
  },
  
  spinner: {
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
    fontSize: typography.fontSize.lg,
    color: colors.text.secondary,
  },
  
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: spacing.lg,
  },
  
  emptyTitle: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.md,
  },
  
  emptyText: {
    fontSize: typography.fontSize.lg,
    color: colors.text.secondary,
  },
}
