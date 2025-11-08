import React, { useState, useEffect } from 'react'
import { api } from '../services/api'
import { NavigationHeader } from '../components/NavigationHeader'
import { AIChatAssistant } from '../components/AIChatAssistant'
import { TrendingUp, Award, Target, Zap, Flame } from 'lucide-react'
import '../styles/profile_feed.css'

export const ProgressPage = () => {
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [streaks, setStreaks] = useState(null)
  const [achievements, setAchievements] = useState({ unlocked: [] })

  const userId = 'demo_user_123'

  useEffect(() => {
    loadProgress()
    loadStreaks()
    loadAchievements()
  }, [])

  const loadStreaks = async () => {
    try {
      const data = await api.getStreaks(userId)
      setStreaks(data)
    } catch (error) {
      console.error('Error loading streaks:', error)
    }
  }

  const loadAchievements = async () => {
    try {
      const data = await api.getAchievements(userId)
      setAchievements(data)
    } catch (error) {
      console.error('Error loading achievements:', error)
    }
  }

  const loadProgress = async () => {
    try {
      const data = await api.getUserProgress(userId)
      setProgress(data)
      setLoading(false)
    } catch (error) {
      console.error('Error loading progress:', error)
      setLoading(false)
    }
  }

  if (loading || !progress) {
    return (
      <>
        <NavigationHeader showProgress={false} />
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '60px' }}>
          <div className="loading-spinner"></div>
        </div>
      </>
    )
  }

  return (
    <>
      <NavigationHeader showProgress={false} />
      
      <div className="progress-page-container">
        <div className="progress-header">
          <h1>Your Learning Progress</h1>
          <p>Track your adaptive learning journey</p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card stat-primary">
            <div className="stat-icon">
              <TrendingUp size={32} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{progress.overall_ability.toFixed(1)}</div>
              <div className="stat-label">Ability Level</div>
            </div>
          </div>

          <div className="stat-card stat-success">
            <div className="stat-icon">
              <Target size={32} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{progress.accuracy}%</div>
              <div className="stat-label">Accuracy</div>
            </div>
          </div>

          <div className="stat-card stat-info">
            <div className="stat-icon">
              <Zap size={32} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{progress.total_questions}</div>
              <div className="stat-label">Questions Answered</div>
            </div>
          </div>

          <div className="stat-card stat-award">
            <div className="stat-icon">
              <Award size={32} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{progress.concepts_learned}/{progress.total_concepts}</div>
              <div className="stat-label">Concepts Mastered</div>
            </div>
          </div>
        </div>

        {/* Streaks Section */}
        {streaks && (
          <div className="streaks-section">
            <h2>
              <Flame size={24} />
              Study Streaks
            </h2>
            <div className="streaks-grid">
              <div className="streak-card">
                <div className="streak-value">{streaks.current_streak || 0}</div>
                <div className="streak-label">Current Streak</div>
                <div className="streak-days">days 🔥</div>
              </div>
              <div className="streak-card">
                <div className="streak-value">{streaks.longest_streak || 0}</div>
                <div className="streak-label">Longest Streak</div>
                <div className="streak-days">days 👑</div>
              </div>
              <div className="streak-card">
                <div className="streak-value">{streaks.study_days_count || 0}</div>
                <div className="streak-label">Total Study Days</div>
                <div className="streak-days">days 📅</div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Achievements */}
        {achievements.unlocked && achievements.unlocked.length > 0 && (
          <div className="achievements-section">
            <h2>
              <Award size={24} />
              Recent Achievements
            </h2>
            <div className="achievements-grid">
              {achievements.unlocked.slice(-6).reverse().map((achievement) => (
                <div key={achievement.id} className="achievement-mini">
                  <span className="achievement-icon-mini">{achievement.icon}</span>
                  <div className="achievement-info-mini">
                    <div className="achievement-name-mini">{achievement.name}</div>
                    <div className="achievement-date-mini">
                      {new Date(achievement.unlocked_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Concept Mastery */}
        <div className="mastery-section">
          <h2>Concept Mastery</h2>
          
          {Object.entries(progress.concept_mastery || {}).length === 0 ? (
            <div className="mastery-empty">
              <p>Start learning to see your concept mastery here!</p>
            </div>
          ) : (
            <div className="mastery-list">
              {Object.entries(progress.concept_mastery || {}).map(([conceptId, mastery]) => {
                const masteryValue = typeof mastery === 'number' ? mastery : mastery.mastery || 0
                const masteryPct = Math.round(masteryValue * 100)
                
                return (
                  <div key={conceptId} className="mastery-item">
                    <div className="mastery-info">
                      <span className="mastery-name">Concept {conceptId.slice(-8)}</span>
                      <span className="mastery-percentage">{masteryPct}%</span>
                    </div>
                    <div className="mastery-bar">
                      <div 
                        className="mastery-fill"
                        style={{ 
                          width: `${masteryPct}%`,
                          background: masteryPct > 70 ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)' :
                                     masteryPct > 40 ? 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)' :
                                     'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)'
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');

        .progress-page-container {
          min-height: 100vh;
          padding: 80px 1rem 2rem;
          max-width: 900px;
          margin: 0 auto;
        }

        .progress-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .progress-header h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #4A90E2 0%, #50E3C2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-family: 'Space Grotesk', sans-serif;
          letter-spacing: -0.02em;
        }

        .progress-header p {
          color: rgba(255,255,255,0.7);
          font-size: 1rem;
          font-family: 'Inter', sans-serif;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .stat-card {
          background: var(--color-card-bg);
          border-radius: var(--border-radius-xl);
          padding: 1.5rem;
          display: flex;
          gap: 1rem;
          align-items: center;
          border: 2px solid transparent;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        }

        .stat-primary {
          border-color: rgba(102, 126, 234, 0.3);
        }

        .stat-success {
          border-color: rgba(16, 185, 129, 0.3);
        }

        .stat-info {
          border-color: rgba(251, 191, 36, 0.3);
        }

        .stat-award {
          border-color: rgba(249, 115, 22, 0.3);
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

        .stat-primary .stat-icon {
          background: rgba(102, 126, 234, 0.2);
          color: #667eea;
        }

        .stat-success .stat-icon {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }

        .stat-info .stat-icon {
          background: rgba(251, 191, 36, 0.2);
          color: #fbbf24;
        }

        .stat-award .stat-icon {
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
        }

        .stat-label {
          font-size: 0.875rem;
          color: rgba(255,255,255,0.7);
          font-weight: 600;
        }

        .mastery-section {
          background: var(--color-card-bg);
          border-radius: var(--border-radius-2xl);
          padding: 2rem;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .mastery-section h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          font-family: 'Space Grotesk', sans-serif;
          color: var(--color-text-primary);
        }

        .mastery-list {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .mastery-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .mastery-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .mastery-name {
          font-weight: 600;
          color: var(--color-text-light);
        }

        .mastery-percentage {
          font-weight: 700;
          color: #667eea;
          font-size: 1.125rem;
        }

        .mastery-bar {
          width: 100%;
          height: 12px;
          background: rgba(255,255,255,0.1);
          border-radius: 6px;
          overflow: hidden;
        }

        .mastery-fill {
          height: 100%;
          border-radius: 6px;
          transition: width 1s ease;
          box-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
        }

        .mastery-empty {
          text-align: center;
          padding: 2rem;
          color: rgba(255,255,255,0.6);
        }

        .streaks-section, .achievements-section {
          background: var(--color-card-bg);
          border-radius: var(--border-radius-2xl);
          padding: 2rem;
          margin-bottom: 2rem;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .streaks-section h2, .achievements-section h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-family: 'Space Grotesk', sans-serif;
          color: var(--color-text-primary);
        }

        .streaks-section h2 svg {
          color: #f59e0b;
        }

        .streaks-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
        }

        .streak-card {
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%);
          border: 2px solid rgba(251, 191, 36, 0.3);
          border-radius: 16px;
          padding: 1.5rem;
          text-align: center;
        }

        .streak-value {
          font-size: 3rem;
          font-weight: 800;
          color: #fbbf24;
          line-height: 1;
          margin-bottom: 0.5rem;
        }

        .streak-label {
          font-size: 0.875rem;
          color: rgba(255,255,255,0.7);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 0.25rem;
        }

        .streak-days {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.5);
        }

        .achievements-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
        }

        .achievement-mini {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(102, 126, 234, 0.1);
          border: 1px solid rgba(102, 126, 234, 0.3);
          border-radius: 12px;
        }

        .achievement-icon-mini {
          font-size: 2rem;
          flex-shrink: 0;
        }

        .achievement-info-mini {
          flex: 1;
        }

        .achievement-name-mini {
          font-weight: 600;
          color: var(--color-text-light);
          margin-bottom: 0.25rem;
        }

        .achievement-date-mini {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.6);
        }

        .achievements-section h2 svg {
          color: #fbbf24;
        }

        @media (max-width: 768px) {
          .progress-header h1 {
            font-size: 2rem;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .streaks-grid {
            grid-template-columns: 1fr;
          }

          .achievements-grid {
            grid-template-columns: 1fr;
          }

          .stat-card {
            padding: 1.25rem;
          }
        }
      `}</style>
      <AIChatAssistant userId={userId} />
    </>
  )
}
