import React, { useState, useEffect } from 'react'
import { api } from '../services/api'
import { NavigationHeader } from '../components/NavigationHeader'
import { Trophy, Award, Target, Zap, BookOpen, TrendingUp, Sparkles, Lock } from 'lucide-react'

export const AchievementsPage = () => {
  const [achievements, setAchievements] = useState({ unlocked: [], all: [] })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // 'all', 'unlocked', 'streak', 'mastery', 'practice'
  const userId = 'demo_user_123'

  useEffect(() => {
    loadAchievements()
  }, [])

  const loadAchievements = async () => {
    try {
      const data = await api.getAchievements(userId)
      setAchievements(data)
    } catch (error) {
      console.error('Failed to load achievements:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAchievements = achievements.all.filter(ach => {
    if (filter === 'all') return true
    if (filter === 'unlocked') return achievements.unlocked.some(u => u.id === ach.id)
    return ach.category === filter
  })

  const isUnlocked = (achievementId) => {
    return achievements.unlocked.some(u => u.id === achievementId)
  }

  const getUnlockedAchievement = (achievementId) => {
    return achievements.unlocked.find(u => u.id === achievementId)
  }

  if (loading) {
    return (
      <>
        <NavigationHeader />
        <div className="loading-container">
          <Trophy className="spinner" size={48} />
          <p>Loading achievements...</p>
        </div>
      </>
    )
  }

  return (
    <>
      <NavigationHeader />
      <div className="achievements-page">
        <div className="achievements-header">
          <div className="header-content">
            <Trophy size={48} />
            <div>
              <h1>Your Achievements</h1>
              <p>
                {achievements.unlocked.length} of {achievements.all.length} unlocked
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="achievement-filters">
          {['all', 'unlocked', 'streak', 'mastery', 'practice'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`filter-btn ${filter === cat ? 'active' : ''}`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Achievement Grid */}
        <div className="achievements-grid">
          {filteredAchievements.map((achievement) => {
            const unlocked = isUnlocked(achievement.id)
            const unlockedData = unlocked ? getUnlockedAchievement(achievement.id) : null

            return (
              <div 
                key={achievement.id} 
                className={`achievement-card ${unlocked ? 'unlocked' : 'locked'}`}
              >
                <div className="achievement-icon">
                  {unlocked ? (
                    <span className="icon-text">{achievement.icon}</span>
                  ) : (
                    <Lock size={32} />
                  )}
                </div>
                <div className="achievement-info">
                  <h3>{achievement.name}</h3>
                  <p>{achievement.description}</p>
                  {unlockedData && (
                    <div className="unlocked-date">
                      Unlocked {new Date(unlockedData.unlocked_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
                {unlocked && (
                  <div className="unlocked-badge">
                    <Sparkles size={16} />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Progress Summary */}
        <div className="progress-summary">
          <div className="summary-card">
            <Trophy size={24} />
            <div>
              <span className="summary-value">{achievements.unlocked.length}</span>
              <span className="summary-label">Unlocked</span>
            </div>
          </div>
          <div className="summary-card">
            <Target size={24} />
            <div>
              <span className="summary-value">{achievements.all.length - achievements.unlocked.length}</span>
              <span className="summary-label">Remaining</span>
            </div>
          </div>
          <div className="summary-card">
            <TrendingUp size={24} />
            <div>
              <span className="summary-value">
                {Math.round((achievements.unlocked.length / achievements.all.length) * 100)}%
              </span>
              <span className="summary-label">Complete</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .achievements-page {
          min-height: 100vh;
          padding: 100px 2rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .loading-container {
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

        .achievements-header {
          margin-bottom: 3rem;
          text-align: center;
        }

        .header-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
        }

        .header-content svg {
          color: #fbbf24;
        }

        .achievements-header h1 {
          font-size: 2.5rem;
          font-weight: 800;
          margin: 0;
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .achievements-header p {
          color: rgba(255,255,255,0.7);
          margin: 0.5rem 0 0 0;
          font-size: 1.125rem;
        }

        .achievement-filters {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .filter-btn {
          padding: 0.75rem 1.5rem;
          background: rgba(255,255,255,0.1);
          border: 2px solid rgba(255,255,255,0.2);
          border-radius: 12px;
          color: rgba(255,255,255,0.7);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .filter-btn:hover {
          background: rgba(255,255,255,0.15);
          border-color: rgba(255,255,255,0.3);
        }

        .filter-btn.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-color: transparent;
          color: white;
        }

        .achievements-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .achievement-card {
          background: var(--color-card-bg);
          border: 2px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          position: relative;
          transition: all 0.3s ease;
        }

        .achievement-card.unlocked {
          border-color: rgba(251, 191, 36, 0.5);
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%);
        }

        .achievement-card.unlocked:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(251, 191, 36, 0.3);
        }

        .achievement-card.locked {
          opacity: 0.6;
        }

        .achievement-icon {
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }

        .icon-text {
          font-size: 3rem;
        }

        .achievement-card.locked .achievement-icon {
          color: rgba(255,255,255,0.3);
        }

        .achievement-info {
          flex: 1;
        }

        .achievement-info h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          color: var(--color-text-light);
        }

        .achievement-info p {
          color: rgba(255,255,255,0.7);
          margin: 0;
          font-size: 0.9375rem;
        }

        .unlocked-date {
          margin-top: 0.75rem;
          font-size: 0.75rem;
          color: rgba(251, 191, 36, 0.8);
        }

        .unlocked-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          color: #fbbf24;
        }

        .progress-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
        }

        .summary-card {
          background: var(--color-card-bg);
          border: 2px solid rgba(102, 126, 234, 0.3);
          border-radius: 16px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .summary-card svg {
          color: #667eea;
        }

        .summary-value {
          display: block;
          font-size: 2rem;
          font-weight: 800;
          color: var(--color-text-light);
        }

        .summary-label {
          display: block;
          font-size: 0.875rem;
          color: rgba(255,255,255,0.7);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        @media (max-width: 768px) {
          .achievements-page {
            padding: 80px 1rem 1rem;
          }

          .achievements-grid {
            grid-template-columns: 1fr;
          }

          .header-content {
            flex-direction: column;
          }
        }
      `}</style>
    </>
  )
}




