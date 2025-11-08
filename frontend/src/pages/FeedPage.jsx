import React, { useState, useEffect, useRef } from 'react'
import { api } from '../services/api'
import { AdvancedQuizInterface } from '../components/AdvancedQuizInterface'
import { NavigationHeader } from '../components/NavigationHeader'
import { AchievementNotification } from '../components/AchievementNotification'
import { AIChatSidebar } from '../components/AIChatSidebar'
import { CreditsDisplay } from '../components/CreditsDisplay'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { 
  TrendingUp, Zap, Award, Target, Loader, ArrowRight, BookOpen, RefreshCw, 
  CheckCircle, XCircle, Sparkles, Flame, Lightbulb, ChevronLeft, ChevronRight,
  Clock, Users, Eye, EyeOff, Minimize2, Maximize2, Filter, Settings, 
  ThumbsUp, ThumbsDown, Bookmark, HelpCircle, RotateCcw, Trophy, Focus, 
  Wand2, Save, FolderPlus, FileText, Play, GraduationCap, AlertCircle,
  Brain, BarChart3, Calendar
} from 'lucide-react'
import { StudyGuideGenerator } from '../components/StudyGuideGenerator'
import { FocusedAreas } from '../components/FocusedAreas'

// Circular Progress Ring Component
const CircularProgress = ({ percentage, size = 80, strokeWidth = 8, children }) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="circular-progress-wrapper" style={{ width: size, height: size }}>
      <svg className="circular-progress-svg" width={size} height={size}>
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4A90E2" />
            <stop offset="100%" stopColor="#50E3C2" />
          </linearGradient>
        </defs>
        <circle
          className="circular-progress-bg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <circle
          className="circular-progress-fill"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="circular-progress-content">
        {children}
      </div>
    </div>
  )
}

// Mini-map Component
const QuestionMiniMap = ({ questions, currentIndex, answeredQuestions, onNavigate }) => {
  return (
    <div className="question-minimap">
      <div className="minimap-scroll">
        {questions.map((_, index) => {
          const answered = answeredQuestions.find(q => q.index === index)
          const isCurrent = index === currentIndex
          const isMissed = answered && !answered.correct
          
          return (
            <button
              key={index}
              className={`minimap-dot ${isCurrent ? 'current' : ''} ${answered ? 'answered' : ''} ${isMissed ? 'missed' : ''}`}
              onClick={() => onNavigate(index)}
              title={`Question ${index + 1}`}
            />
          )
        })}
      </div>
    </div>
  )
}

