import React, { useState } from 'react'
import { AISmartSuggestions } from './AISmartSuggestions'
import { Sparkles, ChevronUp, ChevronDown, X } from 'lucide-react'

export const AISuggestionsSidebar = ({ userId, userStats, onSuggestionClick }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  return (
    <div className={`ai-insights-widget ${isExpanded ? 'expanded' : ''} ${isMinimized ? 'minimized' : ''}`}>
      <div className="widget-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="header-left">
          <Sparkles size={18} className="widget-icon" />
          <h3>AI Insights</h3>
        </div>
        <div className="header-actions">
          <button 
            className="minimize-btn"
            onClick={(e) => {
              e.stopPropagation()
              setIsMinimized(!isMinimized)
            }}
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>
      
      {!isMinimized && (
        <div className="widget-content">
          <AISmartSuggestions 
            userId={userId}
            userStats={userStats}
            onSuggestionClick={onSuggestionClick}
          />
        </div>
      )}

      <style>{`
        .ai-insights-widget {
          position: fixed;
          bottom: 1.5rem;
          right: 1.5rem;
          width: 360px;
          max-height: ${isExpanded ? '600px' : '400px'};
          background: linear-gradient(135deg, rgba(26, 29, 43, 0.98) 0%, rgba(37, 40, 56, 0.98) 100%);
          backdrop-filter: blur(20px);
          border: 2px solid rgba(74, 144, 226, 0.3);
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          z-index: 998;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }

        .ai-insights-widget.minimized {
          max-height: 60px;
        }

        .ai-insights-widget.expanded {
          max-height: 600px;
        }

        .widget-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid rgba(74, 144, 226, 0.2);
          background: linear-gradient(135deg, rgba(74, 144, 226, 0.15) 0%, rgba(80, 227, 194, 0.15) 100%);
          cursor: pointer;
          user-select: none;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .widget-icon {
          color: #4A90E2;
          flex-shrink: 0;
        }

        .widget-header h3 {
          font-size: 0.9375rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0;
          letter-spacing: 0.5px;
        }

        .header-actions {
          display: flex;
          gap: 0.5rem;
        }

        .minimize-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 0;
        }

        .minimize-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          color: var(--color-text-primary);
        }

        .widget-content {
          flex: 1;
          padding: 1rem;
          overflow-y: auto;
          max-height: ${isExpanded ? '540px' : '340px'};
          transition: max-height 0.3s ease;
        }

        .widget-content::-webkit-scrollbar {
          width: 6px;
        }

        .widget-content::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }

        .widget-content::-webkit-scrollbar-thumb {
          background: rgba(74, 144, 226, 0.3);
          border-radius: 3px;
        }

        .widget-content::-webkit-scrollbar-thumb:hover {
          background: rgba(74, 144, 226, 0.5);
        }

        @media (max-width: 768px) {
          .ai-insights-widget {
            width: calc(100% - 2rem);
            right: 1rem;
            left: 1rem;
            bottom: 1rem;
          }
        }

        @media (max-width: 480px) {
          .ai-insights-widget {
            width: calc(100% - 1rem);
            right: 0.5rem;
            left: 0.5rem;
            bottom: 0.5rem;
          }
        }
      `}</style>
    </div>
  )
}

