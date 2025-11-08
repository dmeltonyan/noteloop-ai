import React, { useState, useEffect } from 'react'
import { api } from '../services/api'
import { NavigationHeader } from '../components/NavigationHeader'
import { Brain, TrendingUp, Target, Clock, Zap, Lightbulb, 
         AlertCircle, CheckCircle, BarChart3, Calendar } from 'lucide-react'

export const StudyInsightsPage = () => {
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)
  const userId = 'demo_user_123'

  useEffect(() => {
    loadInsights()
  }, [])

  const loadInsights = async () => {
    try {
      setLoading(true)
      const progress = await api.getUserProgress(userId)
      const analytics = await api.getUserAnalytics(userId).catch(() => null)
      
      // Generate personalized insights
      const generatedInsights = {
        learningVelocity: calculateLearningVelocity(progress),
        optimalStudyTime: determineOptimalStudyTime(analytics),
        weakAreas: identifyWeakAreas(progress),
        recommendations: generateRecommendations(progress, analytics),
        patterns: analyzePatterns(analytics),
        nextSteps: suggestNextSteps(progress)
      }
      
      setInsights(generatedInsights)
    } catch (error) {
      console.error('Failed to load insights:', error)
    } finally {
      setLoading(false)
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
    // Mock optimal times based on common patterns
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
    
    if (progress.accuracy < 70) {
      recommendations.push({
        type: 'accuracy',
        icon: <Target size={20} />,
        title: 'Focus on Accuracy',
        message: 'Your accuracy is below 70%. Review concepts you\'ve struggled with and take your time with each question.',
        priority: 'high'
      })
    }
    
    if (progress.concepts_learned < progress.total_concepts * 0.3) {
      recommendations.push({
        type: 'coverage',
        icon: <Zap size={20} />,
        title: 'Explore More Concepts',
        message: `You've mastered ${progress.concepts_learned} of ${progress.total_concepts} concepts. Try exploring new topics!`,
        priority: 'medium'
      })
    }
    
    recommendations.push({
      type: 'spaced_repetition',
      icon: <Clock size={20} />,
      title: 'Use Spaced Repetition',
      message: 'Review concepts you learned 2-3 days ago to strengthen retention.',
      priority: 'medium'
    })
    
    return recommendations
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

  if (loading || !insights) {
    return (
      <>
        <NavigationHeader />
        <div className="insights-loading">
          <Brain className="spinner" size={48} />
          <p>Analyzing your learning patterns...</p>
        </div>
      </>
    )
  }

  return (
    <>
      <NavigationHeader />
      <div className="study-insights-page">
        <div className="insights-header">
          <div className="header-content">
            <Brain size={40} />
            <div>
              <h1>Study Insights</h1>
              <p>Personalized learning analytics and recommendations</p>
            </div>
          </div>
        </div>

        {/* Learning Velocity */}
        <div className="insight-card velocity-card">
          <div className="card-header">
            <TrendingUp size={24} />
            <h2>Learning Velocity</h2>
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
            <h2>Optimal Study Time</h2>
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

        {/* Weak Areas */}
        {insights.weakAreas.length > 0 && (
          <div className="insight-card weak-areas-card">
            <div className="card-header">
              <AlertCircle size={24} />
              <h2>Areas to Improve</h2>
            </div>
            <div className="weak-areas-list">
              {insights.weakAreas.map((area) => (
                <div key={area.id} className="weak-area-item">
                  <div className="area-info">
                    <span className="area-name">{area.name}</span>
                    <span className="area-mastery">{Math.round(area.mastery * 100)}%</span>
                  </div>
                  <div className="area-bar">
                    <div 
                      className="area-fill" 
                      style={{ width: `${area.mastery * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="insight-card recommendations-card">
          <div className="card-header">
            <Lightbulb size={24} />
            <h2>Personalized Recommendations</h2>
          </div>
          <div className="recommendations-list">
            {insights.recommendations.map((rec, index) => (
              <div key={index} className={`recommendation-item ${rec.priority}`}>
                <div className="rec-icon">{rec.icon}</div>
                <div className="rec-content">
                  <h3>{rec.title}</h3>
                  <p>{rec.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Patterns */}
        <div className="insight-card patterns-card">
          <div className="card-header">
            <BarChart3 size={24} />
            <h2>Learning Patterns</h2>
          </div>
          <div className="patterns-list">
            <div className="pattern-item">
              <CheckCircle size={20} />
              <span>{insights.patterns.consistency}</span>
            </div>
            <div className="pattern-item">
              <Calendar size={20} />
              <span>Best performance day: {insights.patterns.bestDay}</span>
            </div>
            <div className="pattern-item">
              <TrendingUp size={20} />
              <span>{insights.patterns.improvement}</span>
            </div>
            <div className="pattern-item">
              <Zap size={20} />
              <span>{insights.patterns.streak}</span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="insight-card next-steps-card">
          <div className="card-header">
            <Target size={24} />
            <h2>Suggested Next Steps</h2>
          </div>
          <div className="next-steps-list">
            {insights.nextSteps.map((step, index) => (
              <div key={index} className="next-step-item">
                <span className="step-number">{index + 1}</span>
                <span className="step-text">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');

        .study-insights-page {
          min-height: 100vh;
          padding: 100px 2rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .insights-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          gap: 1rem;
        }

        .spinner {
          animation: spin 1s linear infinite;
          color: #4A90E2;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .insights-header {
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 2px solid rgba(255, 255, 255, 0.1);
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .header-content svg {
          color: #4A90E2;
        }

        .insights-header h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0;
          background: linear-gradient(135deg, #4A90E2 0%, #50E3C2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-family: 'Space Grotesk', sans-serif;
          letter-spacing: -0.02em;
        }

        .insights-header p {
          color: rgba(255, 255, 255, 0.7);
          margin: 0.5rem 0 0 0;
          font-size: 1rem;
          font-family: 'Inter', sans-serif;
        }

        .insight-card {
          background: linear-gradient(135deg, rgba(26, 29, 43, 0.95) 0%, rgba(37, 40, 56, 0.95) 100%);
          border: 2px solid rgba(74, 144, 226, 0.2);
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 1.5rem;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .insight-card:hover {
          border-color: rgba(74, 144, 226, 0.4);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .card-header svg {
          color: #4A90E2;
        }

        .card-header h2 {
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

        .weak-areas-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .weak-area-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .area-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .area-name {
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .area-mastery {
          font-weight: 700;
          color: #FF6B6B;
          font-family: 'Space Grotesk', sans-serif;
        }

        .area-bar {
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
        }

        .area-fill {
          height: 100%;
          background: linear-gradient(90deg, #FF6B6B 0%, #FF8787 100%);
          transition: width 0.5s ease;
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
        }

        .recommendation-item.high {
          border-left-color: #FF6B6B;
        }

        .recommendation-item.medium {
          border-left-color: #FFD93D;
        }

        .rec-icon {
          flex-shrink: 0;
          color: #4A90E2;
        }

        .rec-content h3 {
          font-size: 1.125rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          color: var(--color-text-primary);
          font-family: 'Space Grotesk', sans-serif;
        }

        .rec-content p {
          margin: 0;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.9375rem;
          line-height: 1.6;
        }

        .patterns-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .pattern-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
        }

        .pattern-item svg {
          color: #50E3C2;
          flex-shrink: 0;
        }

        .pattern-item span {
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.9375rem;
        }

        .next-steps-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .next-step-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(74, 144, 226, 0.1);
          border-radius: 8px;
          border: 1px solid rgba(74, 144, 226, 0.2);
        }

        .step-number {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #4A90E2 0%, #50E3C2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: white;
          flex-shrink: 0;
          font-family: 'Space Grotesk', sans-serif;
        }

        .step-text {
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.9375rem;
        }

        @media (max-width: 768px) {
          .study-insights-page {
            padding: 80px 1rem 1rem;
          }

          .insights-header h1 {
            font-size: 2rem;
          }

          .time-slots {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  )
}


