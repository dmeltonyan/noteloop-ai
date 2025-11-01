import { useState, useEffect, useRef } from 'react'
import { api } from '../services/api'
import { useUser } from '../contexts/UserContext'
import VideoCard from '../components/VideoCard'
import QuizCard from '../components/QuizCard'
import { colors, typography, spacing, borderRadius } from '../styles/design-system'

export default function FeedPage() {
  const { userId, progress } = useUser()
  const [feedItems, setFeedItems] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const containerRef = useRef(null)

  useEffect(() => {
    loadFeed()
  }, [userId])

  const loadFeed = async () => {
    if (!userId) return
    
    try {
      setLoading(true)
      const feed = await api.getFeed(userId, 30)
      setFeedItems(feed)
    } catch (error) {
      console.error('Error loading feed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    if (currentIndex < feedItems.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      // Load more content
      loadFeed()
      setCurrentIndex(0)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  // Touch/Swipe handlers
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientY)
  }

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientY)
  }

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      // Swipe up
      handleNext()
    }

    if (touchStart - touchEnd < -50) {
      // Swipe down
      handlePrevious()
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowUp') handlePrevious()
      if (e.key === 'ArrowDown') handleNext()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, feedItems.length])

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.centerContent}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading your personalized feed...</p>
        </div>
      </div>
    )
  }

  if (!feedItems || feedItems.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.centerContent}>
          <div style={styles.emptyIcon}>📚</div>
          <h2 style={styles.emptyTitle}>No Content Yet</h2>
          <p style={styles.emptyText}>Upload your notes to start learning!</p>
          <button style={styles.uploadButton} onClick={() => window.location.reload()}>
            Upload Notes
          </button>
        </div>
      </div>
    )
  }

  const currentItem = feedItems[currentIndex]
  if (!currentItem) return null

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.logo}>
          <svg width="32" height="32" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="48" fill="url(#logoGradient)" />
            <defs>
              <linearGradient id="logoGradient" x1="0" y1="0" x2="100" y2="100">
                <stop offset="0%" stopColor="#17D4D6" />
                <stop offset="100%" stopColor="#0EA5E9" />
              </linearGradient>
            </defs>
          </svg>
          <span style={styles.logoText}>NoteLoop</span>
        </div>

        <div style={styles.progressInfo}>
          <div style={styles.levelBadge}>
            Level i+{Math.floor((progress?.overall_ability || 0) + 3)}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
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

      {/* Main Content Area - Swipeable */}
      <div 
        ref={containerRef}
        style={styles.contentArea}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div style={styles.card}>
          {currentItem.type === 'video' ? (
            <VideoCard
              video={currentItem.content}
              conceptName={currentItem.content.concept_name}
              onNext={handleNext}
            />
          ) : (
            <QuizCard
              quiz={currentItem.content}
              conceptName={currentItem.content.concept_name}
              difficultyZone={currentItem.content.difficulty_zone}
              onNext={handleNext}
            />
          )}
        </div>
      </div>

      {/* Navigation Indicators */}
      <div style={styles.navIndicators}>
        <button 
          style={{...styles.navButton, opacity: currentIndex === 0 ? 0.3 : 1}}
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 15l-6-6-6 6"/>
          </svg>
        </button>

        <div style={styles.swipeHint}>
          {currentItem.type === 'video' ? '📹 Video' : '❓ Quiz'} • Swipe up ↑
        </div>

        <button 
          style={styles.navButton}
          onClick={handleNext}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </button>
      </div>

      {/* Stats Bar */}
      <div style={styles.statsBar}>
        <div style={styles.stat}>
          <div style={styles.statValue}>{progress?.total_questions || 0}</div>
          <div style={styles.statLabel}>Questions</div>
        </div>
        <div style={styles.stat}>
          <div style={styles.statValue}>
            {progress?.accuracy ? `${progress.accuracy}%` : '0%'}
          </div>
          <div style={styles.statLabel}>Accuracy</div>
        </div>
        <div style={styles.stat}>
          <div style={styles.statValue}>{progress?.concepts_learned || 0}</div>
          <div style={styles.statLabel}>Mastered</div>
        </div>
      </div>
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
    position: 'relative',
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
    zIndex: 10,
  },
  
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
  },
  
  logoText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    background: colors.gradients.cyan,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  
  progressInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
  },
  
  levelBadge: {
    background: colors.gradients.cyan,
    padding: `${spacing.sm} ${spacing.md}`,
    borderRadius: borderRadius.full,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: 'white',
  },
  
  progressContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
    padding: `${spacing.sm} ${spacing.lg}`,
    background: 'rgba(27, 40, 56, 0.8)',
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
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    minWidth: '50px',
    textAlign: 'right',
  },
  
  contentArea: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    position: 'relative',
  },
  
  card: {
    width: '100%',
    maxWidth: '500px',
    height: '100%',
    maxHeight: '600px',
    background: colors.background.card,
    borderRadius: borderRadius['2xl'],
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  
  navIndicators: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    padding: spacing.md,
    background: 'rgba(27, 40, 56, 0.8)',
  },
  
  navButton: {
    background: 'rgba(255, 255, 255, 0.1)',
    border: 'none',
    borderRadius: borderRadius.full,
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.text.secondary,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  
  swipeHint: {
    fontSize: typography.fontSize.sm,
    color: colors.text.muted,
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
    fontSize: typography.fontSize.xl,
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
    marginBottom: spacing.xl,
  },
  
  uploadButton: {
    padding: `${spacing.md} ${spacing.xl}`,
    background: colors.gradients.cyan,
    color: 'white',
    border: 'none',
    borderRadius: borderRadius.full,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    cursor: 'pointer',
  },
}