export const FeedPage = () => {
  const [feed, setFeed] = useState([])
  const [filteredFeed, setFilteredFeed] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [userStats, setUserStats] = useState(null)
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    total: 0,
    startTime: Date.now(),
    streak: 0,
    sessionTime: 0
  })
  const [showTips, setShowTips] = useState(false)
  const [sessionComplete, setSessionComplete] = useState(false)
  const [failedQuestions, setFailedQuestions] = useState([])
  const [currentQuizAnswered, setCurrentQuizAnswered] = useState(false)
  const [uploadId, setUploadId] = useState(null)
  const [showAchievementNotification, setShowAchievementNotification] = useState(null)
  const [streaks, setStreaks] = useState(null)
  const [focusedMode, setFocusedMode] = useState(false)
  const [showAIPersonalization, setShowAIPersonalization] = useState(false)
  const [learningStyle, setLearningStyle] = useState(null)
  
  // New state for enhanced features
  const [focusMode, setFocusMode] = useState(false) // Show only weak areas
  const [quickReview, setQuickReview] = useState(false) // Only missed questions
  const [compactMode, setCompactMode] = useState(false)
  const [minimalistMode, setMinimalistMode] = useState(false)
  const [hideNavUntilReady, setHideNavUntilReady] = useState(false)
  const [answeredQuestions, setAnsweredQuestions] = useState([]) // Track answered questions
  const [showConfidenceSlider, setShowConfidenceSlider] = useState(false)
  const [confidenceLevel, setConfidenceLevel] = useState(50)
  const [lastBreakTime, setLastBreakTime] = useState(Date.now())
  const [questionsSinceBreak, setQuestionsSinceBreak] = useState(0)
  const [showBreakReminder, setShowBreakReminder] = useState(false)
  // Removed celebration animations - too annoying
  const [sessionTimer, setSessionTimer] = useState(0)
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [difficultyLevel, setDifficultyLevel] = useState('medium')
  const [showQuickActions, setShowQuickActions] = useState(false)
  const [showStudyGuide, setShowStudyGuide] = useState(false)
  const [showFocusedAreas, setShowFocusedAreas] = useState(false)
  const [showInsights, setShowInsights] = useState(false)
  const [insights, setInsights] = useState(null)
  const [concepts, setConcepts] = useState([])
  
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const userId = 'demo_user_123'
  const timerRef = useRef(null)

  // Session timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSessionTimer(prev => prev + 1)
      const elapsed = Math.floor((Date.now() - sessionStats.startTime) / 1000)
      setSessionTimer(elapsed)
      
      // Update estimated time remaining
      if (sessionStats.total > 0) {
        const avgTimePerQuestion = elapsed / sessionStats.total
        const remaining = (feed.length - sessionStats.total) * avgTimePerQuestion
        setEstimatedTimeRemaining(Math.max(0, Math.floor(remaining)))
      }
      
      // Removed break reminder logic
    }, 1000)
    
    return () => clearInterval(timerRef.current)
  }, [sessionStats, feed.length, questionsSinceBreak, lastBreakTime])

  useEffect(() => {
    const urlUploadId = searchParams.get('upload_id')
    const storedUploadId = localStorage.getItem('current_upload_id')
    const finalUploadId = urlUploadId || storedUploadId || null
    
    setUploadId(finalUploadId)
    if (finalUploadId) {
      localStorage.setItem('current_upload_id', finalUploadId)
    }
    
    loadFeed(finalUploadId)
    loadStats()
    loadStreaks()
  }, [searchParams])

  const loadStreaks = async () => {
    try {
      const data = await api.getStreaks(userId)
      setStreaks(data)
    } catch (error) {
      console.error('Failed to load streaks:', error)
    }
  }

  // Keyboard shortcuts (hidden but functional)
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      
      // Number keys 1-4: Select answer
      if (e.key >= '1' && e.key <= '4' && !currentQuizAnswered) {
        const answerIndex = parseInt(e.key) - 1
        const currentQuiz = filteredFeed[currentIndex]?.content
        if (currentQuiz?.options && currentQuiz.options[answerIndex]) {
          handleAnswerSelect(currentQuiz.options[answerIndex])
        }
      }
      
      // Enter: Submit/Next
      if (e.key === 'Enter') {
        if (currentQuizAnswered) {
          handleNext()
        }
      }
      
      // Tab: Cycle through options (visual focus)
      if (e.key === 'Tab' && !currentQuizAnswered) {
        e.preventDefault()
        // Could implement visual cycling here
      }
      
      // Space: Skip explanation / Next
      if (e.key === ' ') {
        e.preventDefault()
        if (currentQuizAnswered) {
          handleNext()
        }
      }
      
      // Arrow keys
      if (e.key === 'ArrowRight' && currentIndex < filteredFeed.length - 1) {
        if (currentQuizAnswered) handleNext()
      }
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1)
        setCurrentQuizAnswered(false)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
      if (e.key === 'Escape' && focusedMode) {
        setFocusedMode(false)
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentIndex, filteredFeed.length, currentQuizAnswered])

  useEffect(() => {
    setCurrentQuizAnswered(false)
    setShowHint(false)
    setShowConfidenceSlider(false)
  }, [currentIndex])

  const loadFeed = async (uploadIdToUse = null) => {
    try {
      setLoading(true)
      const data = await api.getFeed(userId, 50, uploadIdToUse || uploadId)
      
      const quizItems = data
        .filter(item => item.type === 'quiz')
        .filter(item => {
          const quiz = item.content
          return quiz && quiz.question && quiz.options && 
                 Array.isArray(quiz.options) && quiz.options.length >= 4 &&
                 quiz.correct_answer
        })
      
      // Extract unique concepts from quizzes
      const conceptMap = new Map()
      quizItems.forEach(item => {
        const conceptId = item.content?.concept_id
        if (conceptId && !conceptMap.has(conceptId)) {
          conceptMap.set(conceptId, {
            id: conceptId,
            topic_name: item.content?.concept_name || `Concept ${conceptId.slice(-8)}`,
            description: item.content?.source_text || ''
          })
        }
      })
      setConcepts(Array.from(conceptMap.values()))
      
      setFeed(quizItems)
      setFilteredFeed(quizItems)
      setCurrentIndex(0)
      setLoading(false)
      
      // Show quick actions when feed loads (first time or new upload)
      if (quizItems.length > 0 && uploadIdToUse) {
        setShowQuickActions(true)
        // Auto-hide after 8 seconds
        setTimeout(() => setShowQuickActions(false), 8000)
      }
    } catch (error) {
      console.error('Error loading feed:', error)
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const stats = await api.getUserProgress(userId)
      setUserStats(stats)
      // Load insights when stats are loaded
      loadInsights(stats)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const loadInsights = async (progress = null) => {
    try {
      const userProgress = progress || await api.getUserProgress(userId)
      const analytics = await api.getUserAnalytics(userId).catch(() => null)
      
      // Generate personalized insights
      const generatedInsights = {
        learningVelocity: calculateLearningVelocity(userProgress),
        optimalStudyTime: determineOptimalStudyTime(analytics),
        weakAreas: identifyWeakAreas(userProgress),
        recommendations: generateRecommendations(userProgress, analytics),
        patterns: analyzePatterns(analytics),
        nextSteps: suggestNextSteps(userProgress)
      }
      
      setInsights(generatedInsights)
    } catch (error) {
      console.error('Failed to load insights:', error)
    }
  }

  const calculateLearningVelocity = (progress) => {
    const questionsPerDay = progress.total_questions / Math.max(progress.study_days || 1, 1)
    return {
      value: questionsPerDay,
      trend: questionsPerDay > 20 ? 'increasing' : questionsPerDay > 10 ? 'stable' : 'improving',
      message: questionsPerDay > 20 
        ? 'You\'re learning at an excellent pace!' 
        : questionsPerDay > 10 
        ? 'Steady progress - keep it up!' 
        : 'Great start! Try to study a bit more each day.'
    }
  }

  const determineOptimalStudyTime = (analytics) => {
    return {
      morning: { score: 85, active: true },
      afternoon: { score: 92, active: true },
      evening: { score: 78, active: false },
      recommendation: 'Your peak performance is in the afternoon (2-4 PM). Schedule important study sessions then!'
    }
  }

  const identifyWeakAreas = (progress) => {
    const mastery = progress.concept_mastery || {}
    const weakConcepts = Object.entries(mastery)
      .filter(([_, masteryValue]) => {
        const value = typeof masteryValue === 'number' ? masteryValue : masteryValue.mastery || 0
        return value < 0.5
      })
      .slice(0, 3)
    
    return weakConcepts.map(([id, _]) => ({
      id,
      name: `Concept ${id.slice(-8)}`,
      mastery: typeof mastery[id] === 'number' ? mastery[id] : mastery[id]?.mastery || 0
    }))
  }

  const generateRecommendations = (progress, analytics) => {
    const recommendations = []
    
    // Accuracy-based recommendations
    if (progress.accuracy < 70) {
      recommendations.push({
        type: 'accuracy',
        icon: <Target size={20} />,
        title: 'Focus on Accuracy',
        message: 'Your accuracy is below 70%. Review concepts you\'ve struggled with and take your time with each question.',
        priority: 'high'
      })
    } else if (progress.accuracy >= 90) {
      recommendations.push({
        type: 'excellence',
        icon: <Award size={20} />,
        title: 'Excellent Performance!',
        message: 'You\'re performing exceptionally well! Try challenging yourself with harder questions or new concepts.',
        priority: 'low'
      })
    }
    
    // Concept coverage recommendations
    if (progress.concepts_learned < progress.total_concepts * 0.3) {
      recommendations.push({
        type: 'coverage',
        icon: <Zap size={20} />,
        title: 'Explore More Concepts',
        message: `You've mastered ${progress.concepts_learned} of ${progress.total_concepts} concepts. Try exploring new topics!`,
        priority: 'medium'
      })
    }
    
    // Study streak recommendations
    const currentStreak = sessionStats.streak || 0
    if (currentStreak === 0) {
      recommendations.push({
        type: 'streak',
        icon: <Flame size={20} />,
        title: 'Start a Study Streak',
        message: 'Build a daily study habit! Even 10 minutes a day can significantly improve retention.',
        priority: 'medium'
      })
    } else if (currentStreak >= 7) {
      recommendations.push({
        type: 'streak_maintain',
        icon: <Flame size={20} />,
        title: 'Maintain Your Streak!',
        message: `You're on a ${currentStreak}-day streak! Keep it going for maximum learning benefits.`,
        priority: 'low'
      })
    }
    
    // Spaced repetition recommendations
    recommendations.push({
      type: 'spaced_repetition',
      icon: <Clock size={20} />,
      title: 'Use Spaced Repetition',
      message: 'Review concepts you learned 2-3 days ago to strengthen retention. This is scientifically proven to improve memory.',
      priority: 'medium'
    })
    
    // Study session recommendations
    const avgSessionTime = sessionTimer / Math.max(sessionStats.total, 1)
    if (avgSessionTime > 3600) { // More than 1 hour
      recommendations.push({
        type: 'breaks',
        icon: <RefreshCw size={20} />,
        title: 'Take Regular Breaks',
        message: 'You\'ve been studying for a while. Take a 5-10 minute break to maintain focus and prevent burnout.',
        priority: 'high'
      })
    } else if (sessionStats.total > 0 && sessionStats.total < 5) {
      recommendations.push({
        type: 'session_length',
        icon: <Clock size={20} />,
        title: 'Extend Your Study Session',
        message: 'Try to complete at least 10-15 questions per session for optimal learning. You\'re doing great so far!',
        priority: 'low'
      })
    }
    
    // Concept mastery recommendations
    const weakConcepts = identifyWeakAreas(progress)
    if (weakConcepts.length > 0) {
      recommendations.push({
        type: 'weak_areas',
        icon: <Target size={20} />,
        title: 'Focus on Weak Areas',
        message: `You have ${weakConcepts.length} concept${weakConcepts.length > 1 ? 's' : ''} that need more practice. Use the "Focus Areas" feature to target them.`,
        priority: 'high'
      })
    }
    
    // Study guide recommendations
    if (concepts.length > 0 && !showStudyGuide) {
      recommendations.push({
        type: 'study_guide',
        icon: <FileText size={20} />,
        title: 'Generate a Study Guide',
        message: `Create a comprehensive study guide from your ${concepts.length} uploaded concepts. This will help you review efficiently.`,
        priority: 'medium'
      })
    }
    
    // AI Tutor recommendations
    if (progress.accuracy < 75 && progress.total_questions > 10) {
      recommendations.push({
        type: 'ai_tutor',
        icon: <GraduationCap size={20} />,
        title: 'Get AI Tutoring Help',
        message: 'Struggling with concepts? Use the AI Tutor to get personalized explanations and practice questions.',
        priority: 'medium'
      })
    }
    
    // Flashcard recommendations
    if (progress.concepts_learned > 0) {
      recommendations.push({
        type: 'flashcards',
        icon: <BookOpen size={20} />,
        title: 'Review with Flashcards',
        message: 'Use flashcards to quickly review key concepts. Perfect for spaced repetition and quick study sessions.',
        priority: 'low'
      })
    }
    
    // Interleaved practice recommendation
    if (progress.total_questions > 20) {
      recommendations.push({
        type: 'interleaved',
        icon: <RefreshCw size={20} />,
        title: 'Try Interleaved Practice',
        message: 'Mix different concepts together rather than studying one at a time. This improves transfer and retention.',
        priority: 'medium'
      })
    }
    
    // Time management recommendations
    const questionsPerMinute = sessionStats.total > 0 ? sessionTimer / sessionStats.total / 60 : 0
    if (questionsPerMinute < 0.5 && sessionStats.total > 5) {
      recommendations.push({
        type: 'pace',
        icon: <Zap size={20} />,
        title: 'Improve Your Pace',
        message: 'You\'re taking your time, which is good for accuracy. Try to maintain focus to complete more questions.',
        priority: 'low'
      })
    } else if (questionsPerMinute > 2 && progress.accuracy < 80) {
      recommendations.push({
        type: 'slow_down',
        icon: <Target size={20} />,
        title: 'Slow Down for Better Accuracy',
        message: 'You\'re moving quickly but accuracy is suffering. Take time to read questions carefully.',
        priority: 'high'
      })
    }
    
    // Daily goals recommendation
    if (progress.total_questions < 50) {
      recommendations.push({
        type: 'daily_goals',
        icon: <Target size={20} />,
        title: 'Set Daily Study Goals',
        message: 'Set a daily goal of 20-30 questions to build a consistent study habit and track your progress.',
        priority: 'medium'
      })
    }
    
    // Review old material recommendation
    if (progress.total_questions > 30) {
      recommendations.push({
        type: 'review',
        icon: <RotateCcw size={20} />,
        title: 'Review Previous Material',
        message: 'Revisit questions you answered incorrectly. Reviewing mistakes is crucial for learning.',
        priority: 'medium'
      })
    }
    
    // Limit recommendations to top 5-6 most relevant
    return recommendations
      .sort((a, b) => {
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      })
      .slice(0, 6)
  }

  const analyzePatterns = (analytics) => {
    return {
      consistency: 'You study most consistently on weekdays',
      bestDay: 'Wednesday',
      improvement: 'Your accuracy has improved 15% over the last week',
      streak: 'Maintain your current streak for maximum retention'
    }
  }

  const suggestNextSteps = (progress) => {
    return [
      'Review 3 concepts you struggled with today',
      'Complete 10 more practice questions',
      'Set a study goal for tomorrow',
      'Explore a new topic from your library'
    ]
  }

  const handleAnswerSelect = async (answer) => {
    const currentQuiz = filteredFeed[currentIndex]?.content
    if (!currentQuiz || currentQuizAnswered) return
    
    const isCorrect = answer === currentQuiz.correct_answer
    setCurrentQuizAnswered(true)
    setQuestionAnswered(currentIndex, isCorrect)
    
    // Update streak
    if (isCorrect) {
      setSessionStats(prev => ({
        ...prev,
        streak: prev.streak + 1
      }))
      
      // Celebration animation for streaks
      if (sessionStats.streak > 0 && (sessionStats.streak + 1) % 5 === 0) {
        triggerCelebration(`${sessionStats.streak + 1} in a row! 🔥`)
      }
    } else {
      setSessionStats(prev => ({
        ...prev,
        streak: 0
      }))
      setFailedQuestions(prev => [...prev, filteredFeed[currentIndex]])
    }
    
    await handleQuizAnswer(currentQuiz.id, answer, isCorrect, 0)
  }

  const setQuestionAnswered = (index, isCorrect) => {
    setAnsweredQuestions(prev => {
      const existing = prev.find(q => q.index === index)
      if (existing) {
        return prev.map(q => q.index === index ? { ...q, correct: isCorrect } : q)
      }
      return [...prev, { index, correct: isCorrect }]
    })
  }

  // Removed triggerCelebration - no annoying notifications

  const handleQuizAnswer = async (quizId, answer, isCorrect, timeSpent) => {
    try {
      const result = await api.submitAnswer(userId, quizId, answer)
      
      setSessionStats(prev => ({
        ...prev,
        correct: prev.correct + (isCorrect ? 1 : 0),
        total: prev.total + 1
      }))
      
      setQuestionsSinceBreak(prev => prev + 1)
      
      // Silently track credits and level ups (no annoying notifications)
      // Still save achievements but don't show popups
      if (result.achievements_unlocked && Array.isArray(result.achievements_unlocked) && result.achievements_unlocked.length > 0) {
        // Achievement unlocked - but no popup
      }
      
      // Auto-save quiz
      try {
        await api.saveQuiz(userId, quizId)
      } catch (e) {
        // Silent fail
      }
      
      await loadStats()
      await loadStreaks()
      
      return result
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleNext = () => {
    if (currentIndex < filteredFeed.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setCurrentQuizAnswered(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      setSessionComplete(true)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setCurrentQuizAnswered(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleMarkAsKnown = () => {
    const currentQuiz = filteredFeed[currentIndex]?.content
    if (currentQuiz) {
      handleAnswerSelect(currentQuiz.correct_answer)
      // Silent action
    }
  }

  const handleTooEasy = () => {
    // Remove from current session
    setFilteredFeed(prev => prev.filter((_, idx) => idx !== currentIndex))
    if (currentIndex >= filteredFeed.length - 1 && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
    // Silent action
  }

  const handleReviewLater = async () => {
    const currentQuiz = filteredFeed[currentIndex]?.content
    if (currentQuiz?.concept_id) {
      await api.reviewConcept(userId, currentQuiz.concept_id, 0.3) // Low quality = review later
      // Silent action
      handleNext()
    }
  }

  const handleSkipTo = (offset) => {
    const targetIndex = currentIndex + offset
    if (targetIndex >= 0 && targetIndex < filteredFeed.length) {
      setCurrentIndex(targetIndex)
      setCurrentQuizAnswered(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Removed break reminder - too annoying

  // Apply filters
  useEffect(() => {
    let filtered = [...feed]
    
    if (quickReview) {
      filtered = failedQuestions.length > 0 ? failedQuestions : filtered
    }
    
    if (focusMode && userStats) {
      // Filter to weak areas (low mastery)
      filtered = filtered.filter(item => {
        const conceptId = item.content?.concept_id
        if (!conceptId) return true
        const mastery = userStats.concept_mastery[conceptId]
        const masteryValue = typeof mastery === 'object' ? mastery.mastery : mastery
        return masteryValue < 0.6
      })
    }
    
    setFilteredFeed(filtered)
    if (currentIndex >= filtered.length && filtered.length > 0) {
      setCurrentIndex(0)
    }
  }, [focusMode, quickReview, feed, failedQuestions, userStats])

  const completionPercentage = filteredFeed.length > 0 
    ? Math.round((answeredQuestions.length / filteredFeed.length) * 100)
    : 0

  const currentQuiz = filteredFeed[currentIndex]
  const sessionAccuracy = sessionStats.total > 0
    ? Math.round((sessionStats.correct / sessionStats.total) * 100)
    : 0

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <>
        <NavigationHeader />
        <div className="feed-loading">
          <Loader className="spinner" size={48} />
          <h3>Loading Your Questions</h3>
          <p>Preparing personalized learning experience...</p>
        </div>
      </>
    )
  }

  return (
    <>
      <NavigationHeader />
      
      {/* Workload Summary Banner - Shows when feed loads */}
      {!loading && feed.length > 0 && !showQuickActions && (
        <div className="workload-summary-banner">
          <div className="workload-content">
            <div className="workload-stats">
              <div className="workload-stat">
                <BookOpen size={20} />
                <div>
                  <div className="stat-value">{feed.length}</div>
                  <div className="stat-label">Questions</div>
                </div>
              </div>
              <div className="workload-stat">
                <Target size={20} />
                <div>
                  <div className="stat-value">{concepts.length}</div>
                  <div className="stat-label">Concepts</div>
                </div>
              </div>
              <div className="workload-stat">
                <Clock size={20} />
                <div>
                  <div className="stat-value">{Math.ceil(feed.length * 1.5)}</div>
                  <div className="stat-label">Est. Minutes</div>
                </div>
              </div>
            </div>
            <div className="workload-actions">
              <button 
                className="workload-action-btn"
                onClick={() => setShowStudyGuide(true)}
              >
                <FileText size={18} />
                Study Guide
              </button>
              <button 
                className="workload-action-btn"
                onClick={() => setShowFocusedAreas(true)}
              >
                <Target size={18} />
                Focus Areas
              </button>
              <button 
                className="workload-action-btn"
                onClick={() => navigate('/tutor')}
              >
                <GraduationCap size={18} />
                AI Tutor
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Focused Mode Overlay - Fixed */}
      {focusedMode && (
        <>
          <div className="focused-mode-overlay" onClick={() => setFocusedMode(false)} />
          <div className="focused-mode-content">
            <div className="focused-mode-header">
              <h3>🎯 Focused Mode</h3>
              <button onClick={() => setFocusedMode(false)} className="exit-focused-btn">
                Exit
              </button>
            </div>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '0.9375rem' }}>
              Distraction-free study environment. Press ESC to exit.
            </p>
          </div>
        </>
      )}

      <div className={`feed-focused-container ${compactMode ? 'compact' : ''} ${minimalistMode ? 'minimalist' : ''} ${focusedMode ? 'focused' : ''}`}>
        {/* Top Progress Bar */}
        <div className="top-progress-bar">
          <div className="progress-left">
            <div className="progress-ring-wrapper">
              <CircularProgress 
                percentage={completionPercentage} 
                size={60}
                strokeWidth={6}
              >
                <span className="progress-number">{currentIndex + 1}</span>
              </CircularProgress>
            </div>
            <div className="progress-info">
              <div className="progress-text">
                <span className="progress-label">Question {currentIndex + 1} of {filteredFeed.length}</span>
                <span className="progress-percentage">{completionPercentage}% Complete</span>
              </div>
              <div className="progress-bar-main">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </div>
          
          <div className="progress-right">
            {/* Session Timer */}
            <div className="session-timer-card">
              <Clock size={18} />
              <div>
                <div className="timer-value">{formatTime(sessionTimer)}</div>
                {estimatedTimeRemaining > 0 && (
                  <div className="timer-estimate">~{formatTime(estimatedTimeRemaining)} left</div>
                )}
              </div>
            </div>

            {/* Streak Counter */}
            {sessionStats.streak > 0 && (
              <div className="streak-counter-card">
                <Flame size={18} />
                <span>{sessionStats.streak} in a row 🔥</span>
              </div>
            )}

            {/* Questions Answered */}
            <div className="questions-counter-card">
              <Zap size={18} />
              <span>{sessionStats.total} answered</span>
            </div>

            {/* Social Proof */}
            <div className="social-proof-card">
              <Users size={18} />
              <span>{Math.floor(Math.random() * 50) + 10} studying today</span>
            </div>

            {/* Credits Display */}
            <CreditsDisplay userId={userId} compact={true} />

            {/* Controls */}
            <div className="progress-controls">
              <button 
                className={`control-btn focused-mode-btn ${focusedMode ? 'active' : ''}`}
                onClick={() => setFocusedMode(!focusedMode)}
                title="Focused Mode - Distraction-Free Study"
              >
                <Focus size={18} />
                <span>Focus</span>
              </button>
              <button 
                className={`control-btn ${showAIPersonalization ? 'active' : ''}`}
                onClick={() => setShowAIPersonalization(!showAIPersonalization)}
                title="AI Personalization Options"
              >
                <Wand2 size={18} />
                <span>AI</span>
              </button>
              <button 
                className={`control-btn ${focusMode ? 'active' : ''}`}
                onClick={() => setFocusMode(!focusMode)}
                title="Focus Mode - Weak Areas Only"
              >
                <Target size={18} />
              </button>
              <button 
                className={`control-btn ${quickReview ? 'active' : ''}`}
                onClick={() => setQuickReview(!quickReview)}
                title="Quick Review - Missed Questions"
              >
                <RotateCcw size={18} />
              </button>
              <button 
                className={`control-btn ${compactMode ? 'active' : ''}`}
                onClick={() => setCompactMode(!compactMode)}
                title="Compact Mode"
              >
                {compactMode ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* AI Personalization Panel */}
        {showAIPersonalization && (
          <div className="ai-personalization-panel">
            <div className="panel-header">
              <Wand2 size={20} />
              <h3>AI Personalization</h3>
              <button onClick={() => setShowAIPersonalization(false)}>×</button>
            </div>
            <div className="panel-content">
              <div className="personalization-option">
                <label>
                  <input 
                    type="checkbox" 
                    checked={focusMode}
                    onChange={(e) => setFocusMode(e.target.checked)}
                  />
                  Focus on weak areas only
                </label>
              </div>
              <div className="personalization-option">
                <label>
                  <input 
                    type="checkbox" 
                    checked={quickReview}
                    onChange={(e) => setQuickReview(e.target.checked)}
                  />
                  Quick review mode (missed questions)
                </label>
              </div>
              <div className="personalization-option">
                <label>
                  Difficulty Preference:
                  <select 
                    value={difficultyLevel}
                    onChange={(e) => setDifficultyLevel(e.target.value)}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="adaptive">Adaptive</option>
                  </select>
                </label>
              </div>
              {!learningStyle && (
                <button 
                  className="assess-learning-style-btn"
                  onClick={async () => {
                    const data = await api.getLearningStyleQuestionnaire(userId)
                    alert('Learning style assessment coming soon!')
                  }}
                >
                  Assess Learning Style
                </button>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions Panel - Appears after upload */}
        {showQuickActions && (
          <div className="quick-actions-panel">
            <div className="quick-actions-header">
              <Sparkles size={20} />
              <h3>Your Study Materials Are Ready!</h3>
              <button onClick={() => setShowQuickActions(false)}>×</button>
            </div>
            <div className="quick-actions-grid">
              <button 
                className="quick-action-card"
                onClick={() => {
                  setShowStudyGuide(true)
                  setShowQuickActions(false)
                }}
              >
                <FileText size={24} />
                <span>Study Guide</span>
                <p>Generate comprehensive guide</p>
              </button>
              <button 
                className="quick-action-card"
                onClick={() => {
                  setShowFocusedAreas(true)
                  setShowQuickActions(false)
                }}
              >
                <Target size={24} />
                <span>Focus Areas</span>
                <p>See weak concepts</p>
              </button>
              <button 
                className="quick-action-card"
                onClick={() => navigate('/tutor')}
              >
                <GraduationCap size={24} />
                <span>AI Tutor</span>
                <p>Get explanations</p>
              </button>
              <button 
                className="quick-action-card"
                onClick={() => navigate('/flashcards')}
              >
                <BookOpen size={24} />
                <span>Flashcards</span>
                <p>Review concepts</p>
              </button>
            </div>
          </div>
        )}

        {/* Study Guide Section */}
        {showStudyGuide && (
          <div className="study-guide-section">
            <div className="section-header">
              <h2>Study Guide</h2>
              <button onClick={() => setShowStudyGuide(false)}>Close</button>
            </div>
            <StudyGuideGenerator 
              uploadId={uploadId}
              concepts={concepts}
              onGenerate={(guide) => {
                console.log('Study guide generated:', guide)
              }}
            />
          </div>
        )}

        {/* Focused Areas Section */}
        {showFocusedAreas && (
          <div className="focused-areas-section">
            <div className="section-header">
              <h2>Areas to Focus</h2>
              <button onClick={() => setShowFocusedAreas(false)}>Close</button>
            </div>
            <FocusedAreas 
              userStats={userStats}
              concepts={concepts}
              onFocusArea={(conceptId) => {
                // Filter feed to this concept
                const filtered = feed.filter(item => 
                  item.content?.concept_id === conceptId
                )
                setFilteredFeed(filtered)
                setCurrentIndex(0)
                setShowFocusedAreas(false)
              }}
            />
          </div>
        )}

        {/* Insights Section - Integrated into Feed */}
        {showInsights && insights && (
          <div className="insights-section">
            <div className="section-header">
              <h2>Study Insights</h2>
              <button onClick={() => setShowInsights(false)}>Close</button>
            </div>
            <div className="insights-content">
              {/* Learning Velocity */}
              <div className="insight-card velocity-card">
                <div className="card-header">
                  <TrendingUp size={24} />
                  <h3>Learning Velocity</h3>
                </div>
                <div className="velocity-content">
                  <div className="velocity-value">
                    {insights.learningVelocity.value.toFixed(1)}
                    <span className="velocity-unit">questions/day</span>
                  </div>
                  <div className={`velocity-trend ${insights.learningVelocity.trend}`}>
                    {insights.learningVelocity.trend === 'increasing' && <TrendingUp size={20} />}
                    {insights.learningVelocity.message}
                  </div>
                </div>
              </div>

              {/* Optimal Study Time */}
              <div className="insight-card time-card">
                <div className="card-header">
                  <Clock size={24} />
                  <h3>Optimal Study Time</h3>
                </div>
                <div className="time-slots">
                  <div className={`time-slot ${insights.optimalStudyTime.morning.active ? 'active' : ''}`}>
                    <span className="time-label">Morning</span>
                    <div className="time-score">{insights.optimalStudyTime.morning.score}%</div>
                  </div>
                  <div className={`time-slot ${insights.optimalStudyTime.afternoon.active ? 'active' : ''}`}>
                    <span className="time-label">Afternoon</span>
                    <div className="time-score">{insights.optimalStudyTime.afternoon.score}%</div>
                  </div>
                  <div className={`time-slot ${insights.optimalStudyTime.evening.active ? 'active' : ''}`}>
                    <span className="time-label">Evening</span>
                    <div className="time-score">{insights.optimalStudyTime.evening.score}%</div>
                  </div>
                </div>
                <p className="time-recommendation">{insights.optimalStudyTime.recommendation}</p>
              </div>

              {/* Recommendations */}
              <div className="insight-card recommendations-card">
                <div className="card-header">
                  <Lightbulb size={24} />
                  <div className="header-title-group">
                    <h3>Personalized Recommendations</h3>
                    <span className="rec-count">{insights.recommendations.length} suggestions</span>
                  </div>
                </div>
                
                {/* Personalization Info Banner */}
                <div className="personalization-info-banner">
                  <div className="info-icon">
                    <Sparkles size={18} />
                  </div>
                  <div className="info-content">
                    <div className="info-title">How Recommendations Are Personalized</div>
                    <div className="info-factors">
                      <div className="factor-item">
                        <Target size={16} />
                        <span>User accuracy & performance</span>
                      </div>
                      <div className="factor-item">
                        <Clock size={16} />
                        <span>Study session length & pace</span>
                      </div>
                      <div className="factor-item">
                        <TrendingUp size={16} />
                        <span>Concept mastery levels</span>
                      </div>
                      <div className="factor-item">
                        <Flame size={16} />
                        <span>Current streaks & habits</span>
                      </div>
                      <div className="factor-item">
                        <BookOpen size={16} />
                        <span>Available features & content</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="recommendations-list">
                  {insights.recommendations.map((rec, index) => (
                    <div 
                      key={index} 
                      className={`recommendation-item ${rec.priority}`}
                      onClick={() => {
                        // Handle recommendation clicks
                        if (rec.type === 'study_guide') {
                          setShowStudyGuide(true)
                          setShowInsights(false)
                        } else if (rec.type === 'weak_areas') {
                          setShowFocusedAreas(true)
                          setShowInsights(false)
                        } else if (rec.type === 'ai_tutor') {
                          navigate('/tutor')
                        } else if (rec.type === 'flashcards') {
                          navigate('/flashcards')
                        }
                      }}
                    >
                      <div className="rec-icon">{rec.icon}</div>
                      <div className="rec-content">
                        <div className="rec-header-row">
                          <h4>{rec.title}</h4>
                          <span className={`priority-badge ${rec.priority}`}>
                            {rec.priority === 'high' ? 'High' : rec.priority === 'medium' ? 'Medium' : 'Low'}
                          </span>
                        </div>
                        <p>{rec.message}</p>
                        {(rec.type === 'study_guide' || rec.type === 'weak_areas' || rec.type === 'ai_tutor' || rec.type === 'flashcards') && (
                          <button className="rec-action-btn">
                            {rec.type === 'study_guide' && 'Generate Guide →'}
                            {rec.type === 'weak_areas' && 'View Areas →'}
                            {rec.type === 'ai_tutor' && 'Open Tutor →'}
                            {rec.type === 'flashcards' && 'View Flashcards →'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="feed-content-focused">
          {currentQuiz && currentQuiz.content ? (
            <AdvancedQuizInterface
              quiz={currentQuiz.content}
              sourceContent={currentQuiz.content.source_text || 'Source material from your uploaded documents.'}
              onAnswer={handleAnswerSelect}
              conceptName={currentQuiz.content.concept_name || 'Learning Concept'}
              totalQuestions={filteredFeed.length}
              currentQuestion={currentIndex + 1}
              userStats={userStats}
              userId={userId}
              compactMode={compactMode}
              minimalistMode={minimalistMode}
              hideNavUntilReady={hideNavUntilReady}
              showHint={showHint}
              confidenceLevel={confidenceLevel}
              difficultyLevel={difficultyLevel}
              quickActions={{
                onMarkAsKnown: handleMarkAsKnown,
                onTooEasy: handleTooEasy,
                onReviewLater: handleReviewLater,
                onShowHint: () => setShowHint(!showHint)
              }}
            />
          ) : (
            <div className="quiz-error">
              <p>No more questions available. Great job!</p>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        {!hideNavUntilReady || currentQuizAnswered ? (
          <div className="feed-nav-focused">
            {/* Mini-map */}
            <QuestionMiniMap
              questions={filteredFeed}
              currentIndex={currentIndex}
              answeredQuestions={answeredQuestions}
              onNavigate={(index) => {
                setCurrentIndex(index)
                setCurrentQuizAnswered(false)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            />

            {/* Navigation Buttons */}
            <div className="nav-buttons-group">
              <button
                onClick={handlePrevious}
                className="nav-btn nav-btn-prev"
                disabled={currentIndex === 0}
              >
                <ChevronLeft size={20} />
                <span>Previous</span>
              </button>

              <div className="skip-buttons-group">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleSkipTo(num)}
                    className="skip-btn"
                    disabled={currentIndex + num >= filteredFeed.length}
                  >
                    +{num}
                  </button>
                ))}
              </div>

              <button 
                onClick={handleNext}
                className={`nav-btn nav-btn-next ${!currentQuizAnswered ? 'disabled' : ''}`}
                disabled={!currentQuizAnswered || currentIndex >= filteredFeed.length - 1}
              >
                <span>{currentIndex < filteredFeed.length - 1 ? 'Next' : 'Finish'}</span>
                {currentIndex < filteredFeed.length - 1 ? <ChevronRight size={20} /> : <Sparkles size={20} />}
              </button>
            </div>
          </div>
        ) : (
          <div className="answer-prompt-minimal">
            <Lightbulb size={18} />
            <span>Answer the question to continue</span>
          </div>
        )}
      </div>

      {/* AI Chat Sidebar */}
      <AIChatSidebar 
        userId={userId}
        uploadId={uploadId}
        currentConcept={currentQuiz?.content?.concept_name || null}
      />

      <style>{`
        .feed-focused-container {
          min-height: 100vh;
          padding-top: 140px;
          padding-right: 380px;
          padding-left: 0;
          background: var(--color-bg-primary);
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
          position: relative;
        }

        .feed-focused-container.compact {
          padding-top: 120px;
        }

        .feed-focused-container.minimalist {
          padding-top: 100px;
        }

        @media (max-width: 1200px) {
          .feed-focused-container {
            padding-right: 360px;
          }
        }

        @media (max-width: 768px) {
          .feed-focused-container {
            padding-right: 0;
            padding-bottom: 50vh;
          }
        }

        .top-progress-bar {
          position: fixed;
          top: 70px;
          left: 0;
          right: 0;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 1.25rem 2rem;
          z-index: 999;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .progress-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .progress-ring-wrapper {
          position: relative;
        }

        .circular-progress-wrapper {
          position: relative;
        }

        .progress-number {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 1rem;
          font-weight: 700;
          color: var(--color-text-primary);
        }

        .circular-progress-content {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .circular-progress-svg {
          transform: rotate(-90deg);
        }

        .circular-progress-bg {
          fill: none;
          stroke: var(--color-bg-card);
          stroke-width: 6;
        }

        .circular-progress-fill {
          fill: none;
          stroke: url(#progressGradient);
          stroke-width: 6;
          stroke-linecap: round;
          transition: stroke-dashoffset 0.3s ease;
        }

        .progress-info {
          flex: 1;
          min-width: 200px;
        }

        .progress-text {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        }

        .progress-label {
          color: var(--color-text-primary);
          font-weight: 600;
        }

        .progress-percentage {
          color: var(--color-text-secondary);
        }

        .progress-bar-main {
          height: 6px;
          background: var(--color-bg-card);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--color-gradient-start) 0%, var(--color-gradient-end) 100%);
          transition: width 0.3s ease;
        }

        .progress-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .session-timer-card,
        .streak-counter-card,
        .questions-counter-card,
        .social-proof-card {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          color: var(--color-text-primary);
        }

        .session-timer-card svg,
        .streak-counter-card svg,
        .questions-counter-card svg,
        .social-proof-card svg {
          color: var(--color-primary);
        }

        .timer-value {
          font-weight: 700;
          font-size: 1rem;
        }

        .timer-estimate {
          font-size: 0.75rem;
          color: var(--color-text-tertiary);
          margin-top: 0.25rem;
        }

        .streak-counter-card {
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.2) 100%);
          border-color: rgba(251, 191, 36, 0.3);
        }

        .streak-counter-card svg {
          color: #fbbf24;
        }

        .ai-personalization-panel {
          position: fixed;
          top: 80px;
          right: 20px;
          width: 320px;
          background: var(--color-card-bg);
          border: 2px solid rgba(102, 126, 234, 0.3);
          border-radius: 16px;
          padding: 1.5rem;
          z-index: 1000;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          animation: slideInRight 0.3s ease;
        }

        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .panel-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .panel-header h3 {
          flex: 1;
          margin: 0;
          font-size: 1.125rem;
          color: var(--color-text-primary);
        }

        .panel-header button {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .panel-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .personalization-option {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .personalization-option label {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--color-text-primary);
          font-size: 0.9375rem;
        }

        .personalization-option input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .personalization-option select {
          margin-top: 0.5rem;
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: white;
          cursor: pointer;
        }

        .assess-learning-style-btn {
          width: 100%;
          padding: 0.875rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 8px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          margin-top: 0.5rem;
        }

        .progress-controls {
          display: flex;
          gap: 0.5rem;
        }

        .control-btn {
          padding: 0.5rem;
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: all 0.2s;
        }

        .control-btn:hover {
          background: var(--color-button-hover);
          border-color: var(--color-border-hover);
          color: var(--color-text-primary);
        }

        .control-btn.active {
          background: linear-gradient(135deg, var(--color-gradient-start) 0%, var(--color-gradient-end) 100%);
          border-color: transparent;
          color: white;
        }

        .feed-content-focused {
          flex: 1;
          padding: 120px 2rem 100px;
          max-width: 1000px;
          margin: 0 auto;
          width: 100%;
          min-height: calc(100vh - 200px);
        }

        .feed-content-focused.compact {
          padding: 90px 0.75rem 90px;
        }

        .question-minimap {
          padding: 0.5rem 1rem;
          background: var(--color-bg-secondary);
          border-top: 1px solid var(--color-border);
          margin-top: 0.25rem;
        }

        .minimap-scroll {
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
          padding: 0.25rem 0;
          justify-content: center;
        }

        .minimap-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid var(--color-border);
          background: var(--color-bg-card);
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .minimap-dot.current {
          width: 16px;
          height: 16px;
          background: linear-gradient(135deg, var(--color-gradient-start) 0%, var(--color-gradient-end) 100%);
          border-color: transparent;
          box-shadow: 0 0 8px rgba(74, 144, 226, 0.5);
        }

        .minimap-dot.answered {
          background: var(--color-success);
          border-color: var(--color-success);
        }

        .minimap-dot.missed {
          background: var(--color-error);
          border-color: var(--color-error);
        }

        .feed-nav-focused {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: var(--color-bg-secondary);
          border-top: 1px solid var(--color-border);
          z-index: 998;
        }

        .nav-buttons-group {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 0.875rem 1.5rem;
        }

        .nav-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: var(--color-button-bg);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          color: var(--color-text-primary);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .nav-btn:hover:not(:disabled) {
          background: var(--color-button-hover);
          border-color: var(--color-border-hover);
          transform: translateY(-1px);
        }

        .nav-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .nav-btn-next.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .skip-buttons-group {
          display: flex;
          gap: 0.5rem;
        }

        .skip-btn {
          padding: 0.5rem 0.75rem;
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          color: var(--color-text-secondary);
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .skip-btn:hover:not(:disabled) {
          background: var(--color-button-hover);
          border-color: var(--color-border-hover);
          color: var(--color-text-primary);
        }

        .skip-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .answer-prompt-minimal {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 1rem;
          background: var(--color-bg-secondary);
          border-top: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          color: var(--color-text-secondary);
          font-size: 0.875rem;
        }

        /* Focused Mode Styles - Fixed */
        .focused-mode-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(8px);
          z-index: 9997;
          animation: fadeIn 0.3s ease;
          pointer-events: none;
        }

        .focused-mode-content {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: var(--color-card-bg);
          border: 2px solid rgba(102, 126, 234, 0.5);
          border-radius: 16px;
          padding: 2rem;
          max-width: 400px;
          text-align: center;
          z-index: 9999;
          pointer-events: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }

        .focused-mode-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .focused-mode-header h3 {
          margin: 0;
          color: var(--color-text-primary);
          font-size: 1.25rem;
        }

        .exit-focused-btn {
          padding: 0.5rem 1rem;
          background: rgba(102, 126, 234, 0.2);
          border: 1px solid rgba(102, 126, 234, 0.3);
          border-radius: 8px;
          color: white;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .exit-focused-btn:hover {
          background: rgba(102, 126, 234, 0.3);
        }

        .feed-focused-container.focused {
          filter: brightness(0.6) contrast(1.1);
        }

        .feed-focused-container.focused .top-progress-bar,
        .feed-focused-container.focused .feed-nav-focused,
        .feed-focused-container.focused .question-minimap {
          opacity: 0.3;
          pointer-events: none;
        }

        .feed-focused-container.focused .feed-content-focused {
          filter: brightness(1.2);
          position: relative;
          z-index: 9998;
        }

        .focused-mode-btn.active {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%);
          border-color: #667eea;
          box-shadow: 0 0 20px rgba(102, 126, 234, 0.5);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .workload-summary-banner {
          position: fixed;
          top: 70px;
          left: 0;
          right: 0;
          background: linear-gradient(135deg, rgba(26, 29, 43, 0.98) 0%, rgba(37, 40, 56, 0.98) 100%);
          border-bottom: 2px solid rgba(74, 144, 226, 0.3);
          padding: 1rem 2rem;
          z-index: 999;
          backdrop-filter: blur(20px);
          animation: slideDown 0.3s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .workload-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
        }

        .workload-stats {
          display: flex;
          gap: 2rem;
        }

        .workload-stat {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .workload-stat svg {
          color: #4A90E2;
        }

        .workload-stat .stat-value {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--color-text-primary);
          font-family: 'Space Grotesk', sans-serif;
        }

        .workload-stat .stat-label {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.7);
          text-transform: uppercase;
          font-weight: 600;
        }

        .workload-actions {
          display: flex;
          gap: 0.75rem;
        }

        .workload-action-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1.25rem;
          background: rgba(74, 144, 226, 0.15);
          border: 1px solid rgba(74, 144, 226, 0.3);
          border-radius: 8px;
          color: #4A90E2;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'Inter', sans-serif;
        }

        .workload-action-btn:hover {
          background: rgba(74, 144, 226, 0.25);
          border-color: rgba(74, 144, 226, 0.5);
          transform: translateY(-2px);
        }

        .quick-actions-panel {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: linear-gradient(135deg, rgba(26, 29, 43, 0.98) 0%, rgba(37, 40, 56, 0.98) 100%);
          border: 2px solid rgba(74, 144, 226, 0.5);
          border-radius: 20px;
          padding: 2rem;
          max-width: 700px;
          width: 90%;
          z-index: 10000;
          backdrop-filter: blur(20px);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          animation: scaleIn 0.3s ease;
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }

        .quick-actions-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid rgba(255, 255, 255, 0.1);
        }

        .quick-actions-header h3 {
          flex: 1;
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
          font-family: 'Space Grotesk', sans-serif;
          background: linear-gradient(135deg, #4A90E2 0%, #50E3C2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .quick-actions-header button {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.25rem 0.5rem;
          transition: color 0.2s ease;
        }

        .quick-actions-header button:hover {
          color: white;
        }

        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .quick-action-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(74, 144, 226, 0.2);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
        }

        .quick-action-card:hover {
          background: rgba(74, 144, 226, 0.15);
          border-color: rgba(74, 144, 226, 0.5);
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(74, 144, 226, 0.3);
        }

        .quick-action-card svg {
          color: #4A90E2;
        }

        .quick-action-card span {
          font-weight: 700;
          font-size: 1rem;
          color: var(--color-text-primary);
          font-family: 'Space Grotesk', sans-serif;
        }

        .quick-action-card p {
          margin: 0;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .study-guide-section,
        .focused-areas-section,
        .insights-section {
          max-width: 1000px;
          margin: 0 auto 2rem;
          padding: 0 2rem;
          animation: fadeIn 0.3s ease;
        }

        .insights-content {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .insight-card {
          background: linear-gradient(135deg, rgba(26, 29, 43, 0.95) 0%, rgba(37, 40, 56, 0.95) 100%);
          border: 2px solid rgba(74, 144, 226, 0.2);
          border-radius: 16px;
          padding: 2rem;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .insight-card:hover {
          border-color: rgba(74, 144, 226, 0.4);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        }

        .insight-card .card-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .insight-card .card-header svg {
          color: #4A90E2;
        }

        .insight-card .card-header h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
          color: var(--color-text-primary);
          font-family: 'Space Grotesk', sans-serif;
        }

        .velocity-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .velocity-value {
          font-size: 3rem;
          font-weight: 800;
          color: #4A90E2;
          font-family: 'Space Grotesk', sans-serif;
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
        }

        .velocity-unit {
          font-size: 1rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.7);
        }

        .velocity-trend {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.9375rem;
          font-weight: 600;
        }

        .velocity-trend.increasing {
          background: rgba(80, 227, 194, 0.15);
          color: #50E3C2;
        }

        .velocity-trend.stable {
          background: rgba(74, 144, 226, 0.15);
          color: #4A90E2;
        }

        .velocity-trend.improving {
          background: rgba(255, 217, 61, 0.15);
          color: #FFD93D;
        }

        .time-slots {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .time-slot {
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          text-align: center;
          transition: all 0.3s ease;
        }

        .time-slot.active {
          background: rgba(74, 144, 226, 0.15);
          border-color: #4A90E2;
        }

        .time-label {
          display: block;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 0.5rem;
          font-weight: 600;
        }

        .time-score {
          font-size: 1.75rem;
          font-weight: 800;
          color: #4A90E2;
          font-family: 'Space Grotesk', sans-serif;
        }

        .time-recommendation {
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.9375rem;
          line-height: 1.6;
          margin: 0;
        }

        .recommendations-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .recommendation-item {
          display: flex;
          gap: 1rem;
          padding: 1.25rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          border-left: 4px solid transparent;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .recommendation-item:hover {
          background: rgba(255, 255, 255, 0.08);
          transform: translateX(4px);
        }

        .recommendation-item.high {
          border-left-color: #FF6B6B;
        }

        .recommendation-item.medium {
          border-left-color: #FFD93D;
        }

        .recommendation-item.low {
          border-left-color: #50E3C2;
        }

        .rec-icon {
          flex-shrink: 0;
          color: #4A90E2;
        }

        .rec-content {
          flex: 1;
        }

        .rec-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          gap: 0.75rem;
        }

        .rec-content h4 {
          font-size: 1.125rem;
          font-weight: 700;
          margin: 0;
          color: var(--color-text-primary);
          font-family: 'Space Grotesk', sans-serif;
        }

        .priority-badge {
          padding: 0.25rem 0.625rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          font-family: 'Inter', sans-serif;
        }

        .priority-badge.high {
          background: rgba(255, 107, 107, 0.2);
          color: #FF6B6B;
        }

        .priority-badge.medium {
          background: rgba(255, 217, 61, 0.2);
          color: #FFD93D;
        }

        .priority-badge.low {
          background: rgba(80, 227, 194, 0.2);
          color: #50E3C2;
        }

        .rec-content p {
          margin: 0 0 0.75rem 0;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.9375rem;
          line-height: 1.6;
        }

        .rec-action-btn {
          padding: 0.5rem 1rem;
          background: rgba(74, 144, 226, 0.15);
          border: 1px solid rgba(74, 144, 226, 0.3);
          border-radius: 6px;
          color: #4A90E2;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'Inter', sans-serif;
        }

        .rec-action-btn:hover {
          background: rgba(74, 144, 226, 0.25);
          border-color: rgba(74, 144, 226, 0.5);
        }

        .rec-count {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.6);
          font-weight: 500;
        }

        .header-title-group {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .personalization-info-banner {
          display: flex;
          gap: 1rem;
          padding: 1.25rem;
          background: linear-gradient(135deg, rgba(74, 144, 226, 0.1) 0%, rgba(80, 227, 194, 0.1) 100%);
          border: 2px solid rgba(74, 144, 226, 0.2);
          border-radius: 12px;
          margin-bottom: 1.5rem;
          transition: all 0.3s ease;
        }

        .personalization-info-banner:hover {
          border-color: rgba(74, 144, 226, 0.4);
          background: linear-gradient(135deg, rgba(74, 144, 226, 0.15) 0%, rgba(80, 227, 194, 0.15) 100%);
        }

        .info-icon {
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(74, 144, 226, 0.2) 0%, rgba(80, 227, 194, 0.2) 100%);
          border-radius: 10px;
          color: #4A90E2;
        }

        .info-content {
          flex: 1;
        }

        .info-title {
          font-size: 0.9375rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin-bottom: 0.75rem;
          font-family: 'Space Grotesk', sans-serif;
        }

        .info-factors {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 0.75rem;
        }

        .factor-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.8);
          transition: all 0.2s ease;
        }

        .factor-item:hover {
          background: rgba(255, 255, 255, 0.08);
          transform: translateX(2px);
        }

        .factor-item svg {
          flex-shrink: 0;
          color: #50E3C2;
        }

        @media (max-width: 768px) {
          .info-factors {
            grid-template-columns: 1fr;
          }
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .section-header h2 {
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0;
          font-family: 'Space Grotesk', sans-serif;
          background: linear-gradient(135deg, #4A90E2 0%, #50E3C2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .section-header button {
          padding: 0.625rem 1.25rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'Inter', sans-serif;
        }

        .section-header button:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .feed-loading {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding-top: 80px;
        }

        .spinner {
          animation: spin 1s linear infinite;
          color: var(--color-primary);
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .top-progress-bar {
            flex-direction: column;
            gap: 1rem;
            padding: 1rem;
          }

          .progress-right {
            flex-wrap: wrap;
            justify-content: center;
          }

          .feed-content-focused {
            padding: 180px 1rem 140px;
          }

          .nav-buttons-group {
            flex-direction: column;
            gap: 0.75rem;
          }

          .skip-buttons-group {
            flex-wrap: wrap;
            justify-content: center;
          }
        }
      `}</style>
    </>
  )
}
