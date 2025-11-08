import React, { useState, useEffect } from 'react'
import { Logo } from '../components/Logo'
import { FileUploadArea } from '../components/FileUploadArea'
import { AISuggestionsSidebar } from '../components/AISuggestionsSidebar'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Brain, TrendingUp, CheckCircle, ArrowRight, Library } from 'lucide-react'
import { api } from '../services/api'

export const HomePage = () => {
  const navigate = useNavigate()
  const [uploadSuccess, setUploadSuccess] = useState(null)
  const [redirecting, setRedirecting] = useState(false)
  const [userStats, setUserStats] = useState(null)
  const userId = 'demo_user_123'

  useEffect(() => {
    loadUserStats()
  }, [])

  const loadUserStats = async () => {
    try {
      const stats = await api.getUserProgress(userId)
      setUserStats(stats)
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const handleUploadSuccess = (result) => {
    console.log('✅ Upload success:', result)
    setUploadSuccess(result)
    
    // Auto-redirect after 2 seconds (give user time to see success)
    setRedirecting(true)
    setTimeout(() => {
      console.log('➡️ Redirecting to feed...')
      // Store upload_id and redirect
      if (result?.upload_id) {
        localStorage.setItem('current_upload_id', result.upload_id)
        navigate(`/feed?upload_id=${result.upload_id}`)
      } else {
        navigate('/feed')
      }
    }, 2000)
  }

  if (redirecting) {
    return (
      <div className="redirect-screen">
        <div className="redirect-content">
          <div className="success-animation">
            <CheckCircle size={64} className="success-icon" />
          </div>
          <h1>Content Ready!</h1>
          <p className="redirect-message">
            Created <strong>{uploadSuccess?.concepts_created || 0}</strong> learning concepts with personalized questions
          </p>
          <div className="redirect-info">
            <div className="redirect-loader"></div>
            <p>Preparing your personalized learning experience...</p>
            <p className="redirect-subtext">You'll be redirected to your feed in a moment</p>
          </div>
        </div>

        <style>{`
          .redirect-screen {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--color-background);
            padding: 2rem;
          }

          .redirect-content {
            text-align: center;
            max-width: 500px;
          }

          .success-animation {
            margin-bottom: 2rem;
          }

          .success-icon {
            color: var(--color-success);
            animation: scaleIn 0.6s ease;
          }

          @keyframes scaleIn {
            0% { transform: scale(0); opacity: 0; }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); opacity: 1; }
          }

          .redirect-screen h1 {
            font-size: 2rem;
            font-weight: 800;
            margin-bottom: 1rem;
          }

          .redirect-message {
            font-size: 1.125rem;
            color: rgba(255,255,255,0.8);
            margin-bottom: 2rem;
          }

          .redirect-message strong {
            color: var(--color-success);
            font-size: 1.5rem;
          }

          .redirect-info {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
          }

          .redirect-subtext {
            font-size: 0.875rem;
            color: rgba(255,255,255,0.5);
            margin-top: -0.5rem;
          }

          .redirect-loader {
            width: 48px;
            height: 48px;
            border: 4px solid rgba(102, 126, 234, 0.2);
            border-top-color: #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  const learningModes = [
    {
      icon: BookOpen,
      title: 'Interactive Learning',
      description: 'Answer questions with detailed explanations',
      path: '/feed',
    },
    {
      icon: Library,
      title: 'My Library',
      description: 'View all your uploaded materials',
      path: '/library',
    },
    {
      icon: Brain,
      title: 'Practice Mode',
      description: 'Focus on building mastery',
      path: '/practice',
    },
    {
      icon: TrendingUp,
      title: 'Progress Tracking',
      description: 'View your learning analytics',
      path: '/progress',
    }
  ]

  return (
    <div className="home-page">
      <Logo />
      
      {/* AI Suggestions Sidebar */}
      <AISuggestionsSidebar
        userId={userId}
        userStats={userStats}
        onSuggestionClick={(suggestion) => {
          if (suggestion.id === 'get-started') {
            document.getElementById('file-input')?.click()
          } else if (suggestion.id === 'review-weak' || suggestion.id === 'challenge-mode') {
            navigate('/practice')
          } else {
            navigate('/feed')
          }
        }}
      />
      
      <div className="home-content">
        <div className="hero-section">
          <h1 className="hero-title">Transform Your Notes Into Mastery</h1>
          <p className="hero-subtitle">
            Upload your study materials and get AI-powered personalized questions with detailed explanations
          </p>
          
          {/* Quick Start Guide */}
          <div className="quick-guide">
            <div className="guide-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Upload</h4>
                <p>Drag & drop your PDF, TXT, or DOCX file</p>
              </div>
            </div>
            <div className="guide-arrow">→</div>
            <div className="guide-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Learn</h4>
                <p>Answer personalized questions with explanations</p>
              </div>
            </div>
            <div className="guide-arrow">→</div>
            <div className="guide-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Master</h4>
                <p>Track progress and improve with adaptive learning</p>
              </div>
            </div>
          </div>
        </div>

        <FileUploadArea onUploadSuccess={handleUploadSuccess} />

        {uploadSuccess && !redirecting && (
          <div className="upload-success-card">
            <CheckCircle size={48} className="success-icon" />
            <h3>Success!</h3>
            <p>Created <strong>{uploadSuccess.concepts_created}</strong> questions</p>
            <button 
              onClick={() => navigate('/feed')} 
              className="start-button professional-button hover-lift"
            >
              Start Learning <ArrowRight size={20} />
            </button>
          </div>
        )}


        <div className="modes-section">
          <h2>Learning Modes</h2>
          <div className="modes-grid">
            {learningModes.map((mode, i) => {
              const Icon = mode.icon
              return (
                <button 
                  key={i} 
                  className="mode-card card-hover professional-button" 
                  onClick={() => navigate(mode.path)}
                >
                  <Icon size={32} />
                  <h3>{mode.title}</h3>
                  <p>{mode.description}</p>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');

        .home-page {
          min-height: 100vh;
          background: var(--color-bg-primary);
          padding: 2rem 1rem;
        }

        .home-content {
          max-width: 1000px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .hero-section {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .hero-title {
          font-size: 2.75rem;
          font-weight: 700;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #4A90E2 0%, #50E3C2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.2;
          font-family: 'Space Grotesk', sans-serif;
          letter-spacing: -0.02em;
        }

        .hero-subtitle {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.6;
          margin-bottom: 2rem;
          max-width: 700px;
          margin-left: auto;
          margin-right: auto;
          font-family: 'Inter', sans-serif;
        }

        .quick-guide {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
          margin-top: 2rem;
          padding: 1.5rem;
          background: var(--color-bg-card);
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border);
        }

        .guide-step {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex: 1;
          min-width: 150px;
        }

        .step-number {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, var(--color-gradient-start) 0%, var(--color-gradient-end) 100%);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.25rem;
          flex-shrink: 0;
          box-shadow: var(--shadow-md);
        }

        .step-content h4 {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
          color: var(--color-text-primary);
        }

        .step-content p {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
          margin: 0;
        }

        .guide-arrow {
          color: var(--color-text-tertiary);
          font-size: 1.5rem;
          font-weight: 700;
        }

        @media (max-width: 768px) {
          .guide-arrow {
            display: none;
          }
          .guide-step {
            width: 100%;
            justify-content: center;
          }
        }

        .upload-success-card {
          background: var(--color-bg-card);
          border: 2px solid var(--color-success);
          border-radius: var(--radius-lg);
          padding: 2rem;
          text-align: center;
          margin: 2rem 0;
          animation: slideIn 0.5s ease;
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .upload-success-card .success-icon {
          color: var(--color-success);
          margin-bottom: 1rem;
        }

        .upload-success-card h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: var(--color-text-primary);
        }

        .upload-success-card strong {
          color: var(--color-success);
          font-size: 1.25rem;
        }

        .start-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2rem;
          background: linear-gradient(135deg, var(--color-gradient-start) 0%, var(--color-gradient-end) 100%);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-weight: 700;
          cursor: pointer;
          margin-top: 1rem;
          transition: all 0.3s ease;
          box-shadow: var(--shadow-md);
        }

        .start-button:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        .modes-section {
          margin-top: 3.5rem;
          text-align: center;
        }

        .modes-section h2 {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 2rem;
          color: var(--color-text-primary);
        }

        .modes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.25rem;
        }

        .mode-card {
          padding: 1.75rem;
          background: var(--color-bg-card);
          border: 2px solid var(--color-border);
          border-radius: var(--radius-lg);
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .mode-card:hover {
          border-color: var(--color-primary);
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
        }

        .mode-card svg {
          color: #4A90E2;
          margin-bottom: 1rem;
          transition: all 0.3s ease;
        }

        .mode-card:hover svg {
          color: #50E3C2;
          transform: scale(1.1);
        }

        .mode-card h3 {
          font-size: 1.125rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: var(--color-text-primary);
        }

        .mode-card p {
          color: var(--color-text-secondary);
          font-size: 0.9375rem;
        }


        @media (max-width: 768px) {
          .hero-title {
            font-size: 2rem;
          }
          .modes-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
