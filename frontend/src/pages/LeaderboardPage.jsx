import React, { useState, useEffect } from 'react'
import { api } from '../services/api'
import { NavigationHeader } from '../components/NavigationHeader'
import { Trophy, TrendingUp, Users, Zap, Award, Crown, Medal, Star } from 'lucide-react'

export const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([])
  const [userRank, setUserRank] = useState(null)
  const [loading, setLoading] = useState(true)
  const userId = 'demo_user_123'

  useEffect(() => {
    loadLeaderboard()
  }, [])

  const loadLeaderboard = async () => {
    try {
      setLoading(true)
      // Mock leaderboard data - in production, this would come from backend
      const progress = await api.getUserProgress(userId)
      const streaks = await api.getStreaks(userId)
      const achievements = await api.getAchievements(userId)
      
      // Calculate score based on multiple factors
      const score = calculateScore(progress, streaks, achievements)
      
      // Mock leaderboard with demo user
      const mockLeaderboard = [
        {
          id: userId,
          name: 'You',
          score: score,
          accuracy: progress.accuracy,
          streak: streaks.current_streak,
          achievements: achievements.unlocked.length,
          isCurrentUser: true
        },
        {
          id: 'user_2',
          name: 'Alex Chen',
          score: score + 150,
          accuracy: 89,
          streak: 12,
          achievements: 8,
          isCurrentUser: false
        },
        {
          id: 'user_3',
          name: 'Sarah Johnson',
          score: score + 100,
          accuracy: 92,
          streak: 15,
          achievements: 10,
          isCurrentUser: false
        },
        {
          id: 'user_4',
          name: 'Michael Park',
          score: score + 50,
          accuracy: 85,
          streak: 8,
          achievements: 6,
          isCurrentUser: false
        },
        {
          id: 'user_5',
          name: 'Emma Williams',
          score: score - 20,
          accuracy: 78,
          streak: 5,
          achievements: 4,
          isCurrentUser: false
        }
      ].sort((a, b) => b.score - a.score)

      setLeaderboard(mockLeaderboard)
      const rank = mockLeaderboard.findIndex(u => u.id === userId) + 1
      setUserRank(rank)
    } catch (error) {
      console.error('Failed to load leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateScore = (progress, streaks, achievements) => {
    return (
      (progress.total_questions * 10) +
      (progress.accuracy * 5) +
      (streaks.current_streak * 20) +
      (achievements.unlocked.length * 50) +
      (progress.concepts_learned * 30)
    )
  }

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown size={24} className="rank-icon gold" />
    if (rank === 2) return <Medal size={24} className="rank-icon silver" />
    if (rank === 3) return <Medal size={24} className="rank-icon bronze" />
    return <span className="rank-number">{rank}</span>
  }

  if (loading) {
    return (
      <>
        <NavigationHeader />
        <div className="leaderboard-loading">
          <Trophy className="spinner" size={48} />
          <p>Loading leaderboard...</p>
        </div>
      </>
    )
  }

  return (
    <>
      <NavigationHeader />
      <div className="leaderboard-page">
        <div className="leaderboard-header">
          <div className="header-content">
            <Trophy size={48} />
            <div>
              <h1>Global Leaderboard</h1>
              <p>Compete with learners worldwide</p>
            </div>
          </div>
          {userRank && (
            <div className="user-rank-badge">
              <span className="rank-label">Your Rank</span>
              <span className="rank-value">#{userRank}</span>
            </div>
          )}
        </div>

        <div className="leaderboard-stats">
          <div className="stat-card">
            <Users size={24} />
            <div>
              <div className="stat-value">{leaderboard.length}</div>
              <div className="stat-label">Active Learners</div>
            </div>
          </div>
          <div className="stat-card">
            <Zap size={24} />
            <div>
              <div className="stat-value">{leaderboard.reduce((sum, u) => sum + u.streak, 0)}</div>
              <div className="stat-label">Total Streaks</div>
            </div>
          </div>
          <div className="stat-card">
            <Award size={24} />
            <div>
              <div className="stat-value">{leaderboard.reduce((sum, u) => sum + u.achievements, 0)}</div>
              <div className="stat-label">Achievements Unlocked</div>
            </div>
          </div>
        </div>

        <div className="leaderboard-list">
          {leaderboard.map((user, index) => (
            <div 
              key={user.id} 
              className={`leaderboard-item ${user.isCurrentUser ? 'current-user' : ''} rank-${index + 1}`}
            >
              <div className="rank-section">
                {getRankIcon(index + 1)}
              </div>

              <div className="user-info">
                <div className="user-name">
                  {user.name}
                  {user.isCurrentUser && <span className="you-badge">You</span>}
                </div>
                <div className="user-stats">
                  <span className="stat-badge">
                    <TrendingUp size={14} />
                    {user.accuracy}% Accuracy
                  </span>
                  <span className="stat-badge">
                    <Zap size={14} />
                    {user.streak} Day Streak
                  </span>
                  <span className="stat-badge">
                    <Award size={14} />
                    {user.achievements} Achievements
                  </span>
                </div>
              </div>

              <div className="score-section">
                <div className="score-value">{user.score.toLocaleString()}</div>
                <div className="score-label">Points</div>
              </div>
            </div>
          ))}
        </div>

        <div className="leaderboard-footer">
          <p>📊 Rankings update daily based on your learning activity</p>
          <p className="footer-note">Keep studying to climb the leaderboard!</p>
        </div>

        <style>{`
          .leaderboard-page {
            min-height: 100vh;
            padding: 2rem;
            padding-top: 100px;
            max-width: 1000px;
            margin: 0 auto;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          }

          .leaderboard-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 60vh;
            gap: 1rem;
          }

          .spinner {
            animation: spin 1s linear infinite;
            color: #667eea;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          .leaderboard-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            padding-bottom: 1.5rem;
            border-bottom: 2px solid rgba(102, 126, 234, 0.3);
          }

          .header-content {
            display: flex;
            align-items: center;
            gap: 1rem;
          }

          .header-content svg {
            color: #667eea;
          }

          .header-content h1 {
            font-size: 2.5rem;
            font-weight: 800;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .header-content p {
            color: rgba(255,255,255,0.7);
            margin: 0.25rem 0 0 0;
          }

          .user-rank-badge {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 1rem 1.5rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            color: white;
          }

          .rank-label {
            font-size: 0.875rem;
            opacity: 0.9;
          }

          .rank-value {
            font-size: 2rem;
            font-weight: 800;
          }

          .leaderboard-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
          }

          .stat-card {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1.5rem;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 12px;
          }

          .stat-card svg {
            color: #667eea;
          }

          .stat-value {
            font-size: 1.5rem;
            font-weight: 800;
            color: white;
          }

          .stat-label {
            font-size: 0.875rem;
            color: rgba(255,255,255,0.7);
          }

          .leaderboard-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            margin-bottom: 2rem;
          }

          .leaderboard-item {
            display: flex;
            align-items: center;
            gap: 1.5rem;
            padding: 1.5rem;
            background: rgba(255,255,255,0.05);
            border: 2px solid rgba(255,255,255,0.1);
            border-radius: 16px;
            transition: all 0.3s ease;
          }

          .leaderboard-item:hover {
            border-color: rgba(102, 126, 234, 0.5);
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);
          }

          .leaderboard-item.current-user {
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
            border-color: #667eea;
          }

          .leaderboard-item.rank-1 {
            background: linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.2) 100%);
            border-color: #fbbf24;
          }

          .leaderboard-item.rank-2 {
            background: linear-gradient(135deg, rgba(156, 163, 175, 0.2) 0%, rgba(107, 114, 128, 0.2) 100%);
            border-color: #9ca3af;
          }

          .leaderboard-item.rank-3 {
            background: linear-gradient(135deg, rgba(180, 83, 9, 0.2) 0%, rgba(154, 52, 18, 0.2) 100%);
            border-color: #b45309;
          }

          .rank-section {
            display: flex;
            align-items: center;
            justify-content: center;
            min-width: 50px;
          }

          .rank-icon {
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
          }

          .rank-icon.gold {
            color: #fbbf24;
          }

          .rank-icon.silver {
            color: #9ca3af;
          }

          .rank-icon.bronze {
            color: #b45309;
          }

          .rank-number {
            font-size: 1.5rem;
            font-weight: 800;
            color: rgba(255,255,255,0.7);
          }

          .user-info {
            flex: 1;
            min-width: 0;
          }

          .user-name {
            font-size: 1.25rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .you-badge {
            padding: 0.25rem 0.75rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 700;
          }

          .user-stats {
            display: flex;
            flex-wrap: wrap;
            gap: 0.75rem;
          }

          .stat-badge {
            display: flex;
            align-items: center;
            gap: 0.25rem;
            padding: 0.25rem 0.75rem;
            background: rgba(255,255,255,0.1);
            border-radius: 20px;
            font-size: 0.875rem;
            color: rgba(255,255,255,0.8);
          }

          .score-section {
            text-align: right;
          }

          .score-value {
            font-size: 1.5rem;
            font-weight: 800;
            color: #667eea;
          }

          .score-label {
            font-size: 0.875rem;
            color: rgba(255,255,255,0.7);
          }

          .leaderboard-footer {
            text-align: center;
            padding: 2rem;
            color: rgba(255,255,255,0.7);
          }

          .footer-note {
            margin-top: 0.5rem;
            font-weight: 600;
            color: #667eea;
          }

          @media (max-width: 768px) {
            .leaderboard-page {
              padding: 1rem;
              padding-top: 80px;
            }

            .leaderboard-header {
              flex-direction: column;
              align-items: flex-start;
              gap: 1rem;
            }

            .user-stats {
              flex-direction: column;
              gap: 0.5rem;
            }
          }
        `}</style>
      </div>
    </>
  )
}




