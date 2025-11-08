import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Home, TrendingUp, User, BookOpen, Trophy, BarChart3, Calendar, Sparkles, Users, Video, Brain } from 'lucide-react'
import { ProfileDropdown } from './ProfileDropdown'
export const NavigationHeader = ({ showProgress = true }) => {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <>
      {/* Back and Home buttons - Top Left */}
      <div className="nav-top-left">
        <button 
          className="nav-top-button nav-back"
          onClick={() => navigate(-1)}
          title="Go back"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>

        <button 
          className="nav-top-button nav-home"
          onClick={() => navigate('/')}
          title="Home"
        >
          <Home size={18} />
          <span>Home</span>
        </button>
      </div>

      {/* Profile Dropdown - Top Right Corner */}
      <div className="nav-profile-top-right">
        <ProfileDropdown />
      </div>

      <header className="nav-header">
        <div className="nav-container">
          <div className="nav-right">
            <button 
              className="nav-button nav-library"
              onClick={() => navigate('/library')}
              title="My Library"
            >
              <BookOpen size={20} />
              <span className="nav-label">Library</span>
            </button>
          <button 
            className="nav-button nav-flashcards"
            onClick={() => navigate('/flashcards')}
            title="Flashcards"
          >
            <BookOpen size={20} />
            <span className="nav-label">Flashcards</span>
          </button>
          <button 
            className="nav-button nav-rewards"
            onClick={() => navigate('/rewards')}
            title="Rewards"
          >
            <Trophy size={20} />
            <span className="nav-label">Rewards</span>
          </button>
          <button 
            className="nav-button nav-analytics"
            onClick={() => navigate('/analytics')}
            title="Analytics"
          >
            <BarChart3 size={20} />
            <span className="nav-label">Analytics</span>
          </button>
          <button 
            className="nav-button nav-tutor"
            onClick={() => navigate('/tutor')}
            title="AI Tutor"
          >
            <Sparkles size={20} />
            <span className="nav-label">Tutor</span>
          </button>
          <button 
            className="nav-button nav-collaboration"
            onClick={() => navigate('/collaboration')}
            title="Study Groups"
          >
            <Users size={20} />
            <span className="nav-label">Groups</span>
          </button>
          <button 
            className="nav-button nav-study-rooms"
            onClick={() => navigate('/study-rooms')}
            title="Study Rooms"
          >
            <Video size={20} />
            <span className="nav-label">Rooms</span>
          </button>
          {showProgress && location.pathname !== '/progress' && (
            <button 
              className="nav-button nav-progress"
              onClick={() => navigate('/progress')}
              title="View Progress"
            >
              <TrendingUp size={20} />
              <span className="nav-label">Progress</span>
            </button>
          )}
          </div>
        </div>
      </header>

      <style>{`
        .nav-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: var(--color-bg-primary);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--color-border);
          z-index: 1000;
          box-shadow: var(--shadow-md);
          animation: navGlow 3s ease-in-out infinite;
        }

        @keyframes navGlow {
          0%, 100% {
            box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
          }
          50% {
            box-shadow: 0 2px 20px rgba(102, 126, 234, 0.4), 0 0 30px rgba(102, 126, 234, 0.2);
          }
        }

        .nav-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0.875rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .nav-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-md);
          color: var(--color-text-primary);
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .nav-button::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }

        .nav-button:hover::before {
          width: 200px;
          height: 200px;
        }

        .nav-button:hover {
          background: var(--color-button-hover);
          border-color: var(--color-border-hover);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(74, 144, 226, 0.2);
        }

        .nav-button:active {
          transform: translateY(0) scale(0.98);
        }

        .nav-profile-top-right {
          position: fixed;
          top: 0.75rem;
          right: 0.75rem;
          z-index: 1001;
        }

        .nav-top-left {
          position: fixed;
          top: 0.75rem;
          left: 0.75rem;
          display: flex;
          gap: 0.5rem;
          z-index: 1001;
        }

        .nav-top-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-md);
          color: var(--color-text-primary);
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(10px);
        }

        .nav-top-button:hover {
          background: rgba(74, 144, 226, 0.15);
          border-color: rgba(74, 144, 226, 0.5);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(74, 144, 226, 0.2);
        }

        .nav-top-button svg {
          color: rgba(255, 255, 255, 0.8);
          transition: color 0.2s ease;
        }

        .nav-top-button:hover svg {
          color: #4A90E2;
        }

        .nav-back {
          background: rgba(74, 144, 226, 0.1);
        }

        .nav-back svg {
          color: rgba(255, 255, 255, 0.7);
        }

        .nav-home {
          background: rgba(74, 144, 226, 0.1);
        }

        .nav-home svg {
          color: #4A90E2;
        }

        .nav-progress {
          background: rgba(80, 227, 194, 0.1);
        }

        .nav-progress svg {
          color: #50E3C2;
        }

        .nav-library,
        .nav-flashcards,
        .nav-rewards,
        .nav-analytics,
        .nav-tutor,
        .nav-insights,
        .nav-collaboration,
        .nav-study-rooms,
        .nav-progress,
        .nav-profile {
          background: rgba(255, 255, 255, 0.05);
        }

        .nav-library svg,
        .nav-flashcards svg,
        .nav-rewards svg,
        .nav-analytics svg,
        .nav-tutor svg,
        .nav-insights svg,
        .nav-collaboration svg,
        .nav-study-rooms svg,
        .nav-progress svg,
        .nav-profile svg {
          color: rgba(255, 255, 255, 0.7);
        }

        .nav-right {
          display: flex;
          gap: 0.5rem;
        }

        .nav-label {
          display: inline;
        }

        @media (max-width: 1024px) {
          .nav-label {
            display: none;
          }
        }

        @media (max-width: 640px) {
          .nav-label {
            display: none;
          }

          .nav-button {
            padding: 0.5rem 0.75rem;
          }

          .nav-home {
            max-width: 48px;
          }

          .nav-container {
            padding: 0.75rem 1rem;
          }
        }
      `}</style>
    </>
  )
}
