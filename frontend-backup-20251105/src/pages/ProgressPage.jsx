import { useUser } from '../contexts/UserContext'
import { colors, typography, spacing, borderRadius } from '../styles/design-system'

export default function ProgressPage() {
  const { progress, loading } = useUser()

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.spinner}></div>
      </div>
    )
  }

  if (!progress) {
    return (
      <div style={styles.container}>
        <p style={styles.emptyText}>No progress data available</p>
      </div>
    )
  }

  const masteryEntries = Object.entries(progress.concept_mastery || {})

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Your Progress</h1>
        <div style={styles.levelBadge}>
          Level i+{Math.floor((progress.overall_ability || 0) + 3)}
        </div>
      </div>

      {/* Overall Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{progress.total_questions}</div>
          <div style={styles.statLabel}>Questions Answered</div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statValue}>{progress.accuracy}%</div>
          <div style={styles.statLabel}>Accuracy</div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statValue}>{progress.concepts_learned}</div>
          <div style={styles.statLabel}>Concepts Mastered</div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statValue}>
            {masteryEntries.length}
          </div>
          <div style={styles.statLabel}>Total Concepts</div>
        </div>
      </div>

      {/* Ability Meter */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Learning Ability</h2>
        <div style={styles.abilityMeter}>
          <div style={styles.abilityBar}>
            <div 
              style={{
                ...styles.abilityFill,
                width: `${((progress.overall_ability + 3) / 6) * 100}%`
              }}
            />
          </div>
          <div style={styles.abilityLabels}>
            <span>Beginner</span>
            <span>Intermediate</span>
            <span>Advanced</span>
          </div>
        </div>
      </div>

      {/* Concept Mastery */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Concept Mastery</h2>
        <div style={styles.conceptsList}>
          {masteryEntries.length > 0 ? (
            masteryEntries.map(([conceptId, mastery]) => (
              <div key={conceptId} style={styles.conceptCard}>
                <div style={styles.conceptInfo}>
                  <div style={styles.conceptName}>Concept {conceptId.slice(0, 8)}</div>
                  <div style={styles.conceptMastery}>{Math.round(mastery * 100)}%</div>
                </div>
                <div style={styles.conceptBar}>
                  <div 
                    style={{
                      ...styles.conceptFill,
                      width: `${mastery * 100}%`,
                      background: mastery > 0.7 ? colors.gradients.green : 
                                 mastery > 0.4 ? colors.gradients.cyan : 
                                 colors.gradients.red
                    }}
                  />
                </div>
              </div>
            ))
          ) : (
            <p style={styles.emptyText}>Start learning to see your progress!</p>
          )}
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
    padding: spacing.xl,
    overflowY: 'auto',
  },
  
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
  },
  
  levelBadge: {
    background: colors.gradients.cyan,
    padding: `${spacing.sm} ${spacing.lg}`,
    borderRadius: borderRadius.full,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: 'white',
  },
  
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: spacing.lg,
    marginBottom: spacing['2xl'],
  },
  
  statCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    textAlign: 'center',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  
  statValue: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.accent.cyan,
    marginBottom: spacing.sm,
  },
  
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.muted,
  },
  
  section: {
    marginBottom: spacing['2xl'],
  },
  
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.lg,
  },
  
  abilityMeter: {
    background: 'rgba(255, 255, 255, 0.05)',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  
  abilityBar: {
    width: '100%',
    height: '20px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  
  abilityFill: {
    height: '100%',
    background: colors.gradients.cyan,
    transition: 'width 0.5s ease',
  },
  
  abilityLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: typography.fontSize.xs,
    color: colors.text.muted,
  },
  
  conceptsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
  },
  
  conceptCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  
  conceptInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  
  conceptName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  
  conceptMastery: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.accent.cyan,
  },
  
  conceptBar: {
    width: '100%',
    height: '8px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  
  conceptFill: {
    height: '100%',
    transition: 'width 0.5s ease',
  },
  
  spinner: {
    width: '4rem',
    height: '4rem',
    border: '4px solid transparent',
    borderTopColor: colors.accent.cyan,
    borderBottomColor: colors.accent.cyan,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: 'auto',
  },
  
  emptyText: {
    textAlign: 'center',
    color: colors.text.muted,
    padding: spacing.xl,
  },
}
