import { useState } from 'react'
import { UserProvider } from './contexts/UserContext'
import WelcomePage from './pages/WelcomePage'
import FeedPage from './pages/FeedPage'
import ProgressPage from './pages/ProgressPage'
import { colors, typography, spacing } from './styles/design-system'

function AppContent() {
  const [currentView, setCurrentView] = useState('welcome') // START ON WELCOME!

  return (
    <div style={styles.container}>
      {currentView === 'welcome' && (
        <WelcomePage onComplete={() => setCurrentView('feed')} />
      )}

      {currentView === 'feed' && (
        <>
          <FeedPage />
          <NavigationBar currentView={currentView} onNavigate={setCurrentView} />
        </>
      )}

      {currentView === 'progress' && (
        <>
          <ProgressPage />
          <NavigationBar currentView={currentView} onNavigate={setCurrentView} />
        </>
      )}
    </div>
  )
}

function NavigationBar({ currentView, onNavigate }) {
  return (
    <nav style={styles.nav}>
      <button
        style={{
          ...styles.navButton,
          ...(currentView === 'feed' ? styles.navButtonActive : {})
        }}
        onClick={() => onNavigate('feed')}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
        <span style={styles.navLabel}>Feed</span>
      </button>

      <button
        style={{
          ...styles.navButton,
          ...(currentView === 'progress' ? styles.navButtonActive : {})
        }}
        onClick={() => onNavigate('progress')}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
        <span style={styles.navLabel}>Progress</span>
      </button>
    </nav>
  )
}

export default function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  )
}

const styles = {
  container: {
    position: 'relative',
    minHeight: '100vh',
  },
  
  nav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'space-around',
    padding: spacing.md,
    background: 'rgba(27, 40, 56, 0.95)',
    backdropFilter: 'blur(10px)',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    zIndex: 100,
  },
  
  navButton: {
    background: 'transparent',
    border: 'none',
    color: colors.text.muted,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacing.xs,
    cursor: 'pointer',
    padding: spacing.sm,
    transition: 'color 0.2s',
    minWidth: '80px',
  },
  
  navButtonActive: {
    color: colors.accent.cyan,
  },
  
  navLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
}
