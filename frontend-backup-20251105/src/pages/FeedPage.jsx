import React, { useState, useEffect } from 'react'
import { api } from '../services/api'
import VideoPlayer from '../components/VideoPlayer'
import QuizCard from '../components/QuizCard'
import './FeedPage.css'

const FeedPage = ({ userId, onViewProgress }) => {
  const [feed, setFeed] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showQuiz, setShowQuiz] = useState(false)

  useEffect(() => {
    loadFeed()
  }, [userId])

  const loadFeed = async () => {
    try {
      setLoading(true)
      const data = await api.getFeed(userId, 30)
      setFeed(data)
      setLoading(false)
    } catch (error) {
      console.error('Error loading feed:', error)
      setLoading(false)
    }
  }

  const handleNext = () => {
    setShowQuiz(false)
    if (currentIndex < feed.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      // Reached end, load more
      loadFeed()
      setCurrentIndex(0)
    }
  }

  const handleVideoComplete = () => {
    // Auto-advance or show quiz
    const currentItem = feed[currentIndex]
    const nextItem = feed[currentIndex + 1]
    
    if (nextItem && nextItem.type === 'quiz') {
      setCurrentIndex(currentIndex + 1)
      setShowQuiz(true)
    } else {
      setTimeout(handleNext, 1000)
    }
  }

  const handleQuizComplete = async (quizId, answer, isCorrect) => {
    try {
      const result = await api.submitAnswer(userId, quizId, answer)
      
      // Show feedback briefly
      setTimeout(() => {
        setShowQuiz(false)
        handleNext()
      }, 2000)
      
      return result
    } catch (error) {
      console.error('Error submitting answer:', error)
    }
  }

  if (loading) {
    return (
      <div className="feed-loading">
        <div className="spinner"></div>
        <p>Loading your personalized feed...</p>
      </div>
    )
  }

  if (feed.length === 0) {
    return (
      <div className="feed-empty">
        <h2>📚 No Content Yet</h2>
        <p>Upload some notes to get started!</p>
      </div>
    )
  }

  const currentItem = feed[currentIndex]

  return (
    <div className="feed-page">
      {/* Progress indicator */}
      <div className="feed-progress-bar">
        <div 
          className="feed-progress-fill"
          style={{ width: `${((currentIndex + 1) / feed.length) * 100}%` }}
        />
      </div>

      {/* Content */}
      <div className="feed-content">
        {currentItem.type === 'video' && !showQuiz && (
          <VideoPlayer
            video={currentItem.content}
            onComplete={handleVideoComplete}
            onQuizTrigger={() => setShowQuiz(true)}
          />
        )}

        {(currentItem.type === 'quiz' || showQuiz) && (
          <QuizCard
            quiz={currentItem.type === 'quiz' ? currentItem.content : null}
            userId={userId}
            onComplete={handleQuizComplete}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="feed-navigation">
        <button
          className="nav-btn"
          onClick={handleNext}
          disabled={currentIndex >= feed.length - 1}
        >
          Next →
        </button>
        
        <div className="feed-counter">
          {currentIndex + 1} / {feed.length}
        </div>

        <button
          className="progress-btn"
          onClick={onViewProgress}
        >
          📊 Progress
        </button>
      </div>
    </div>
  )
}

export default FeedPage
