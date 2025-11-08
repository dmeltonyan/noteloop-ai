import React from 'react'
import { Target, AlertCircle, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export const FocusedAreas = ({ userStats, concepts, onFocusArea }) => {
  const navigate = useNavigate()

  if (!userStats || !userStats.concept_mastery) {
    return null
  }

  // Get weak areas (mastery < 0.6)
  const weakAreas = Object.entries(userStats.concept_mastery)
    .map(([conceptId, mastery]) => {
      const masteryValue = typeof mastery === 'object' ? mastery.mastery : mastery
      const concept = concepts?.find(c => c.id === conceptId)
      return {
        id: conceptId,
        mastery: masteryValue,
        name: concept?.topic_name || `Concept ${conceptId.slice(-8)}`,
        description: concept?.description || ''
      }
    })
    .filter(area => area.mastery < 0.6)
    .sort((a, b) => a.mastery - b.mastery)
    .slice(0, 5)

  if (weakAreas.length === 0) {
    return (
      <div className="focused-areas-empty">
        <Target size={32} />
        <h3>Great Progress!</h3>
        <p>You're mastering all concepts. Keep up the excellent work!</p>
      </div>
    )
  }

  const handleFocusArea = (area) => {
    onFocusArea?.(area.id)
    // Navigate to feed filtered by this concept
    navigate(`/feed?focus_concept=${area.id}`)
  }

  return (
    <>
      <div className="focused-areas">
        <div className="focused-areas-header">
          <div className="header-content">
            <Target size={24} />
            <h3>Areas to Focus</h3>
          </div>
          <span className="areas-count">{weakAreas.length} areas</span>
        </div>
        
        <div className="areas-list">
          {weakAreas.map((area) => (
            <div 
              key={area.id} 
              className="area-card"
              onClick={() => handleFocusArea(area)}
            >
              <div className="area-info">
                <div className="area-header">
                  <AlertCircle size={18} className="area-icon" />
                  <h4>{area.name}</h4>
                </div>
                <p className="area-description">{area.description.slice(0, 100)}...</p>
              </div>
              <div className="area-mastery">
                <div className="mastery-bar">
                  <div 
                    className="mastery-fill" 
                    style={{ width: `${area.mastery * 100}%` }}
                  />
                </div>
                <span className="mastery-percent">{Math.round(area.mastery * 100)}%</span>
              </div>
              <button className="focus-btn">
                Focus
                <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');

        .focused-areas {
          background: linear-gradient(135deg, rgba(26, 29, 43, 0.95) 0%, rgba(37, 40, 56, 0.95) 100%);
          border: 2px solid rgba(74, 144, 226, 0.3);
          border-radius: 16px;
          padding: 2rem;
        }

        .focused-areas-empty {
          text-align: center;
          padding: 3rem 2rem;
          background: linear-gradient(135deg, rgba(26, 29, 43, 0.95) 0%, rgba(37, 40, 56, 0.95) 100%);
          border: 2px solid rgba(80, 227, 194, 0.3);
          border-radius: 16px;
        }

        .focused-areas-empty svg {
          color: #50E3C2;
          margin-bottom: 1rem;
        }

        .focused-areas-empty h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          font-family: 'Space Grotesk', sans-serif;
        }

        .focused-areas-empty p {
          color: rgba(255, 255, 255, 0.7);
        }

        .focused-areas-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid rgba(255, 255, 255, 0.1);
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .header-content svg {
          color: #4A90E2;
        }

        .focused-areas-header h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
          font-family: 'Space Grotesk', sans-serif;
        }

        .areas-count {
          padding: 0.375rem 0.875rem;
          background: rgba(74, 144, 226, 0.15);
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          color: #4A90E2;
        }

        .areas-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .area-card {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 107, 107, 0.2);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .area-card:hover {
          background: rgba(255, 107, 107, 0.1);
          border-color: rgba(255, 107, 107, 0.4);
          transform: translateX(4px);
        }

        .area-info {
          flex: 1;
          min-width: 0;
        }

        .area-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .area-icon {
          color: #FF6B6B;
          flex-shrink: 0;
        }

        .area-header h4 {
          font-size: 1.125rem;
          font-weight: 700;
          margin: 0;
          font-family: 'Space Grotesk', sans-serif;
        }

        .area-description {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.875rem;
          margin: 0;
          line-height: 1.5;
        }

        .area-mastery {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          min-width: 80px;
        }

        .mastery-bar {
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
        }

        .mastery-fill {
          height: 100%;
          background: linear-gradient(90deg, #FF6B6B 0%, #FF8787 100%);
          transition: width 0.5s ease;
        }

        .mastery-percent {
          font-size: 0.875rem;
          font-weight: 700;
          color: #FF6B6B;
          font-family: 'Space Grotesk', sans-serif;
        }

        .focus-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1.25rem;
          background: linear-gradient(135deg, #4A90E2 0%, #50E3C2 100%);
          border: none;
          border-radius: 8px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'Inter', sans-serif;
        }

        .focus-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(74, 144, 226, 0.4);
        }

        @media (max-width: 768px) {
          .area-card {
            flex-direction: column;
            align-items: flex-start;
          }

          .area-mastery {
            width: 100%;
            flex-direction: row;
            justify-content: space-between;
          }

          .focus-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </>
  )
}
