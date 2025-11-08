import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary'
import { HomePage } from './pages/HomePage'
import { FeedPage } from './pages/FeedPage'
import { ProgressPage } from './pages/ProgressPage'
import { PracticePage } from './pages/PracticePage'
import { FlashcardsPage } from './pages/FlashcardsPage'
import { ChallengePage } from './pages/ChallengePage'
import { FlashcardPage } from './pages/FlashcardPage'
import { RewardsPage } from './pages/RewardsPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { StudyPlansPage } from './pages/StudyPlansPage'
import { TutorPage } from './pages/TutorPage'
import { LibraryPage } from './pages/LibraryPage'
import { StudyInsightsPage } from './pages/StudyInsightsPage'
import { ProfilePage } from './pages/ProfilePage'
import { CollaborationPage } from './pages/CollaborationPage'
import { useSearchParams } from 'react-router-dom'
import { StudyRoomsPage } from './pages/StudyRoomsPage'
import { StudyRoomPage } from './pages/StudyRoomPage'
import './styles/theme.css'
import './styles/noteloop_core.css'
import './styles/micro_lesson.css'
import './styles/profile_feed.css'
import './styles/animations.css'

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/flashcards" element={<FlashcardPage />} />
          <Route path="/rewards" element={<RewardsPage />} />
          <Route path="/achievements" element={<RewardsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/study-plans" element={<StudyPlansPage />} />
          <Route path="/tutor" element={<TutorPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/insights" element={<StudyInsightsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/collaboration" element={<CollaborationPage />} />
          <Route path="/collaboration/join/:inviteCode" element={<CollaborationPage />} />
          <Route path="/study-rooms" element={<StudyRoomsPage />} />
          <Route path="/study-room/:roomId" element={<StudyRoomPage />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  )
}

export default App
