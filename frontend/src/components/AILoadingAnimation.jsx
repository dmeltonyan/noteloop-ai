import React, { useState, useEffect } from 'react'
import { Sparkles, Brain, Zap, CheckCircle } from 'lucide-react'

export const AILoadingAnimation = ({ 
  stages = [
    'Analyzing document structure...',
    'Extracting key concepts...',
    'Generating personalized questions...',
    'Creating learning materials...',
    'Finalizing your content...'
  ],
  currentStage = null,
  showProgress = true
}) => {
  const [activeStage, setActiveStage] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (currentStage !== null) {
      setActiveStage(currentStage)
      return
    }

    const interval = setInterval(() => {
      setActiveStage(prev => {
        if (prev < stages.length - 1) {
          return prev + 1
        }
        return prev
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [stages.length, currentStage])

  useEffect(() => {
    if (showProgress) {
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) return 100
          return prev + Math.random() * 3
        })
      }, 200)

      return () => clearInterval(progressInterval)
    }
  }, [showProgress])

  return (
    <div className="ai-loading-container">
      <div className="ai-loading-content">
        {/* Animated AI Brain Icon */}
        <div className="ai-brain-wrapper">
          <div className="ai-brain-circle">
            <Brain className="ai-brain-icon" size={64} />
            <div className="ai-pulse-ring ring-1"></div>
            <div className="ai-pulse-ring ring-2"></div>
            <div className="ai-pulse-ring ring-3"></div>
            <Sparkles className="ai-sparkle sparkle-1" size={16} />
            <Sparkles className="ai-sparkle sparkle-2" size={16} />
            <Sparkles className="ai-sparkle sparkle-3" size={16} />
            <Sparkles className="ai-sparkle sparkle-4" size={16} />
          </div>
        </div>

        {/* Processing Stages */}
        <div className="ai-stages">
          {stages.map((stage, index) => (
            <div 
              key={index} 
              className={`ai-stage ${index === activeStage ? 'active' : ''} ${index < activeStage ? 'completed' : ''}`}
            >
              <div className="stage-indicator">
                {index < activeStage ? (
                  <CheckCircle size={20} className="stage-check" />
                ) : index === activeStage ? (
                  <div className="stage-loader">
                    <div className="loader-dot"></div>
                    <div className="loader-dot"></div>
                    <div className="loader-dot"></div>
                  </div>
                ) : (
                  <div className="stage-dot"></div>
                )}
              </div>
              <span className="stage-text">{stage}</span>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        {showProgress && (
          <div className="ai-progress-container">
            <div className="ai-progress-bar">
              <div 
                className="ai-progress-fill" 
                style={{ width: `${Math.min(progress, 100)}%` }}
              >
                <div className="progress-shimmer"></div>
              </div>
            </div>
            <div className="ai-progress-text">
              {Math.round(Math.min(progress, 100))}% Complete
            </div>
          </div>
        )}

        {/* AI Processing Indicator */}
        <div className="ai-processing-indicator">
          <Zap size={16} />
          <span>AI is working its magic...</span>
        </div>
      </div>

      <style>{`
        .ai-loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 2rem;
          min-height: 400px;
        }

        .ai-loading-content {
          width: 100%;
          max-width: 500px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
        }

        .ai-brain-wrapper {
          position: relative;
          width: 120px;
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ai-brain-circle {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ai-brain-icon {
          position: relative;
          z-index: 10;
          color: var(--color-primary);
          animation: brainPulse 2s ease-in-out infinite;
        }

        @keyframes brainPulse {
          0%, 100% { 
            transform: scale(1);
            opacity: 1;
          }
          50% { 
            transform: scale(1.1);
            opacity: 0.9;
          }
        }

        .ai-pulse-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 100%;
          border: 2px solid var(--color-primary);
          border-radius: 50%;
          opacity: 0;
        }

        .ring-1 {
          animation: pulseRing 2s ease-out infinite;
        }

        .ring-2 {
          animation: pulseRing 2s ease-out infinite 0.5s;
        }

        .ring-3 {
          animation: pulseRing 2s ease-out infinite 1s;
        }

        @keyframes pulseRing {
          0% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0.8;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0;
          }
        }

        .ai-sparkle {
          position: absolute;
          color: var(--color-accent);
          opacity: 0;
          animation: sparkleFloat 3s ease-in-out infinite;
        }

        .sparkle-1 {
          top: 10%;
          left: 20%;
          animation-delay: 0s;
        }

        .sparkle-2 {
          top: 20%;
          right: 15%;
          animation-delay: 0.5s;
        }

        .sparkle-3 {
          bottom: 15%;
          left: 25%;
          animation-delay: 1s;
        }

        .sparkle-4 {
          bottom: 10%;
          right: 20%;
          animation-delay: 1.5s;
        }

        @keyframes sparkleFloat {
          0%, 100% {
            transform: translate(0, 0) scale(0.8);
            opacity: 0;
          }
          50% {
            transform: translate(10px, -10px) scale(1.2);
            opacity: 1;
          }
        }

        .ai-stages {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .ai-stage {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          transition: all 0.3s ease;
          opacity: 0.5;
        }

        .ai-stage.active {
          background: rgba(74, 144, 226, 0.1);
          border: 1px solid rgba(74, 144, 226, 0.3);
          opacity: 1;
          transform: translateX(4px);
        }

        .ai-stage.completed {
          opacity: 0.7;
        }

        .stage-indicator {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .stage-check {
          color: var(--color-success);
          animation: checkPop 0.3s ease;
        }

        @keyframes checkPop {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }

        .stage-loader {
          display: flex;
          gap: 4px;
        }

        .loader-dot {
          width: 6px;
          height: 6px;
          background: var(--color-primary);
          border-radius: 50%;
          animation: loaderBounce 1.4s ease-in-out infinite;
        }

        .loader-dot:nth-child(1) { animation-delay: 0s; }
        .loader-dot:nth-child(2) { animation-delay: 0.2s; }
        .loader-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes loaderBounce {
          0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1.2);
            opacity: 1;
          }
        }

        .stage-dot {
          width: 8px;
          height: 8px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
        }

        .stage-text {
          font-size: 0.9375rem;
          color: var(--color-text-secondary);
          font-weight: 500;
        }

        .ai-stage.active .stage-text {
          color: var(--color-text-primary);
          font-weight: 600;
        }

        .ai-progress-container {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .ai-progress-bar {
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-full);
          overflow: hidden;
          position: relative;
        }

        .ai-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--color-gradient-start) 0%, var(--color-gradient-end) 100%);
          border-radius: var(--radius-full);
          transition: width 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .progress-shimmer {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.3) 50%,
            transparent 100%
          );
          animation: shimmer 2s ease-in-out infinite;
        }

        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        .ai-progress-text {
          text-align: center;
          font-size: 0.875rem;
          color: var(--color-text-secondary);
          font-weight: 600;
        }

        .ai-processing-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(74, 144, 226, 0.1);
          border-radius: var(--radius-full);
          font-size: 0.875rem;
          color: var(--color-primary);
          font-weight: 600;
        }

        .ai-processing-indicator svg {
          animation: zapPulse 1.5s ease-in-out infinite;
        }

        @keyframes zapPulse {
          0%, 100% { 
            transform: scale(1);
            opacity: 1;
          }
          50% { 
            transform: scale(1.2);
            opacity: 0.8;
          }
        }

        @media (max-width: 768px) {
          .ai-loading-container {
            padding: 2rem 1rem;
            min-height: 300px;
          }

          .ai-brain-wrapper {
            width: 100px;
            height: 100px;
          }

          .ai-brain-icon {
            width: 48px;
            height: 48px;
          }

          .stage-text {
            font-size: 0.875rem;
          }
        }
      `}</style>
    </div>
  )
}


