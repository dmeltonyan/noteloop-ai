import React, { useState } from 'react'
import { Loader, CheckCircle, Sparkles } from 'lucide-react'

export const AIButton = ({
  children,
  onClick,
  loading = false,
  success = false,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  className = '',
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleClick = async (e) => {
    if (disabled || loading || isLoading) return

    setIsLoading(true)
    setShowSuccess(false)

    try {
      if (onClick) {
        await onClick(e)
      }
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        setIsLoading(false)
      }, 1500)
    } catch (error) {
      setIsLoading(false)
      setShowSuccess(false)
    }
  }

  const isProcessing = loading || isLoading

  return (
    <>
      <button
        className={`ai-button ai-button-${variant} ai-button-${size} ${className} ${isProcessing ? 'loading' : ''} ${showSuccess ? 'success' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={handleClick}
        disabled={disabled || isProcessing}
        {...props}
      >
        {isProcessing ? (
          <>
            <Loader className="button-loader" size={18} />
            <span>Processing...</span>
          </>
        ) : showSuccess ? (
          <>
            <CheckCircle size={18} />
            <span>Success!</span>
          </>
        ) : (
          <>
            {variant === 'ai' && <Sparkles size={18} />}
            {children}
          </>
        )}
        {variant === 'ai' && !isProcessing && !showSuccess && (
          <div className="ai-button-glow"></div>
        )}
      </button>

      <style>{`
        .ai-button {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-weight: 600;
          border: none;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          font-family: inherit;
          outline: none;
        }

        .ai-button:focus-visible {
          outline: 2px solid var(--color-primary);
          outline-offset: 2px;
        }

        .ai-button-small {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
        }

        .ai-button-medium {
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
        }

        .ai-button-large {
          padding: 1rem 2rem;
          font-size: 1.125rem;
        }

        .ai-button-primary {
          background: linear-gradient(135deg, var(--color-gradient-start) 0%, var(--color-gradient-end) 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
        }

        .ai-button-primary:hover:not(.disabled):not(.loading):not(.success) {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(74, 144, 226, 0.4);
        }

        .ai-button-secondary {
          background: var(--color-bg-card);
          color: var(--color-text-primary);
          border: 2px solid var(--color-border);
        }

        .ai-button-secondary:hover:not(.disabled):not(.loading):not(.success) {
          background: var(--color-button-hover);
          border-color: var(--color-border-hover);
          transform: translateY(-1px);
        }

        .ai-button-ai {
          background: linear-gradient(135deg, var(--color-gradient-start) 0%, var(--color-gradient-end) 100%);
          color: white;
          box-shadow: 0 4px 16px rgba(74, 144, 226, 0.4);
          position: relative;
        }

        .ai-button-ai:hover:not(.disabled):not(.loading):not(.success) {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 8px 24px rgba(74, 144, 226, 0.5);
        }

        .ai-button-glow {
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
          animation: buttonShimmer 3s ease-in-out infinite;
        }

        @keyframes buttonShimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        .ai-button.loading {
          cursor: wait;
          opacity: 0.9;
        }

        .ai-button.success {
          background: linear-gradient(135deg, var(--color-success) 0%, #45d4b8 100%);
          animation: successPulse 0.5s ease;
        }

        @keyframes successPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .ai-button.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .button-loader {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .ai-button svg {
          flex-shrink: 0;
        }
      `}</style>
    </>
  )
}


