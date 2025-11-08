import { useState } from 'react'
import UploadArea from '../components/UploadArea'
import { colors, typography, spacing, borderRadius } from '../styles/design-system'

export default function WelcomePage({ onComplete }) {
  const [showUpload, setShowUpload] = useState(false)

  return (
    <div style={styles.container}>
      {!showUpload ? (
        <>
          {/* Logo */}
          <div style={styles.logoContainer}>
            <svg width="120" height="120" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="48" fill="url(#welcomeGradient)" />
              <path 
                d="M30 50C30 42 38 35 50 35C62 35 70 42 70 50C70 58 62 65 50 65C38 65 30 58 30 50Z" 
                stroke="white" 
                strokeWidth="4" 
                fill="none"
              />
              <circle cx="42" cy="47" r="4" fill="white" />
              <circle cx="58" cy="47" r="4" fill="white" />
              <path d="M40 55C40 55 45 60 60 55" stroke="white" strokeWidth="3" strokeLinecap="round" />
              <defs>
                <linearGradient id="welcomeGradient" x1="0" y1="0" x2="100" y2="100">
                  <stop offset="0%" stopColor="#17D4D6" />
                  <stop offset="100%" stopColor="#0EA5E9" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Title */}
          <h1 style={styles.title}>NoteLoop AI</h1>
          <p style={styles.subtitle}>
            Transform your notes into TikTok-style micro-lessons
          </p>

          {/* Features */}
          <div style={styles.features}>
            <div style={styles.feature}>
              <div style={styles.featureIcon}>🎥</div>
              <div style={styles.featureText}>60-second video lessons</div>
            </div>
            <div style={styles.feature}>
              <div style={styles.featureIcon}>🧠</div>
              <div style={styles.featureText}>AI-powered quizzes</div>
            </div>
            <div style={styles.feature}>
              <div style={styles.featureIcon}>📈</div>
              <div style={styles.featureText}>Adaptive difficulty</div>
            </div>
          </div>

          {/* Buttons */}
          <button style={styles.primaryButton} onClick={() => setShowUpload(true)}>
            Upload Notes
          </button>

          <button style={styles.secondaryButton} onClick={onComplete}>
            Try Demo Content
          </button>
        </>
      ) : (
        <>
          <h2 style={styles.uploadTitle}>Upload Your Notes</h2>
          <p style={styles.uploadSubtitle}>
            We'll turn them into bite-sized lessons
          </p>
          
          <UploadArea onUploadComplete={onComplete} />
          
          <button style={styles.backButton} onClick={() => setShowUpload(false)}>
            ← Back
          </button>
        </>
      )}
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: colors.background.gradient,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    color: colors.text.primary,
  },
  
  logoContainer: {
    marginBottom: spacing.xl,
    animation: 'fadeIn 0.6s ease-out',
  },
  
  title: {
    fontSize: typography.fontSize['5xl'],
    fontWeight: typography.fontWeight.extrabold,
    marginBottom: spacing.md,
    textAlign: 'center',
    background: colors.gradients.cyan,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  
  subtitle: {
    fontSize: typography.fontSize.xl,
    color: colors.text.secondary,
    marginBottom: spacing['2xl'],
    textAlign: 'center',
    maxWidth: '500px',
    lineHeight: typography.lineHeight.relaxed,
  },
  
  features: {
    display: 'flex',
    gap: spacing.xl,
    marginBottom: spacing['2xl'],
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  
  feature: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: '120px',
  },
  
  featureIcon: {
    fontSize: '3rem',
  },
  
  featureText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  
  primaryButton: {
    width: '100%',
    maxWidth: '300px',
    padding: `${spacing.lg} ${spacing.xl}`,
    background: colors.gradients.cyan,
    color: 'white',
    border: 'none',
    borderRadius: borderRadius.full,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    cursor: 'pointer',
    marginBottom: spacing.md,
    boxShadow: '0 4px 20px rgba(23, 212, 214, 0.4)',
  },
  
  secondaryButton: {
    width: '100%',
    maxWidth: '300px',
    padding: `${spacing.lg} ${spacing.xl}`,
    background: 'transparent',
    color: colors.text.secondary,
    border: `2px solid ${colors.text.muted}`,
    borderRadius: borderRadius.full,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    cursor: 'pointer',
  },
  
  uploadTitle: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  
  uploadSubtitle: {
    fontSize: typography.fontSize.lg,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  
  backButton: {
    marginTop: spacing.xl,
    padding: `${spacing.md} ${spacing.lg}`,
    background: 'transparent',
    color: colors.text.secondary,
    border: 'none',
    fontSize: typography.fontSize.base,
    cursor: 'pointer',
  },
}
