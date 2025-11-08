import React, { useState, useEffect } from 'react'
import { api } from '../services/api'
import { NavigationHeader } from '../components/NavigationHeader'
import { AIChatAssistant } from '../components/AIChatAssistant'
import { TrendingUp, Target, Zap, Award, Calendar, BarChart3, Activity, 
         Clock, AlertCircle, TrendingDown, Sparkles, Brain } from 'lucide-react'

export const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null)
  const [advancedAnalytics, setAdvancedAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview') // overview, trends, weak-areas
  const userId = 'demo_user_123'

  useEffect(() => {
    loadAnalytics()
    loadAdvancedAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      const data = await api.getAnalytics(userId)
      setAnalytics(data)
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAdvancedAnalytics = async () => {
    try {
      const data = await api.getAdvancedAnalytics(userId)
      setAdvancedAnalytics(data)
    } catch (error) {
      console.error('Failed to load advanced analytics:', error)
    }
  }

  if (loading) {
    return (
      <>
        <NavigationHeader />
        <div className="loading-container">
          <BarChart3 className="spinner" size={48} />
          <p>Loading analytics...</p>
        </div>
      </>
    )
  }

  if (!analytics) {
    return (
      <>
        <NavigationHeader />
        <div className="empty-analytics">
          <p>No analytics data available</p>
        </div>
      </>
    )
  }

  const stats = analytics?.overall_stats || {}
  const masteryLevels = analytics?.mastery_levels || {}
  const studyHabits = analytics?.study_habits || {}
  const trends = advancedAnalytics?.trends || {}
  const weakAreas = advancedAnalytics?.weak_areas || {}
  const heatmap = advancedAnalytics?.heatmap || {}
  const studyTime = advancedAnalytics?.optimal_study_time || {}

  return (
    <>
      <NavigationHeader />
      <div className="analytics-page">
        <div className="analytics-header">
          <BarChart3 size={40} />
          <div>
            <h1>Advanced Learning Analytics</h1>
            <p>Comprehensive insights into your learning journey</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="analytics-tabs">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <BarChart3 size={18} />
            Overview
          </button>
          <button 
            className={`tab-btn ${activeTab === 'trends' ? 'active' : ''}`}
            onClick={() => setActiveTab('trends')}
          >
            <TrendingUp size={18} />
            Trends
          </button>
          <button 
            className={`tab-btn ${activeTab === 'weak-areas' ? 'active' : ''}`}
            onClick={() => setActiveTab('weak-areas')}
          >
            <AlertCircle size={18} />
            Weak Areas
          </button>
          <button 
            className={`tab-btn ${activeTab === 'heatmap' ? 'active' : ''}`}
            onClick={() => setActiveTab('heatmap')}
          >
            <Calendar size={18} />
            Activity
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
        {/* Overall Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card primary">
            <div className="stat-icon">
              <TrendingUp size={32} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.ability || 0}</div>
              <div className="stat-label">Ability Level</div>
            </div>
          </div>

          <div className="stat-card success">
            <div className="stat-icon">
              <Target size={32} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.accuracy || 0}%</div>
              <div className="stat-label">Accuracy</div>
            </div>
          </div>

          <div className="stat-card info">
            <div className="stat-icon">
              <Zap size={32} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.current_streak || 0}</div>
              <div className="stat-label">Day Streak</div>
            </div>
          </div>

          <div className="stat-card award">
            <div className="stat-icon">
              <Award size={32} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.concepts_mastered || 0}</div>
              <div className="stat-label">Concepts Mastered</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Activity size={32} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.total_questions || 0}</div>
              <div className="stat-label">Questions Answered</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Award size={32} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.achievements_count || 0}</div>
              <div className="stat-label">Achievements</div>
            </div>
          </div>
        </div>

        {/* Mastery Breakdown */}
        <div className="analytics-section">
          <h2>Concept Mastery Breakdown</h2>
          <div className="mastery-breakdown">
            <div className="mastery-item mastered">
              <div className="mastery-header">
                <span className="mastery-label">Mastered</span>
                <span className="mastery-count">{masteryLevels.mastered || 0}</span>
              </div>
              <div className="mastery-bar">
                <div 
                  className="mastery-fill mastered"
                  style={{ 
                    width: `${((masteryLevels.mastered || 0) / Math.max(1, (masteryLevels.mastered || 0) + (masteryLevels.learning || 0) + (masteryLevels.struggling || 0))) * 100}%` 
                  }}
                />
              </div>
            </div>

            <div className="mastery-item learning">
              <div className="mastery-header">
                <span className="mastery-label">Learning</span>
                <span className="mastery-count">{masteryLevels.learning || 0}</span>
              </div>
              <div className="mastery-bar">
                <div 
                  className="mastery-fill learning"
                  style={{ 
                    width: `${((masteryLevels.learning || 0) / Math.max(1, (masteryLevels.mastered || 0) + (masteryLevels.learning || 0) + (masteryLevels.struggling || 0))) * 100}%` 
                  }}
                />
              </div>
            </div>

            <div className="mastery-item struggling">
              <div className="mastery-header">
                <span className="mastery-label">Struggling</span>
                <span className="mastery-count">{masteryLevels.struggling || 0}</span>
              </div>
              <div className="mastery-bar">
                <div 
                  className="mastery-fill struggling"
                  style={{ 
                    width: `${((masteryLevels.struggling || 0) / Math.max(1, (masteryLevels.mastered || 0) + (masteryLevels.learning || 0) + (masteryLevels.struggling || 0))) * 100}%` 
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Study Habits */}
        <div className="analytics-section">
          <h2>Study Habits</h2>
          <div className="habits-grid">
            <div className="habit-card">
              <Calendar size={24} />
              <div>
                <div className="habit-value">{studyHabits.total_study_days || 0}</div>
                <div className="habit-label">Total Study Days</div>
              </div>
            </div>
            <div className="habit-card">
              <Zap size={24} />
              <div>
                <div className="habit-value">{studyHabits.average_questions_per_day || 0}</div>
                <div className="habit-label">Avg Questions/Day</div>
              </div>
            </div>
            <div className="habit-card">
              <TrendingUp size={24} />
              <div>
                <div className="habit-value">
                  {Math.round((studyHabits.consistency_score || 0) * 100)}%
                </div>
                <div className="habit-label">Consistency Score</div>
              </div>
            </div>
          </div>
        </div>

        {/* Spaced Repetition Stats */}
        {analytics.spaced_repetition && (
          <div className="analytics-section">
            <h2>Spaced Repetition</h2>
            <div className="sr-stats">
              <div className="sr-stat">
                <span className="sr-value">{analytics.spaced_repetition.due_count || 0}</span>
                <span className="sr-label">Concepts Due for Review</span>
              </div>
              <div className="sr-stat">
                <span className="sr-value">{analytics.spaced_repetition.total_tracked || 0}</span>
                <span className="sr-label">Total Concepts Tracked</span>
              </div>
            </div>
          </div>
        )}

        {/* Optimal Study Time */}
        {studyTime.best_hour !== null && (
          <div className="analytics-section">
            <h2>Optimal Study Time</h2>
            <div className="study-time-card">
              <Clock size={32} />
              <div>
                <div className="study-time-value">{studyTime.best_hour}:00</div>
                <div className="study-time-label">Your peak learning hour</div>
                <div className="study-time-accuracy">{studyTime.best_accuracy}% accuracy at this time</div>
              </div>
            </div>
          </div>
        )}
          </>
        )}

        {/* Trends Tab */}
        {activeTab === 'trends' && trends.trends && (
          <div className="analytics-section">
            <h2>Performance Trends (Last 30 Days)</h2>
            <div className="trends-chart">
              {trends.trends.map((day, index) => (
                <div key={index} className="trend-day">
                  <div className="trend-bar-container">
                    <div 
                      className="trend-bar"
                      style={{ 
                        height: `${day.accuracy}%`,
                        backgroundColor: day.accuracy >= 80 ? '#10b981' : day.accuracy >= 60 ? '#667eea' : '#f59e0b'
                      }}
                    />
                  </div>
                  <div className="trend-label">{new Date(day.date).getDate()}</div>
                  <div className="trend-value">{day.accuracy}%</div>
                </div>
              ))}
            </div>
            <div className="trend-summary">
              <div className="summary-item">
                <span className="summary-label">Average Accuracy</span>
                <span className="summary-value">{Math.round(trends.average_accuracy || 0)}%</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Total Questions</span>
                <span className="summary-value">{trends.trends.reduce((sum, d) => sum + d.questions, 0)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Weak Areas Tab */}
        {activeTab === 'weak-areas' && weakAreas.weak_areas && (
          <div className="analytics-section">
            <h2>Weak Areas Analysis</h2>
            <p className="section-description">
              Focus on these {weakAreas.total_weak_areas} concepts to improve your overall mastery
            </p>
            <div className="weak-areas-list">
              {weakAreas.weak_areas.map((area, index) => (
                <div key={index} className="weak-area-card">
                  <div className="weak-area-header">
                    <div>
                      <h4>Concept {index + 1}</h4>
                      <div className="weak-area-stats">
                        <span className="stat-badge mastery">{area.mastery}% Mastery</span>
                        <span className="stat-badge accuracy">{area.accuracy}% Accuracy</span>
                        <span className="stat-badge questions">{area.questions_attempted} Questions</span>
                      </div>
                    </div>
                    <div className="improvement-needed">
                      <TrendingUp size={20} />
                      <span>+{area.improvement_needed}% needed</span>
                    </div>
                  </div>
                  <div className="mastery-progress-bar">
                    <div 
                      className="mastery-progress-fill"
                      style={{ width: `${area.mastery}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity Heatmap Tab */}
        {activeTab === 'heatmap' && heatmap.heatmap && (
          <div className="analytics-section">
            <h2>Activity Heatmap (Last 90 Days)</h2>
            <div className="heatmap-container">
              <div className="heatmap-grid">
                {Object.entries(heatmap.heatmap).slice(-90).map(([date, activities]) => {
                  const intensity = Math.min(activities / Math.max(heatmap.max_activities, 1), 1)
                  return (
                    <div
                      key={date}
                      className="heatmap-day"
                      style={{
                        backgroundColor: `rgba(102, 126, 234, ${intensity * 0.8 + 0.2})`,
                        opacity: activities > 0 ? 1 : 0.3
                      }}
                      title={`${date}: ${activities} activities`}
                    />
                  )
                })}
              </div>
              <div className="heatmap-legend">
                <span>Less</span>
                <div className="legend-gradient" />
                <span>More</span>
              </div>
            </div>
          </div>
        )}
      </div>
      <AIChatAssistant userId={userId} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');

        .analytics-page {
          min-height: 100vh;
          padding: 100px 2rem 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .loading-container, .empty-analytics {
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
          color: #667eea;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .analytics-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 3rem;
        }

        .analytics-header svg {
          color: #4A90E2;
        }

        .analytics-header h1 {
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

        .analytics-header p {
          color: rgba(255,255,255,0.7);
          margin: 0.5rem 0 0 0;
          font-size: 1rem;
          font-family: 'Inter', sans-serif;
        }

        .analytics-tabs {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 2rem;
          border-bottom: 2px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 0.5rem;
        }

        .tab-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          color: rgba(255, 255, 255, 0.7);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: -2px;
        }

        .tab-btn:hover {
          color: rgba(255, 255, 255, 0.9);
        }

        .tab-btn.active {
          color: #667eea;
          border-bottom-color: #667eea;
        }

        .section-description {
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 1.5rem;
          font-size: 0.9375rem;
        }

        .trends-chart {
          display: flex;
          align-items: flex-end;
          gap: 0.5rem;
          height: 300px;
          padding: 1rem;
          background: rgba(102, 126, 234, 0.05);
          border-radius: 12px;
          margin-bottom: 1.5rem;
          overflow-x: auto;
        }

        .trend-day {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          flex: 1;
          min-width: 40px;
        }

        .trend-bar-container {
          width: 100%;
          height: 200px;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }

        .trend-bar {
          width: 100%;
          min-height: 4px;
          border-radius: 4px 4px 0 0;
          transition: height 0.3s ease;
        }

        .trend-label {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .trend-value {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--color-text-primary);
        }

        .trend-summary {
          display: flex;
          gap: 2rem;
          padding: 1.5rem;
          background: rgba(102, 126, 234, 0.1);
          border-radius: 12px;
        }

        .summary-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .summary-label {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .summary-value {
          font-size: 1.5rem;
          font-weight: 800;
          color: #667eea;
        }

        .weak-areas-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .weak-area-card {
          background: rgba(239, 68, 68, 0.1);
          border: 2px solid rgba(239, 68, 68, 0.3);
          border-radius: 12px;
          padding: 1.5rem;
        }

        .weak-area-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .weak-area-header h4 {
          margin: 0 0 0.75rem 0;
          font-size: 1.125rem;
          color: var(--color-text-primary);
        }

        .weak-area-stats {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .stat-badge {
          padding: 0.375rem 0.75rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .stat-badge.mastery {
          color: #f59e0b;
        }

        .stat-badge.accuracy {
          color: #667eea;
        }

        .stat-badge.questions {
          color: rgba(255, 255, 255, 0.7);
        }

        .improvement-needed {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: rgba(239, 68, 68, 0.2);
          border-radius: 8px;
          color: #ef4444;
          font-weight: 700;
        }

        .mastery-progress-bar {
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
        }

        .mastery-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
          border-radius: 4px;
          transition: width 0.5s ease;
        }

        .study-time-card {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 2rem;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
          border: 2px solid rgba(102, 126, 234, 0.3);
          border-radius: 16px;
        }

        .study-time-card svg {
          color: #667eea;
        }

        .study-time-value {
          font-size: 3rem;
          font-weight: 800;
          color: #667eea;
          line-height: 1;
        }

        .study-time-label {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.7);
          margin-top: 0.5rem;
        }

        .study-time-accuracy {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.6);
          margin-top: 0.25rem;
        }

        .heatmap-container {
          padding: 1rem;
        }

        .heatmap-grid {
          display: grid;
          grid-template-columns: repeat(13, 1fr);
          gap: 0.25rem;
          margin-bottom: 1rem;
        }

        .heatmap-day {
          aspect-ratio: 1;
          border-radius: 4px;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .heatmap-day:hover {
          transform: scale(1.2);
          z-index: 10;
        }

        .heatmap-legend {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          justify-content: flex-end;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .legend-gradient {
          width: 200px;
          height: 12px;
          background: linear-gradient(90deg, rgba(102, 126, 234, 0.2) 0%, rgba(102, 126, 234, 1) 100%);
          border-radius: 6px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .stat-card {
          background: var(--color-card-bg);
          border: 2px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          padding: 1.5rem;
          display: flex;
          gap: 1rem;
          align-items: center;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        }

        .stat-card.primary {
          border-color: rgba(102, 126, 234, 0.5);
        }

        .stat-card.success {
          border-color: rgba(16, 185, 129, 0.5);
        }

        .stat-card.info {
          border-color: rgba(251, 191, 36, 0.5);
        }

        .stat-card.award {
          border-color: rgba(249, 115, 22, 0.5);
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          flex-shrink: 0;
        }

        .stat-card.primary .stat-icon {
          background: rgba(102, 126, 234, 0.2);
          color: #667eea;
        }

        .stat-card.success .stat-icon {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }

        .stat-card.info .stat-icon {
          background: rgba(251, 191, 36, 0.2);
          color: #fbbf24;
        }

        .stat-card.award .stat-icon {
          background: rgba(249, 115, 22, 0.2);
          color: #f97316;
        }

        .stat-content {
          flex: 1;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          line-height: 1;
          margin-bottom: 0.25rem;
          color: var(--color-text-light);
        }

        .stat-label {
          font-size: 0.875rem;
          color: rgba(255,255,255,0.7);
          font-weight: 600;
        }

        .analytics-section {
          background: var(--color-card-bg);
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 2rem;
          border: 2px solid rgba(255,255,255,0.1);
        }

        .analytics-section h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 1.5rem 0;
          color: var(--color-text-light);
        }

        .mastery-breakdown {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .mastery-item {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .mastery-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .mastery-label {
          font-weight: 600;
          color: var(--color-text-light);
        }

        .mastery-count {
          font-weight: 700;
          color: #667eea;
          font-size: 1.125rem;
        }

        .mastery-bar {
          width: 100%;
          height: 24px;
          background: rgba(255,255,255,0.1);
          border-radius: 12px;
          overflow: hidden;
        }

        .mastery-fill {
          height: 100%;
          border-radius: 12px;
          transition: width 1s ease;
        }

        .mastery-fill.mastered {
          background: linear-gradient(90deg, #10b981 0%, #059669 100%);
        }

        .mastery-fill.learning {
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        }

        .mastery-fill.struggling {
          background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
        }

        .habits-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
        }

        .habit-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: rgba(102, 126, 234, 0.1);
          border: 1px solid rgba(102, 126, 234, 0.3);
          border-radius: 12px;
        }

        .habit-card svg {
          color: #667eea;
        }

        .habit-value {
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--color-text-light);
        }

        .habit-label {
          font-size: 0.875rem;
          color: rgba(255,255,255,0.7);
        }

        .sr-stats {
          display: flex;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .sr-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1.5rem;
          background: rgba(102, 126, 234, 0.1);
          border-radius: 12px;
          border: 1px solid rgba(102, 126, 234, 0.3);
        }

        .sr-value {
          font-size: 2.5rem;
          font-weight: 800;
          color: #667eea;
        }

        .sr-label {
          font-size: 0.875rem;
          color: rgba(255,255,255,0.7);
          margin-top: 0.5rem;
          text-align: center;
        }

        @media (max-width: 768px) {
          .analytics-page {
            padding: 80px 1rem 1rem;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .sr-stats {
            flex-direction: column;
          }
        }
      `}</style>
    </>
  )
}

