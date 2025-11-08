import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { NavigationHeader } from '../components/NavigationHeader'
import { Users, Plus, UserPlus, Share2, Trophy, Target, Zap, Calendar, 
         Lock, Globe, FolderPlus, BookOpen, Copy, Check, Gift, Sparkles } from 'lucide-react'

export const CollaborationPage = () => {
  const [userGroups, setUserGroups] = useState([])
  const [publicGroups, setPublicGroups] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('my-groups')
  const [copiedInvite, setCopiedInvite] = useState(null)
  const [showInviteModal, setShowInviteModal] = useState(null)
  const [referralReward, setReferralReward] = useState(null)
  const userId = 'demo_user_123'
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    is_public: false
  })

  useEffect(() => {
    // Check for invite code in URL
    const pathParts = window.location.pathname.split('/')
    const inviteIndex = pathParts.indexOf('join')
    if (inviteIndex !== -1 && pathParts[inviteIndex + 1]) {
      const inviteCode = pathParts[inviteIndex + 1]
      handleInviteJoin(inviteCode)
    } else {
      loadGroups()
    }
  }, [searchParams])

  const handleInviteJoin = async (inviteCode) => {
    try {
      const result = await api.getGroupByInvite(inviteCode)
      if (result.success && result.group) {
        setShowInviteModal({ code: inviteCode, group: result.group })
      } else {
        alert('Invalid invite code')
        navigate('/collaboration')
      }
    } catch (error) {
      console.error('Failed to load invite:', error)
      alert('Invalid invite code')
      navigate('/collaboration')
    }
  }

  const loadGroups = async () => {
    try {
      setLoading(true)
      const [userData, publicData] = await Promise.all([
        api.getUserGroups(userId),
        api.getPublicGroups()
      ])
      setUserGroups(userData.groups || [])
      setPublicGroups(publicData.groups || [])
    } catch (error) {
      console.error('Failed to load groups:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateGroup = async () => {
    try {
      const result = await api.createStudyGroup(
        userId,
        newGroup.name,
        newGroup.description,
        newGroup.is_public
      )
      if (result.success) {
        await loadGroups()
        setShowCreateModal(false)
        setNewGroup({ name: '', description: '', is_public: false })
      }
    } catch (error) {
      console.error('Failed to create group:', error)
    }
  }

  const handleJoinGroup = async (groupId, referrerId = null) => {
    try {
      const result = await api.joinGroup(userId, groupId, referrerId)
      if (result.success) {
        await loadGroups()
        if (result.referral_reward) {
          setReferralReward(result.referral_reward)
          setTimeout(() => setReferralReward(null), 5000)
        }
      }
    } catch (error) {
      console.error('Failed to join group:', error)
    }
  }

  const handleJoinByInvite = async (inviteCode) => {
    try {
      const result = await api.joinGroupByInvite(userId, inviteCode)
      if (result.success) {
        await loadGroups()
        if (result.referral_reward) {
          setReferralReward(result.referral_reward)
          setTimeout(() => setReferralReward(null), 5000)
        }
        setShowInviteModal(null)
        navigate('/collaboration')
      }
    } catch (error) {
      console.error('Failed to join group:', error)
      alert('Failed to join group. Invalid invite code.')
    }
  }

  const copyInviteLink = (inviteCode) => {
    const inviteLink = `${window.location.origin}/collaboration/join/${inviteCode}`
    navigator.clipboard.writeText(inviteLink)
    setCopiedInvite(inviteCode)
    setTimeout(() => setCopiedInvite(null), 2000)
  }

  if (loading && !showInviteModal) {
    return (
      <>
        <NavigationHeader />
        <div className="loading-container">
          <Users className="spinner" size={48} />
          <p>Loading study groups...</p>
        </div>
      </>
    )
  }

  return (
    <>
      <NavigationHeader />
      <div className="collaboration-page">
        <div className="collaboration-header">
          <Users size={40} />
          <div>
            <h1>Study Groups & Collaboration</h1>
            <p>Learn together, share materials, and compete in challenges</p>
          </div>
          <button 
            className="create-group-btn"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={20} />
            <span>Create Group</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="collaboration-tabs">
          <button 
            className={`tab-btn ${activeTab === 'my-groups' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-groups')}
          >
            <Users size={18} />
            My Groups ({userGroups.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'discover' ? 'active' : ''}`}
            onClick={() => setActiveTab('discover')}
          >
            <Globe size={18} />
            Discover ({publicGroups.length})
          </button>
        </div>

        {/* My Groups */}
        {activeTab === 'my-groups' && (
          <div className="groups-section">
            {userGroups.length === 0 ? (
              <div className="empty-state">
                <Users size={64} />
                <h3>No Study Groups Yet</h3>
                <p>Create your first study group or join a public one</p>
                <button 
                  className="primary-btn"
                  onClick={() => setShowCreateModal(true)}
                >
                  <Plus size={20} />
                  Create Your First Group
                </button>
              </div>
            ) : (
              <div className="groups-grid">
                {userGroups.map(group => (
                  <GroupCard 
                    key={group.id} 
                    group={group} 
                    userId={userId}
                    isMember={true}
                    onInvite={copyInviteLink}
                    copiedInvite={copiedInvite}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Discover Groups */}
        {activeTab === 'discover' && (
          <div className="groups-section">
            {publicGroups.length === 0 ? (
              <div className="empty-state">
                <Globe size={64} />
                <h3>No Public Groups</h3>
                <p>Be the first to create a public study group!</p>
              </div>
            ) : (
              <div className="groups-grid">
                {publicGroups.map(group => (
                  <GroupCard 
                    key={group.id} 
                    group={group} 
                    userId={userId}
                    isMember={group.members?.includes(userId)}
                    onJoin={() => handleJoinGroup(group.id)}
                    onInvite={copyInviteLink}
                    copiedInvite={copiedInvite}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Study Group</h3>
              <button onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Group Name</label>
                <input
                  type="text"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  placeholder="e.g., Biology 101 Study Group"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  placeholder="Describe your study group..."
                  rows={4}
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={newGroup.is_public}
                    onChange={(e) => setNewGroup({ ...newGroup, is_public: e.target.checked })}
                  />
                  Make this group public (others can discover and join)
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
              <button className="create-btn" onClick={handleCreateGroup}>
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Referral Reward Notification */}
      {referralReward && (
        <div className="referral-reward-notification">
          <div className="reward-content">
            <Sparkles size={24} />
            <div>
              <h4>Referral Reward!</h4>
              <p>
                You earned {referralReward.credits_awarded} credits!
                {referralReward.milestone_reward && (
                  <span className="milestone-badge">
                    🎉 Milestone Bonus: +{referralReward.milestone_credits} credits & {referralReward.milestone_coins} coins!
                  </span>
                )}
              </p>
              <p className="referral-count">Total Referrals: {referralReward.total_referrals}</p>
            </div>
          </div>
        </div>
      )}

      {/* Invite Join Modal */}
      {showInviteModal && (
        <div className="modal-overlay" onClick={() => { setShowInviteModal(null); navigate('/collaboration') }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Join Study Group</h3>
              <button onClick={() => { setShowInviteModal(null); navigate('/collaboration') }}>×</button>
            </div>
            <div className="modal-body">
              {showInviteModal.group ? (
                <>
                  <h4>{showInviteModal.group.name}</h4>
                  {showInviteModal.group.description && (
                    <p>{showInviteModal.group.description}</p>
                  )}
                  <div className="group-preview-stats">
                    <div>
                      <Users size={18} />
                      <span>{showInviteModal.group.member_count || 0} members</span>
                    </div>
                  </div>
                  <button 
                    className="join-invite-btn"
                    onClick={() => handleJoinByInvite(showInviteModal.code)}
                  >
                    <UserPlus size={18} />
                    Join Group
                  </button>
                </>
              ) : (
                <p>Loading group details...</p>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .collaboration-page {
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
          color: #667eea;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .collaboration-header {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 2px solid rgba(255, 255, 255, 0.1);
        }

        .collaboration-header svg {
          color: #667eea;
        }

        .collaboration-header h1 {
          flex: 1;
          font-size: 2.5rem;
          font-weight: 800;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .collaboration-header p {
          color: rgba(255, 255, 255, 0.7);
          margin: 0.5rem 0 0 0;
        }

        .create-group-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 1.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .create-group-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .collaboration-tabs {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 2rem;
          border-bottom: 2px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 0.5rem;
        }

        .tab-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          color: rgba(255, 255, 255, 0.7);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: -2px;
        }

        .tab-btn:hover {
          color: rgba(255, 255, 255, 0.9);
        }

        .tab-btn.active {
          color: #667eea;
          border-bottom-color: #667eea;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          text-align: center;
        }

        .empty-state svg {
          color: #667eea;
          opacity: 0.5;
          margin-bottom: 1.5rem;
        }

        .empty-state h3 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .empty-state p {
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 2rem;
        }

        .primary-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 700;
          cursor: pointer;
        }

        .groups-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .group-card {
          background: var(--color-card-bg);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 1.5rem;
          transition: all 0.3s ease;
        }

        .group-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
          border-color: rgba(102, 126, 234, 0.5);
        }

        .group-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .group-title {
          flex: 1;
        }

        .group-title h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--color-text-primary);
        }

        .group-meta {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .group-description {
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 1rem;
          font-size: 0.9375rem;
          line-height: 1.6;
        }

        .invite-section {
          background: linear-gradient(135deg, rgba(74, 144, 226, 0.1) 0%, rgba(80, 227, 194, 0.1) 100%);
          border: 2px solid rgba(74, 144, 226, 0.2);
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1rem;
        }

        .invite-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
          font-weight: 600;
          font-size: 0.875rem;
          color: #4A90E2;
        }

        .invite-link-container {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .invite-link-input {
          flex: 1;
          padding: 0.625rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: white;
          font-size: 0.875rem;
          font-family: 'JetBrains Mono', monospace;
        }

        .copy-invite-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1rem;
          background: linear-gradient(135deg, #4A90E2 0%, #50E3C2 100%);
          border: none;
          border-radius: 8px;
          color: white;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .copy-invite-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(74, 144, 226, 0.4);
        }

        .referral-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.7);
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 6px;
        }

        .referral-info svg {
          color: #50E3C2;
        }

        .group-stats {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
          padding: 1rem;
          background: rgba(102, 126, 234, 0.1);
          border-radius: 8px;
        }

        .group-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
        }

        .group-stat-value {
          font-size: 1.5rem;
          font-weight: 800;
          color: #667eea;
        }

        .group-stat-label {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.7);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .group-actions {
          display: flex;
          gap: 0.75rem;
        }

        .action-btn {
          flex: 1;
          padding: 0.75rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .join-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .view-btn {
          background: rgba(102, 126, 234, 0.2);
          color: white;
          border: 1px solid rgba(102, 126, 234, 0.3);
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.3s ease;
        }

        .modal-content {
          background: var(--color-card-bg);
          border: 2px solid rgba(102, 126, 234, 0.3);
          border-radius: 16px;
          padding: 2rem;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-text-primary);
        }

        .modal-header button {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.5rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: var(--color-text-primary);
          font-weight: 600;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: white;
          font-size: 1rem;
          font-family: inherit;
        }

        .form-group input[type="checkbox"] {
          width: auto;
          margin-right: 0.5rem;
        }

        .modal-footer {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 2rem;
        }

        .cancel-btn,
        .create-btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        }

        .cancel-btn {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .create-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .referral-reward-notification {
          position: fixed;
          top: 100px;
          right: 2rem;
          background: linear-gradient(135deg, rgba(74, 144, 226, 0.95) 0%, rgba(80, 227, 194, 0.95) 100%);
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 16px;
          padding: 1.5rem;
          z-index: 10000;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          animation: slideInRight 0.3s ease;
          max-width: 400px;
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .reward-content {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }

        .reward-content svg {
          color: white;
          flex-shrink: 0;
        }

        .reward-content h4 {
          margin: 0 0 0.5rem 0;
          font-size: 1.125rem;
          font-weight: 700;
          color: white;
        }

        .reward-content p {
          margin: 0 0 0.25rem 0;
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.9375rem;
        }

        .milestone-badge {
          display: block;
          margin-top: 0.5rem;
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          font-weight: 600;
        }

        .referral-count {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.8);
          font-weight: 600;
        }

        .join-invite-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 1rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          margin-top: 1rem;
          transition: all 0.3s ease;
        }

        .join-invite-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .group-preview-stats {
          display: flex;
          gap: 1rem;
          margin: 1rem 0;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
        }

        .group-preview-stats div {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(255, 255, 255, 0.8);
        }

        @media (max-width: 768px) {
          .collaboration-page {
            padding: 80px 1rem 1rem;
          }

          .collaboration-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .groups-grid {
            grid-template-columns: 1fr;
          }

          .referral-reward-notification {
            right: 1rem;
            left: 1rem;
            max-width: none;
          }
        }
      `}</style>
    </>
  )
}

const GroupCard = ({ group, userId, isMember, onJoin, onInvite, copiedInvite }) => {
  const isCreator = group.creator_id === userId
  const inviteCode = group.invite_code
  const inviteLink = inviteCode ? `${window.location.origin}/collaboration/join/${inviteCode}` : null

  return (
    <div className="group-card">
      <div className="group-header">
        <div className="group-title">
          <h3>{group.name}</h3>
          <div className="group-meta">
            {group.is_public ? (
              <>
                <Globe size={14} />
                <span>Public</span>
              </>
            ) : (
              <>
                <Lock size={14} />
                <span>Private</span>
              </>
            )}
            <span>•</span>
            <Users size={14} />
            <span>{group.member_count || group.members?.length || 0} members</span>
          </div>
        </div>
      </div>

      {group.description && (
        <p className="group-description">{group.description}</p>
      )}

      {/* Invite Link Section - Show for members */}
      {isMember && inviteCode && (
        <div className="invite-section">
          <div className="invite-header">
            <Share2 size={16} />
            <span>Invite Link</span>
          </div>
          <div className="invite-link-container">
            <input 
              type="text" 
              value={inviteLink} 
              readOnly 
              className="invite-link-input"
            />
            <button 
              className="copy-invite-btn"
              onClick={() => onInvite(inviteCode)}
            >
              {copiedInvite === inviteCode ? (
                <>
                  <Check size={16} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={16} />
                  Copy
                </>
              )}
            </button>
          </div>
          <div className="referral-info">
            <Gift size={14} />
            <span>Earn 10 credits per referral • 100 credits + 50 coins at 5 referrals!</span>
          </div>
        </div>
      )}

      <div className="group-stats">
        <div className="group-stat">
          <div className="group-stat-value">{group.shared_folders?.length || 0}</div>
          <div className="group-stat-label">Folders</div>
        </div>
        <div className="group-stat">
          <div className="group-stat-value">{group.shared_quizzes?.length || 0}</div>
          <div className="group-stat-label">Quizzes</div>
        </div>
        <div className="group-stat">
          <div className="group-stat-value">{group.challenges?.length || 0}</div>
          <div className="group-stat-label">Challenges</div>
        </div>
      </div>

      <div className="group-actions">
        {isMember ? (
          <button className="action-btn view-btn">
            <BookOpen size={18} />
            View Group
          </button>
        ) : (
          <button className="action-btn join-btn" onClick={onJoin}>
            <UserPlus size={18} />
            Join Group
          </button>
        )}
      </div>
    </div>
  )
}
