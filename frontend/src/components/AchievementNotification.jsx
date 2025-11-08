import React, { useState, useEffect } from 'react'
import { api } from '../services/api'
import { Sparkles, Trophy, X } from 'lucide-react'

export const AchievementNotification = ({ achievements, onClose }) => {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (achievements && achievements.length > 0) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        setTimeout(() => onClose && onClose(), 300) // Wait for animation
      }, 6000) // Show for 6 seconds
      return () => clearTimeout(timer)
    }
  }, [achievements, onClose])

  if (!achievements || achievements.length === 0 || !visible) return null

  return (
    <div className={`achievement-notification-container ${visible ? 'visible' : ''}`}>
      {achievements.map((achievement, idx) => (
        <div key={idx} className="achievement-notification-card" style={{ animationDelay: `${idx * 0.1}s` }}>
          <div className="achievement-notification-content">
            <div className="achievement-icon-large">
              <Sparkles size={32} />
              <span className="icon-emoji">{achievement.icon || '🏆'}</span>
            </div>
            <div className="achievement-text">
              <h4>🎉 Achievement Unlocked!</h4>
              <p className="achievement-name">{achievement.name || 'New Achievement'}</p>
              <p className="achievement-desc">{achievement.description || ''}</p>
            </div>
            <button 
              className="achievement-close-btn"
              onClick={() => {
                setVisible(false)
                setTimeout(() => onClose && onClose(), 300)
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>
      ))}
      <style>{`
        .achievement-notification-container {
          position: fixed;
          top: 90px;
          right: 20px;
          z-index: 10000;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          max-width: 400px;
          pointer-events: none;
        }

        .achievement-notification-card {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%);
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          padding: 1.25rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          animation: slideInRight 0.3s ease-out;
          pointer-events: all;
          transform: translateX(400px);
          opacity: 0;
        }

        .achievement-notification-card.visible {
          animation: slideInRight 0.5s ease-out forwards;
        }

        @keyframes slideInRight {
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .achievement-notification-content {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }

        .achievement-icon-large {
          position: relative;
          flex-shrink: 0;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .icon-emoji {
          font-size: 24px;
          position: absolute;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .achievement-text {
          flex: 1;
          color: white;
        }

        .achievement-text h4 {
          margin: 0 0 0.5rem 0;
          font-size: 1rem;
          font-weight: 700;
        }

        .achievement-name {
          margin: 0 0 0.25rem 0;
          font-size: 1.1rem;
          font-weight: 800;
        }

        .achievement-desc {
          margin: 0;
          font-size: 0.875rem;
          opacity: 0.9;
        }

        .achievement-close-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .achievement-close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.1);
        }

        @media (max-width: 640px) {
          .achievement-notification-container {
            right: 10px;
            left: 10px;
            max-width: none;
          }

          .achievement-notification-card {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  )
}




