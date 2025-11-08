import React from 'react'
import { Chrome, Apple, Mail } from 'lucide-react'

export const OAuthLogin = ({ onLogin, onSkip }) => {
  const handleGoogleLogin = () => {
    // In production, this would redirect to Google OAuth
    console.log('Google login clicked')
    // For now, simulate login
    if (onLogin) {
      onLogin({ provider: 'google', email: 'user@gmail.com', name: 'User' })
    }
  }

  const handleAppleLogin = () => {
    // In production, this would redirect to Apple OAuth
    console.log('Apple login clicked')
    if (onLogin) {
      onLogin({ provider: 'apple', email: 'user@icloud.com', name: 'User' })
    }
  }

  const handleEmailLogin = () => {
    // Email/password login
    console.log('Email login clicked')
    if (onLogin) {
      onLogin({ provider: 'email', email: 'user@example.com', name: 'User' })
    }
  }

  return (
    <div className="oauth-login-modal">
      <div className="oauth-modal-content">
        <div className="oauth-header">
          <h2>Sign in to Continue</h2>
          <p>Create an account or sign in to upload and save your learning materials</p>
        </div>

        <div className="oauth-buttons">
          <button 
            onClick={handleGoogleLogin}
            className="oauth-btn oauth-google"
          >
            <Chrome size={20} />
            <span>Continue with Google</span>
          </button>

          <button 
            onClick={handleAppleLogin}
            className="oauth-btn oauth-apple"
          >
            <Apple size={20} />
            <span>Continue with Apple</span>
          </button>

          <button 
            onClick={handleEmailLogin}
            className="oauth-btn oauth-email"
          >
            <Mail size={20} />
            <span>Continue with Email</span>
          </button>
        </div>

        <div className="oauth-footer">
          <p className="privacy-note">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
          {onSkip && (
            <button onClick={onSkip} className="skip-link">
              Continue as Guest
            </button>
          )}
        </div>
      </div>

      <style>{`
        .oauth-login-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .oauth-modal-content {
          background: var(--color-bg-secondary);
          border: 2px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 2.5rem;
          max-width: 420px;
          width: 90%;
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .oauth-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .oauth-header h2 {
          font-size: 1.75rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, var(--color-gradient-start) 0%, var(--color-gradient-end) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .oauth-header p {
          color: var(--color-text-secondary);
          font-size: 0.9375rem;
          line-height: 1.5;
        }

        .oauth-buttons {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .oauth-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 0.875rem 1.5rem;
          border: 2px solid var(--color-border);
          border-radius: var(--radius-md);
          font-weight: 600;
          font-size: 0.9375rem;
          cursor: pointer;
          transition: all 0.3s ease;
          background: var(--color-bg-card);
          color: var(--color-text-primary);
        }

        .oauth-btn:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .oauth-btn:active {
          transform: translateY(0);
        }

        .oauth-google {
          background: white;
          color: #333;
          border-color: rgba(0, 0, 0, 0.1);
        }

        .oauth-google:hover {
          background: #f8f9fa;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .oauth-apple {
          background: #000;
          color: white;
          border-color: #333;
        }

        .oauth-apple:hover {
          background: #1a1a1a;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .oauth-email {
          background: linear-gradient(135deg, var(--color-gradient-start) 0%, var(--color-gradient-end) 100%);
          color: white;
          border: none;
        }

        .oauth-email:hover {
          box-shadow: 0 4px 16px rgba(74, 144, 226, 0.4);
        }

        .oauth-footer {
          text-align: center;
        }

        .privacy-note {
          font-size: 0.75rem;
          color: var(--color-text-tertiary);
          margin-bottom: 1rem;
          line-height: 1.4;
        }

        .skip-link {
          background: transparent;
          border: none;
          color: var(--color-text-secondary);
          font-size: 0.875rem;
          cursor: pointer;
          text-decoration: underline;
          transition: color 0.2s ease;
        }

        .skip-link:hover {
          color: var(--color-text-primary);
        }

        @media (max-width: 768px) {
          .oauth-modal-content {
            padding: 2rem 1.5rem;
          }

          .oauth-header h2 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  )
}


