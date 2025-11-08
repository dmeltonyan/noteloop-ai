import React, { useState, useEffect } from 'react'
import { Coins, Star, TrendingUp } from 'lucide-react'
import { api } from '../services/api'

export const CreditsDisplay = ({ userId, compact = false }) => {
  const [rewards, setRewards] = useState(null)

  useEffect(() => {
    loadRewards()
  }, [userId])

  const loadRewards = async () => {
    try {
      const data = await api.getRewards(userId)
      setRewards(data?.summary)
    } catch (error) {
      console.error('Failed to load rewards:', error)
    }
  }

  if (!rewards) return null

  if (compact) {
    return (
      <div className="credits-display-compact">
        <Coins size={18} />
        <span>{rewards.learning_credits || 0}</span>
        <style>{`
          .credits-display-compact {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            background: rgba(251, 191, 36, 0.1);
            border: 1px solid rgba(251, 191, 36, 0.3);
            border-radius: var(--radius-md);
            color: #fbbf24;
            font-weight: 700;
            font-size: 0.875rem;
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="credits-display">
      <div className="credits-item">
        <Coins size={20} />
        <div>
          <div className="credits-label">Credits</div>
          <div className="credits-value">{rewards.learning_credits || 0}</div>
        </div>
      </div>
      <div className="credits-item">
        <Star size={20} />
        <div>
          <div className="credits-label">Level {rewards.level || 1}</div>
          <div className="credits-progress">
            <div className="progress-bar-mini">
              <div 
                className="progress-fill-mini" 
                style={{ width: `${rewards.level_progress_percent || 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .credits-display {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .credits-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: rgba(251, 191, 36, 0.1);
          border: 1px solid rgba(251, 191, 36, 0.3);
          border-radius: var(--radius-md);
        }

        .credits-item svg {
          color: #fbbf24;
          flex-shrink: 0;
        }

        .credits-label {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.7);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .credits-value {
          font-size: 1.25rem;
          font-weight: 800;
          color: #fbbf24;
        }

        .credits-progress {
          width: 100px;
        }

        .progress-bar-mini {
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-full);
          overflow: hidden;
          margin-top: 0.25rem;
        }

        .progress-fill-mini {
          height: 100%;
          background: #fbbf24;
          border-radius: var(--radius-full);
          transition: width 0.3s ease;
        }
      `}</style>
    </div>
  )
}


