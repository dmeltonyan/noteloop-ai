import React, { useState, useEffect } from 'react'
import { api } from '../services/api'
import { NavigationHeader } from '../components/NavigationHeader'
import { Calendar, Plus, CheckCircle, Clock, Target } from 'lucide-react'

export const StudyPlansPage = () => {
  const [plans, setPlans] = useState([])
  const [activePlan, setActivePlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const userId = 'demo_user_123'

  useEffect(() => {
    loadStudyPlans()
  }, [])

  const loadStudyPlans = async () => {
    try {
      const data = await api.getStudyPlans(userId)
      setPlans(data.plans || [])
      setActivePlan(data.active_plan)
    } catch (error) {
      console.error('Failed to load study plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const createPlan = async () => {
    try {
      // Get user's concepts
      const progress = await api.getUserProgress(userId)
      const concepts = Object.keys(progress.concept_mastery || {})
      
      if (concepts.length === 0) {
        alert('No concepts available. Upload materials first!')
        return
      }

      const result = await api.createStudyPlan(userId, concepts, 7)
      if (result.success) {
        await loadStudyPlans()
      }
    } catch (error) {
      console.error('Failed to create study plan:', error)
    }
  }

  const completeDay = async (planId, day) => {
    try {
      await api.completeStudyDay(userId, planId, day)
      await loadStudyPlans()
    } catch (error) {
      console.error('Failed to complete day:', error)
    }
  }

  if (loading) {
    return (
      <>
        <NavigationHeader />
        <div className="loading-container">
          <Calendar className="spinner" size={48} />
          <p>Loading study plans...</p>
        </div>
      </>
    )
  }

  const displayPlan = activePlan || plans[0]

  return (
    <>
      <NavigationHeader />
      <div className="study-plans-page">
        <div className="plans-header">
          <div className="header-content">
            <Calendar size={40} />
            <div>
              <h1>Study Plans</h1>
              <p>Personalized learning schedules tailored to your goals</p>
            </div>
          </div>
          <button onClick={createPlan} className="create-plan-btn">
            <Plus size={20} />
            <span>Create New Plan</span>
          </button>
        </div>

        {plans.length === 0 ? (
          <div className="empty-plans">
            <Calendar size={64} />
            <h2>No Study Plans Yet</h2>
            <p>Create a personalized study plan to structure your learning</p>
            <button onClick={createPlan} className="primary-button">
              <Plus size={20} />
              Create Your First Plan
            </button>
          </div>
        ) : (
          <>
            {displayPlan && (
              <div className="plan-card">
                <div className="plan-header">
                  <div>
                    <h2>{displayPlan.name}</h2>
                    <p className="plan-meta">
                      {displayPlan.duration_days} days • Created {new Date(displayPlan.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {displayPlan.is_active && (
                    <span className="active-badge">Active</span>
                  )}
                </div>

                <div className="plan-progress">
                  <div className="progress-info">
                    <span>
                      {displayPlan.schedule?.filter(day => day.completed).length || 0} / {displayPlan.duration_days} days completed
                    </span>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${((displayPlan.schedule?.filter(day => day.completed).length || 0) / displayPlan.duration_days) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="plan-schedule">
                  <h3>Daily Schedule</h3>
                  <div className="schedule-grid">
                    {displayPlan.schedule?.map((day, idx) => (
                      <div 
                        key={idx} 
                        className={`schedule-day ${day.completed ? 'completed' : ''}`}
                        onClick={() => !day.completed && completeDay(displayPlan.id, day.day)}
                      >
                        <div className="day-header">
                          <span className="day-number">Day {day.day}</span>
                          {day.completed ? (
                            <CheckCircle size={20} className="completed-icon" />
                          ) : (
                            <Clock size={20} className="pending-icon" />
                          )}
                        </div>
                        <div className="day-content">
                          <div className="concepts-count">
                            <Target size={16} />
                            <span>{day.concepts?.length || 0} concepts</span>
                          </div>
                          <div className="time-estimate">
                            <Clock size={16} />
                            <span>{day.estimated_time_minutes || 0} min</span>
                          </div>
                        </div>
                        {day.completed && (
                          <div className="completion-badge">Completed</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {plans.length > 1 && (
              <div className="plans-list">
                <h3>All Plans</h3>
                <div className="plans-grid">
                  {plans.map((plan) => (
                    <div key={plan.id} className="plan-item">
                      <h4>{plan.name}</h4>
                      <p>{plan.duration_days} days • {plan.schedule?.filter(d => d.completed).length || 0} completed</p>
                      {plan.is_active && <span className="active-dot">Active</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        .study-plans-page {
          min-height: 100vh;
          padding: 100px 2rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .loading-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding-top: 80px;
        }

        .spinner {
          animation: spin 1s linear infinite;
          color: #667eea;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .plans-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 3rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .header-content svg {
          color: #667eea;
        }

        .plans-header h1 {
          font-size: 2.5rem;
          font-weight: 800;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .plans-header p {
          color: rgba(255,255,255,0.7);
          margin: 0.5rem 0 0 0;
        }

        .create-plan-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 1.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .create-plan-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .empty-plans {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          text-align: center;
        }

        .empty-plans svg {
          color: #667eea;
          margin-bottom: 1.5rem;
          opacity: 0.5;
        }

        .primary-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          margin-top: 1.5rem;
        }

        .plan-card {
          background: var(--color-card-bg);
          border: 2px solid rgba(102, 126, 234, 0.3);
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .plan-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }

        .plan-header h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
        }

        .plan-meta {
          color: rgba(255,255,255,0.7);
          font-size: 0.875rem;
          margin: 0;
        }

        .active-badge {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 700;
        }

        .plan-progress {
          margin-bottom: 2rem;
        }

        .progress-info {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .progress-bar {
          width: 100%;
          height: 12px;
          background: rgba(255,255,255,0.1);
          border-radius: 6px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          transition: width 0.5s ease;
        }

        .plan-schedule h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0 0 1.5rem 0;
        }

        .schedule-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
        }

        .schedule-day {
          background: rgba(255,255,255,0.05);
          border: 2px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 1.25rem;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        .schedule-day:hover:not(.completed) {
          border-color: rgba(102, 126, 234, 0.5);
          background: rgba(102, 126, 234, 0.1);
          transform: translateY(-2px);
        }

        .schedule-day.completed {
          border-color: rgba(16, 185, 129, 0.5);
          background: rgba(16, 185, 129, 0.1);
        }

        .day-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .day-number {
          font-weight: 700;
          color: var(--color-text-light);
        }

        .completed-icon {
          color: #10b981;
        }

        .pending-icon {
          color: rgba(255,255,255,0.5);
        }

        .day-content {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .concepts-count, .time-estimate {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: rgba(255,255,255,0.7);
        }

        .completion-badge {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: #10b981;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .plans-list {
          margin-top: 3rem;
        }

        .plans-list h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
        }

        .plans-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1rem;
        }

        .plan-item {
          background: var(--color-card-bg);
          border: 2px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 1.5rem;
          position: relative;
        }

        .plan-item h4 {
          margin: 0 0 0.5rem 0;
          font-weight: 700;
        }

        .plan-item p {
          color: rgba(255,255,255,0.7);
          margin: 0;
          font-size: 0.875rem;
        }

        .active-dot {
          position: absolute;
          top: 1rem;
          right: 1rem;
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
        }

        @media (max-width: 768px) {
          .study-plans-page {
            padding: 80px 1rem 1rem;
          }

          .plans-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .schedule-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  )
}




