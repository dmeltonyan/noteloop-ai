import React from 'react'
import { GraduationCap } from 'lucide-react'

export const Logo = () => {
  return (
    <div className="logo-container">
      <div className="logo-wrapper">
        <GraduationCap size={48} className="logo-icon" />
      </div>
      <h1 className="logo-text">NoteLoop AI</h1>

      <style>
        {`
        .logo-container {
          text-align: center;
          margin-bottom: 2rem;
        }

        .logo-wrapper {
          width: 96px;
          height: 96px;
          margin: 0 auto 1rem;
          background: linear-gradient(135deg, #4A90E2 0%, #50E3C2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 24px rgba(74, 144, 226, 0.4);
          animation: float 3s ease-in-out infinite;
        }

        .logo-icon {
          color: white;
        }

        .logo-text {
          font-size: 2rem;
          font-weight: 800;
          background: linear-gradient(135deg, #4A90E2 0%, #50E3C2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        `}
      </style>
    </div>
  )
}
