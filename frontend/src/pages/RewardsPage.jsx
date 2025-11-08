import React, { useState, useEffect } from 'react'
import { api } from '../services/api'
import { NavigationHeader } from '../components/NavigationHeader'
import { Coins, Gift, Sparkles, TrendingUp, Zap, Star, Award, ShoppingCart, CheckCircle, Lock } from 'lucide-react'

export const RewardsPage = () => {
  const [rewards, setRewards] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [purchasing, setPurchasing] = useState(null)
  const userId = 'demo_user_123'

  useEffect(() => {
    loadRewards()
  }, [])

  const loadRewards = async () => {
    try {
      const data = await api.getRewards(userId)
      setRewards(data)
    } catch (error) {
      console.error('Failed to load rewards:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async (item) => {
    if (purchasing) return
    
    setPurchasing(item.id)
    try {
      const result = await api.spendRewards(userId, item.id, item.cost)
      if (result.success) {
        await loadRewards() // Reload to update credits
        // Show success notification
        setTimeout(() => setPurchasing(null), 2000)
      } else {
        alert(result.error || 'Purchase failed')
        setPurchasing(null)
      }
    } catch (error) {
      alert('Failed to purchase item')
      setPurchasing(null)
    }
  }

  if (loading) {
    return (
      <>
        <NavigationHeader />
        <div className="loading-container">
          <Coins className="spinner" size={48} />
          <p>Loading rewards...</p>
        </div>
      </>
    )
  }

  const summary = rewards?.summary || {}
  const availableRewards = rewards?.available_rewards || []
  
  const filteredRewards = selectedCategory === 'all'
    ? availableRewards
    : availableRewards.filter(r => r.category === selectedCategory)

  const categories = ['all', 'premium_features', 'power_ups', 'customization', 'educational']
  const categoryLabels = {
    'all': 'All Rewards',
    'premium_features': 'Premium Features',
    'power_ups': 'Power-ups',
    'customization': 'Customization',
    'educational': 'Educational'
  }

  return (
    <>
      <NavigationHeader />
      <div className="rewards-page">
        {/* Header with Credits Display */}
        <div className="rewards-header">
          <div className="credits-display">
            <div className="credit-card primary">
              <Coins size={32} />
              <div>
                <div className="credit-label">Learning Credits</div>
                <div className="credit-value">{summary.learning_credits || 0}</div>
              </div>
            </div>
            <div className="credit-card secondary">
              <Star size={28} />
              <div>
                <div className="credit-label">Level {summary.level || 1}</div>
                <div className="credit-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${summary.level_progress_percent || 0}%` }}
                    />
                  </div>
                  <span>{summary.xp_progress || 0} / {summary.xp_for_next_level || 1000} XP</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Earning Guide */}
        <div className="earning-guide">
          <h2>How to Earn Credits</h2>
          <div className="earning-methods">
            <div className="earning-method">
              <CheckCircle size={20} />
              <span>Answer question correctly: <strong>+10 LC</strong></span>
            </div>
            <div className="earning-method">
              <CheckCircle size={20} />
              <span>Answer question (learning): <strong>+5 LC</strong></span>
            </div>
            <div className="earning-method">
              <CheckCircle size={20} />
              <span>Master a concept: <strong>+100 LC</strong></span>
            </div>
            <div className="earning-method">
              <CheckCircle size={20} />
              <span>Upload document: <strong>+200 LC</strong></span>
            </div>
            <div className="earning-method">
              <CheckCircle size={20} />
              <span>Daily login: <strong>+10 LC</strong></span>
            </div>
            <div className="earning-method">
              <CheckCircle size={20} />
              <span>Streak bonus: <strong>+25 LC/day</strong></span>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="category-filters">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
            >
              {categoryLabels[cat]}
            </button>
          ))}
        </div>

        {/* Rewards Grid */}
        <div className="rewards-grid">
          {filteredRewards.map((reward) => {
            const canAfford = (summary.learning_credits || 0) >= reward.cost
            const isPurchasing = purchasing === reward.id

            return (
              <div 
                key={reward.id} 
                className={`reward-card ${canAfford ? 'affordable' : 'expensive'} ${isPurchasing ? 'purchasing' : ''}`}
              >
                <div className="reward-icon">
                  {reward.category === 'premium_features' && <Sparkles size={32} />}
                  {reward.category === 'power_ups' && <Zap size={32} />}
                  {reward.category === 'customization' && <Gift size={32} />}
                  {reward.category === 'educational' && <Award size={32} />}
                </div>
                
                <div className="reward-info">
                  <h3>{reward.name}</h3>
                  <p>{reward.description}</p>
                  
                  <div className="reward-cost">
                    <Coins size={20} />
                    <span>{reward.cost} LC</span>
                  </div>
                </div>

                <button
                  onClick={() => handlePurchase(reward)}
                  disabled={!canAfford || isPurchasing}
                  className={`purchase-btn ${canAfford ? '' : 'disabled'}`}
                >
                  {isPurchasing ? (
                    <>
                      <Sparkles className="spinner" size={18} />
                      <span>Purchasing...</span>
                    </>
                  ) : canAfford ? (
                    <>
                      <ShoppingCart size={18} />
                      <span>Redeem</span>
                    </>
                  ) : (
                    <>
                      <Lock size={18} />
                      <span>Need {reward.cost - (summary.learning_credits || 0)} more</span>
                    </>
                  )}
                </button>
              </div>
            )
          })}
        </div>

        {/* Recent Transactions */}
        {summary.total_transactions > 0 && (
          <div className="recent-transactions">
            <h2>Recent Activity</h2>
            <p className="transaction-note">
              You've earned credits from {summary.total_transactions} activities
            </p>
          </div>
        )}
      </div>

      <style>{`
        .rewards-page {
          min-height: 100vh;
          padding: 100px 2rem 2rem;
          max-width: 1400px;
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
          color: var(--color-primary);
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .rewards-header {
          margin-bottom: 3rem;
        }

        .credits-display {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .credit-card {
          background: var(--color-bg-card);
          border: 2px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 2rem;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          transition: all 0.3s ease;
        }

        .credit-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
        }

        .credit-card.primary {
          border-color: rgba(74, 144, 226, 0.5);
          background: linear-gradient(135deg, rgba(74, 144, 226, 0.1) 0%, rgba(80, 227, 194, 0.1) 100%);
        }

        .credit-card.primary svg {
          color: var(--color-primary);
        }

        .credit-card.secondary {
          border-color: rgba(251, 191, 36, 0.5);
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%);
        }

        .credit-card.secondary svg {
          color: #fbbf24;
        }

        .credit-label {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 0.5rem;
        }

        .credit-value {
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--color-text-primary);
        }

        .credit-progress {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          width: 100%;
        }

        .progress-bar {
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%);
          border-radius: var(--radius-full);
          transition: width 0.3s ease;
        }

        .credit-progress span {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
        }

        .earning-guide {
          background: var(--color-bg-card);
          border: 2px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .earning-guide h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          color: var(--color-text-primary);
        }

        .earning-methods {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .earning-method {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: rgba(74, 144, 226, 0.1);
          border-radius: var(--radius-md);
        }

        .earning-method svg {
          color: var(--color-success);
          flex-shrink: 0;
        }

        .earning-method span {
          color: var(--color-text-primary);
          font-size: 0.9375rem;
        }

        .earning-method strong {
          color: var(--color-primary);
        }

        .category-filters {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .category-btn {
          padding: 0.75rem 1.5rem;
          background: var(--color-bg-card);
          border: 2px solid var(--color-border);
          border-radius: var(--radius-md);
          color: var(--color-text-secondary);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .category-btn:hover {
          background: var(--color-button-hover);
          border-color: var(--color-border-hover);
        }

        .category-btn.active {
          background: linear-gradient(135deg, var(--color-gradient-start) 0%, var(--color-gradient-end) 100%);
          border-color: transparent;
          color: white;
        }

        .rewards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .reward-card {
          background: var(--color-bg-card);
          border: 2px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          transition: all 0.3s ease;
          position: relative;
        }

        .reward-card.affordable {
          border-color: rgba(74, 144, 226, 0.5);
        }

        .reward-card.affordable:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
        }

        .reward-card.expensive {
          opacity: 0.7;
        }

        .reward-card.purchasing {
          pointer-events: none;
          opacity: 0.8;
        }

        .reward-icon {
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(74, 144, 226, 0.2), rgba(80, 227, 194, 0.2));
          border-radius: var(--radius-md);
          color: var(--color-primary);
        }

        .reward-info {
          flex: 1;
        }

        .reward-info h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          color: var(--color-text-primary);
        }

        .reward-info p {
          color: var(--color-text-secondary);
          margin: 0 0 1rem 0;
          font-size: 0.9375rem;
          line-height: 1.5;
        }

        .reward-cost {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--color-primary);
        }

        .purchase-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.875rem 1.5rem;
          background: linear-gradient(135deg, var(--color-gradient-start) 0%, var(--color-gradient-end) 100%);
          border: none;
          border-radius: var(--radius-md);
          color: white;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .purchase-btn:hover:not(.disabled) {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .purchase-btn.disabled {
          background: rgba(255, 255, 255, 0.1);
          color: var(--color-text-secondary);
          cursor: not-allowed;
        }

        .recent-transactions {
          background: var(--color-bg-card);
          border: 2px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 2rem;
          text-align: center;
        }

        .recent-transactions h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: var(--color-text-primary);
        }

        .transaction-note {
          color: var(--color-text-secondary);
          font-size: 0.9375rem;
        }

        @media (max-width: 768px) {
          .rewards-page {
            padding: 80px 1rem 1rem;
          }

          .credits-display {
            grid-template-columns: 1fr;
          }

          .rewards-grid {
            grid-template-columns: 1fr;
          }

          .earning-methods {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  )
}


